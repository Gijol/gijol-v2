import { historicalRequirementCode } from '../domain/rule-catalog/historical-courses';
import {
  type CatalogRecommendationCourse,
  type CourseCatalogRecommendationIndex,
} from '@features/course-catalog/recommendations';
import type { CreditRecognition } from '../domain/credit-recognition';
import { isBasicScienceCode, getCoreMathCodes } from '../domain/rule-catalog/science-courses';
import { resolveMajorCode } from '../domain/academic-context';

interface CourseCodeLike {
  year?: number;
  courseName?: string;
  creditRecognition?: CreditRecognition;
  courseCode?: string | null;
}

interface RequirementLike {
  relatedCoursePatterns?: { codePrefixes?: readonly string[] };
  id: string;
  categoryKey: string;
  label?: string;
  missingCredits?: number;
  satisfied: boolean;
  status?: string;
  importance?: string;
}

interface GraduationCategoryLike {
  userTakenCoursesList?: {
    takenCourses?: readonly CourseCodeLike[];
  };
}

interface GraduationResultLike {
  catalogSelection?: { context: { entryYear: number } };
  graduationCategory?: object;
  fineGrainedRequirements?: readonly RequirementLike[];
}

export interface RecommendationItem {
  courseCode: string;
  courseName: string;
  credit: number;
  reason: string;
  categoryKey: string;
  requirementId?: string;
}

export type RecommendationSuppressionReason = 'missing_major_context' | 'missing_minor_context' | 'display_cap';

export interface RecommendationSuppression {
  categoryKey: string;
  requirementId?: string;
  reason: RecommendationSuppressionReason;
  message: string;
  suppressedCount?: number;
}

export interface RecommendationDisplayPolicy {
  maxTotal?: number;
  maxPerCategory?: number;
  maxPerRequirement?: number;
  maxPerBroadRequirement?: number;
  maxPerMajorRequirement?: number;
  maxPerMinorRequirement?: number;
}

export interface GraduationRecommendationGroups {
  recommendations: RecommendationItem[];
  allRecommendations: RecommendationItem[];
  byCategoryKey: Record<string, RecommendationItem[]>;
  allByCategoryKey: Record<string, RecommendationItem[]>;
  takenCourseCodes: Set<string>;
  suppressions: RecommendationSuppression[];
  policy: Required<RecommendationDisplayPolicy>;
}

export interface BuildGraduationRecommendationsInput {
  result: GraduationResultLike;
  userMajor?: string | null;
  userMinors?: readonly string[] | null;
  takenCourses?: readonly CourseCodeLike[];
  policy?: RecommendationDisplayPolicy;
  courseCatalogIndex: CourseCatalogRecommendationIndex;
}

export const DEFAULT_RECOMMENDATION_DISPLAY_POLICY: Required<RecommendationDisplayPolicy> = {
  maxTotal: 24,
  maxPerCategory: 8,
  maxPerRequirement: 4,
  maxPerBroadRequirement: 3,
  maxPerMajorRequirement: 6,
  maxPerMinorRequirement: 6,
};

interface RecommendationCandidate {
  recommendation: RecommendationItem;
  requirement: RequirementLike;
  sourceOrder: number;
}

function resolveDisplayPolicy(policy?: RecommendationDisplayPolicy): Required<RecommendationDisplayPolicy> {
  return { ...DEFAULT_RECOMMENDATION_DISPLAY_POLICY, ...(policy ?? {}) };
}

function normalizeCourseCode(code?: string | null): string {
  return String(code ?? '')
    .trim()
    .toUpperCase();
}

function collectTakenCourseCodes(input: BuildGraduationRecommendationsInput): Set<string> {
  const codes = new Set<string>();
  const categories = input.result.graduationCategory as Record<string, GraduationCategoryLike | undefined> | undefined;

  const addCompletedCourse = (course: CourseCodeLike) => {
    if (course.creditRecognition?.status === 'pending') return;
    const approvedMatch = course.creditRecognition?.status === 'approved' && course.creditRecognition.matchedCourseCode;
    const code = normalizeCourseCode(approvedMatch || course.courseCode);
    if (code) {
      codes.add(code);
      codes.add(approvedMatch ? code : historicalRequirementCode(code, course));
    }
  };
  input.takenCourses?.forEach(addCompletedCourse);
  Object.values(categories ?? {}).forEach((category) => {
    category?.userTakenCoursesList?.takenCourses?.forEach(addCompletedCourse);
  });

  return codes;
}

