/**
 * This is the main orchestration layer (UseCase).
 * It connects Validation -> Normalization -> Engine -> Data -> Refine.
 */
import { COMMON_MAJOR_PREFIXES } from '../domain/constants';
import { parseRawToTakenCourses, validateTakenCourses, normalizeTakenCourses } from '../middlewares/validation';
import { evaluateGraduationStatus } from '../domain/engine';
import { mapDeficitToRecommendations, MockCourseRepository } from '../data';
import { toGraduationApiResponse, GraduationApiResponse } from '../middlewares/refine';

export interface UploadEvaluateResult {
  success: boolean;
  data?: GraduationApiResponse;
  errors?: string[];
}

interface EvaluateOptions {
  entryYear?: number;
  userMajor?: string;
  userMinors?: string[];
}

/**
 * Orchestrates the graduation evaluation pipeline.
 * Extracts metadata (year, major) from raw input if not explicitly provided.
 */
export const uploadAndEvaluate = async (
  rawInput: unknown,
  options: EvaluateOptions = {},
): Promise<UploadEvaluateResult> => {
  let { entryYear, userMajor, userMinors } = options;
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

  // Explicit guard instead of silent fallback
  if (!entryYear) {
    return {
      success: false,
      errors: ['Entry year is required. Provide entryYear explicitly or include a valid studentId (YYYYxxxx).'],
    };
  }

  const currentYear = new Date().getFullYear();
  if (entryYear < 2018 || entryYear > currentYear + 1) {
    return {
      success: false,
      errors: [`Unsupported entry year: ${entryYear}. Supported range is 2018-${currentYear + 1}.`],
    };
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

  // 3.5. Infer Major if missing
  if (!userMajor) {
    const counts: Record<string, number> = {};
    normalized.takenCourses.forEach((course) => {
      let code = '';
      if (course && course.courseCode) {
        code = String(course.courseCode)
          .toUpperCase()
          .replace(/[^A-Z]/g, '');
      }

      for (const prefix of COMMON_MAJOR_PREFIXES) {
        if (code.startsWith(prefix)) {
          counts[prefix] = (counts[prefix] || 0) + 1;
        }
      }
    });

    let maxPrefix = '';
    let maxCount = 0;
    for (const [p, c] of Object.entries(counts)) {
      if (c > maxCount) {
        maxCount = c;
        maxPrefix = p;
      }
    }

    if (maxPrefix) {
      userMajor = maxPrefix;
    }
  }

  // 4. Evaluate (Engine)
  const engineResult = await evaluateGraduationStatus({
    takenCourses: normalized,
    ruleContext: {
      entryYear,
      userMajor,
      userMinors,
    },
  });

  // 5. Data / Recommendations (Optional)
  let recommendations: any[] = [];
  if (!engineResult.totalSatisfied) {
    const deficits: Record<string, number> = {};
    Object.entries(engineResult.graduationCategory).forEach(([key, category]) => {
      if (!category.satisfied) {
        deficits[key] = category.minConditionCredits - category.totalCredits;
      }
    });

    const repo = new MockCourseRepository();
    recommendations = await mapDeficitToRecommendations(deficits, repo);
  }

  // 6. Compose API response
  const apiResponse = toGraduationApiResponse(engineResult, { recommendations });

  return { success: true, data: apiResponse };
};
