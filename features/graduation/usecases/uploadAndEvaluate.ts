/**
 * This is the main orchestration layer (UseCase).
 * It connects Validation -> Normalization -> Engine -> Data -> Refine.
 */
import { resolveMajorForEvaluation } from '../domain/academic-context';
import type { MinorDeclarationTerms } from '../domain/types';
import { parseRawToTakenCourses, validateTakenCourses, normalizeTakenCourses } from '../middlewares/validation';
import { evaluateGraduationStatus } from '../domain/engine';
import { mapDeficitToRecommendations, MockCourseRepository } from '../data';
import { refineGradStatusForUI, UIGradViewModel } from '../middlewares/refine';

export interface UploadEvaluateResult {
  success: boolean;
  data?: UIGradViewModel;
  errors?: string[];
}

interface EvaluateOptions {
  entryYear?: number;
  userMajor?: string;
  userMinors?: string[];
  minorDeclarationTerms?: MinorDeclarationTerms;
}

/**
 * Orchestrates the graduation evaluation pipeline.
 * Extracts metadata (year, major) from raw input if not explicitly provided.
 */
export const uploadAndEvaluate = async (
  rawInput: unknown,
  options: EvaluateOptions = {},
): Promise<UploadEvaluateResult> => {
  let { entryYear, userMajor, userMinors, minorDeclarationTerms } = options;
  // throw new Error('VERIFICATION: I am running the correct file');

  // 0. Metadata Extraction from Raw Input
  // Attempt to find studentId or other metadata to infer context
  if (rawInput && typeof rawInput === 'object') {
    const rawObj = rawInput as any;

    // Infer Entry Year from studentId (e.g., "20205098" -> 2020)
    if (!entryYear && rawObj.studentId && typeof rawObj.studentId === 'string') {
      const inferred = parseInt(rawObj.studentId.substring(0, 4));
      if (!isNaN(inferred) && inferred > 2000 && inferred < 2100) {
        entryYear = inferred;
      }
    }
  }

  // Fallback to default if still undefined
  if (!entryYear) {
    entryYear = 2020;
  }

  // 1. Parse
  const parsed = parseRawToTakenCourses(rawInput);

  // 2. Validate
  const validation = validateTakenCourses(parsed);
  if (!validation.ok) {
    return { success: false, errors: validation.errors };
  }

  // 3. Normalize
  const normalized = normalizeTakenCourses(validation.value!);

  // 3.5. Resolve Major Context
  const requestedUserMajor = userMajor;
  const majorResolution = resolveMajorForEvaluation(userMajor, normalized.takenCourses);
  userMajor =
    majorResolution.code ??
    (requestedUserMajor && majorResolution.status !== 'missing' ? requestedUserMajor : undefined);

  // 4. Evaluate (Engine)
  const engineResult = await evaluateGraduationStatus({
    takenCourses: normalized,
    ruleContext: {
      entryYear,
      userMajor,
      userMinors,
      minorDeclarationTerms,
    },
  });

  // 5. Data / Recommendations (Optional)
  let recommendations: any[] = [];
  if (!engineResult.totalSatisfied) {
    const needsReviewCategories = new Set<string>(
      engineResult.fineGrainedRequirements
        .filter((requirement) => requirement.status === 'needs_review')
        .map((requirement) => requirement.categoryKey),
    );
    const deficits: Record<string, number> = {};
    Object.entries(engineResult.graduationCategory).forEach(([key, category]) => {
      if (!category.satisfied && !needsReviewCategories.has(key)) {
        deficits[key] = category.minConditionCredits - category.totalCredits;
      }
    });

    const repo = new MockCourseRepository();
    recommendations = await mapDeficitToRecommendations(deficits, repo);
  }

  // 6. Refine for UI
  const viewModel = refineGradStatusForUI(engineResult, { recommendations });

  return { success: true, data: viewModel };
};