function toRecommendationItem(course: CatalogRecommendationCourse, requirement: RequirementLike): RecommendationItem {
  return {
    courseCode: course.courseCode,
    courseName: course.courseName,
    credit: course.credit,
    reason: requirement.label ?? requirement.id,
    categoryKey: requirement.categoryKey,
    requirementId: requirement.id,
  };
}

function getFineGrainedCourses(
  requirement: RequirementLike,
  satisfiedRequirementIds: ReadonlySet<string>,
  courseCatalogIndex: CourseCatalogRecommendationIndex,
  entryYear: number,
): CatalogRecommendationCourse[] {
  const satisfiedScienceSubrequirements =
    requirement.id === 'science-total'
      ? ['science-calculus', 'science-core-math'].filter((requirementId) => satisfiedRequirementIds.has(requirementId))
      : [];

  return courseCatalogIndex
    .getRecommendationCoursesForRequirement(requirement.id, {
      excludeRequirementIds: satisfiedScienceSubrequirements,
    })
    .filter((course) => {
      if (course.courseCode === 'GS1499') return false; // Eligibility requires foreign-student context.
      if (requirement.id === 'science-total') return isBasicScienceCode(course.courseCode, entryYear);
      if (requirement.id === 'science-core-math')
        return getCoreMathCodes(entryYear).some(
          (code) => code === course.courseCode || course.aliasCodes.includes(code),
        );
      return true;
    });
}

function getMinorCodeFromRequirement(requirementId: string): string | undefined {
  if (requirementId.startsWith('minor-ec-level-')) return 'EC';
  if (requirementId === 'minor-ma-upper-level') return 'MA';
  const courseCount = requirementId.match(/^minor-course-count-([A-Z_]+)$/);
  if (courseCount) return courseCount[1];
  const minorCredits = requirementId.match(/^minor-credits-([A-Z0-9_]+)$/i);
  if (minorCredits) return minorCredits[1].toUpperCase();

  const minorMandatory = requirementId.match(/^minor-mandatory-rule-([A-Z0-9_]+)-[0-9]+$/i);
  return minorMandatory?.[1]?.toUpperCase();
}

function getCoursesForRequirement(
  requirement: RequirementLike,
  input: BuildGraduationRecommendationsInput,
  satisfiedRequirementIds: ReadonlySet<string>,
  courseCatalogIndex: CourseCatalogRecommendationIndex,
): CatalogRecommendationCourse[] {
  if (requirement.categoryKey === 'major' && requirement.id === 'major-credits') {
    const majorResolution = resolveMajorCode(input.userMajor);
    return courseCatalogIndex.getMajorRecommendationCourses(majorResolution.code);
  }

  if (requirement.categoryKey === 'minor') {
    const minorCode = getMinorCodeFromRequirement(requirement.id);
    const minorCodes = minorCode ? [minorCode] : [...(input.userMinors ?? [])];

    return minorCodes
      .flatMap((code) => courseCatalogIndex.getMinorRecommendationCourses(code))
      .filter((course) => {
        const codes = requirement.relatedCoursePatterns?.codePrefixes;
        return (
          !codes ||
          codes.some(
            (code) => course.courseCode.startsWith(code) || course.aliasCodes.some((alias) => alias.startsWith(code)),
          )
        );
      });
  }

  return getFineGrainedCourses(
    requirement,
    satisfiedRequirementIds,
    courseCatalogIndex,
    input.result.catalogSelection?.context.entryYear ?? 2021,
  );
}

function isRecommendationEligible(requirement: RequirementLike): boolean {
  return !requirement.satisfied && requirement.importance !== 'should' && requirement.status !== 'needs_review';
}

function getContextSuppression(
  requirement: RequirementLike,
  input: BuildGraduationRecommendationsInput,
): RecommendationSuppression | undefined {
  if (
    requirement.categoryKey === 'major' &&
    !resolveMajorCode(input.userMajor).code &&
    (requirement.id === 'major-credits' || requirement.id === 'major-context')
  ) {
    return {
      categoryKey: requirement.categoryKey,
      requirementId: requirement.id,
      reason: 'missing_major_context',
      message: '전공 컨텍스트가 없어 전공 추천을 숨겼습니다.',
    };
  }

  if (
    requirement.categoryKey === 'minor' &&
    !getMinorCodeFromRequirement(requirement.id) &&
    (!input.userMinors || input.userMinors.length === 0)
  ) {
    return {
      categoryKey: requirement.categoryKey,
      requirementId: requirement.id,
      reason: 'missing_minor_context',
      message: '부전공 컨텍스트가 없어 부전공 추천을 숨겼습니다.',
    };
  }

  return undefined;
}

function isBroadCreditRequirement(requirementId?: string): boolean {
  return requirementId === 'science-total' || requirementId === 'humanities-total';
}

function getRequirementCap(requirement: RequirementLike, policy: Required<RecommendationDisplayPolicy>): number {
  if (requirement.categoryKey === 'major') return policy.maxPerMajorRequirement;
  if (requirement.categoryKey === 'minor') return policy.maxPerMinorRequirement;
  if (isBroadCreditRequirement(requirement.id)) return policy.maxPerBroadRequirement;
  return policy.maxPerRequirement;
}

function getRequirementPriority(requirement: RequirementLike): number {
  if (requirement.categoryKey === 'etcMandatory') return 10;
  if (requirement.categoryKey === 'languageBasic') return 20;
  if (
    requirement.id === 'science-calculus' ||
    requirement.id === 'science-core-math' ||
    requirement.id === 'science-sw-basic'
  ) {
    return 30;
  }
  if (requirement.categoryKey === 'major') return 40;
  if (requirement.categoryKey === 'minor') return 45;
  if (isBroadCreditRequirement(requirement.id)) return 70;
  if (requirement.categoryKey === 'humanities') return 75;
  return 90;
}

function getCreditFitPriority(candidate: RecommendationCandidate): number {
  if (!isBroadCreditRequirement(candidate.requirement.id) || !candidate.requirement.missingCredits) return 0;
  const missingCredits = Math.max(0, candidate.requirement.missingCredits);
  const credit = candidate.recommendation.credit;

  if (credit >= missingCredits) return credit - missingCredits;
  return 100 + (missingCredits - credit);
}

function compareCandidates(a: RecommendationCandidate, b: RecommendationCandidate): number {
  const requirementPriority = getRequirementPriority(a.requirement) - getRequirementPriority(b.requirement);
  if (requirementPriority !== 0) return requirementPriority;

  const creditFitPriority = getCreditFitPriority(a) - getCreditFitPriority(b);
  if (creditFitPriority !== 0) return creditFitPriority;

  return a.sourceOrder - b.sourceOrder;
}

function addSuppression(
  suppressionMap: Map<string, RecommendationSuppression>,
  suppression: RecommendationSuppression,
): void {
  const key = `${suppression.reason}:${suppression.categoryKey}:${suppression.requirementId ?? ''}`;
  const existing = suppressionMap.get(key);
  if (existing) {
    existing.suppressedCount = (existing.suppressedCount ?? 1) + (suppression.suppressedCount ?? 1);
    return;
  }

  suppressionMap.set(key, {
    ...suppression,
    suppressedCount: suppression.suppressedCount ?? 1,
  });
}

function applyDisplayPolicy(
  candidates: RecommendationCandidate[],
  policy: Required<RecommendationDisplayPolicy>,
  suppressionMap: Map<string, RecommendationSuppression>,
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];
  const requirementCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  candidates.forEach((candidate) => {
    const requirementId = candidate.recommendation.requirementId ?? candidate.requirement.id;
    const categoryKey = candidate.recommendation.categoryKey;
    const requirementCap = getRequirementCap(candidate.requirement, policy);
    const requirementCount = requirementCounts.get(requirementId) ?? 0;
    const categoryCount = categoryCounts.get(categoryKey) ?? 0;

    if (requirementCount >= requirementCap) {
      addSuppression(suppressionMap, {
        categoryKey,
        requirementId,
        reason: 'display_cap',
        message: `요건별 추천 상한(${requirementCap}개)을 초과한 후보를 숨겼습니다.`,
      });
      return;
    }

    if (categoryCount >= policy.maxPerCategory) {
      addSuppression(suppressionMap, {
        categoryKey,
        requirementId,
        reason: 'display_cap',
        message: `영역별 추천 상한(${policy.maxPerCategory}개)을 초과한 후보를 숨겼습니다.`,
      });
      return;
    }

    if (recommendations.length >= policy.maxTotal) {
      addSuppression(suppressionMap, {
        categoryKey,
        requirementId,
        reason: 'display_cap',
        message: `전체 추천 상한(${policy.maxTotal}개)을 초과한 후보를 숨겼습니다.`,
      });
      return;
    }

    requirementCounts.set(requirementId, requirementCount + 1);
    categoryCounts.set(categoryKey, categoryCount + 1);
    recommendations.push(candidate.recommendation);
  });

  return recommendations;
}

function groupByCategoryKey(recommendations: RecommendationItem[]): Record<string, RecommendationItem[]> {
  return recommendations.reduce<Record<string, RecommendationItem[]>>((acc, recommendation) => {
    acc[recommendation.categoryKey] = acc[recommendation.categoryKey] ?? [];
    acc[recommendation.categoryKey].push(recommendation);
    return acc;
  }, {});
}

export function buildGraduationRecommendationGroups(
  input: BuildGraduationRecommendationsInput,
): GraduationRecommendationGroups {
  const courseCatalogIndex = input.courseCatalogIndex;
  const takenCourseCodes = collectTakenCourseCodes(input);
  const policy = resolveDisplayPolicy(input.policy);
  const suppressionMap = new Map<string, RecommendationSuppression>();
  const satisfiedRequirementIds = new Set(
    (input.result.fineGrainedRequirements ?? [])
      .filter((requirement) => requirement.satisfied)
      .map((requirement) => requirement.id),
  );
  const seen = new Set<string>();
  const candidates: RecommendationCandidate[] = [];
  const fineGrainedRequirements = input.result.fineGrainedRequirements ?? [];

  fineGrainedRequirements.forEach((requirement) => {
    if (requirement.status !== 'needs_review') return;
    const contextSuppression = getContextSuppression(requirement, input);
    if (contextSuppression) {
      addSuppression(suppressionMap, contextSuppression);
    }
  });

  fineGrainedRequirements.filter(isRecommendationEligible).forEach((requirement) => {
    const contextSuppression = getContextSuppression(requirement, input);
    if (contextSuppression) {
      addSuppression(suppressionMap, contextSuppression);
      return;
    }

    getCoursesForRequirement(requirement, input, satisfiedRequirementIds, courseCatalogIndex).forEach((course) => {
      const recommendation = toRecommendationItem(course, requirement);
      const code = normalizeCourseCode(recommendation.courseCode);
      const seenKey = course.courseId || code;
      // p.19: programming waives SW basics; the reverse still permits programming.
      if (code === 'GS1490' && satisfiedRequirementIds.has('science-sw-basic')) return;
      // Recommendation suppression only: matching GS/HS title and number do not establish graduation equivalence.
      const takenRows = [
        ...(input.takenCourses ?? []),
        ...Object.values(input.result.graduationCategory ?? {}).flatMap(
          (category: GraduationCategoryLike) => category.userTakenCoursesList?.takenCourses ?? [],
        ),
      ];
      const matchingLegacyHumanities =
        /^(GS|HS)\d{4}$/.test(code) &&
        takenRows.some(
          (taken) =>
            taken.creditRecognition?.status !== 'pending' &&
            /^(GS|HS)\d{4}$/.test(normalizeCourseCode(taken.courseCode)) &&
            normalizeCourseCode(taken.courseCode).slice(2) === code.slice(2) &&
            (taken.courseName ?? '').replace(/\s/g, '').toLowerCase() ===
              course.courseName.replace(/\s/g, '').toLowerCase(),
        );
      if (matchingLegacyHumanities) return;
      if (!code || courseCatalogIndex.isCourseTaken(course, takenCourseCodes) || seen.has(seenKey)) return;

      seen.add(seenKey);
      candidates.push({
        recommendation,
        requirement,
        sourceOrder: candidates.length,
      });
    });
  });

  const sortedCandidates = [...candidates].sort(compareCandidates);
  const allRecommendations = sortedCandidates.map((candidate) => candidate.recommendation);
  const recommendations = applyDisplayPolicy(sortedCandidates, policy, suppressionMap);

  return {
    recommendations,
    allRecommendations,
    byCategoryKey: groupByCategoryKey(recommendations),
    allByCategoryKey: groupByCategoryKey(allRecommendations),
    takenCourseCodes,
    suppressions: Array.from(suppressionMap.values()),
    policy,
  };
}

export function buildGraduationRecommendations(input: BuildGraduationRecommendationsInput): RecommendationItem[] {
  return buildGraduationRecommendationGroups(input).recommendations;
}
