import {
  BIOLOGY_COURSES,
  CALCULUS_COURSES,
  CHEMISTRY_COURSES,
  COLLOQUIUM_COURSES,
  CORE_MATH_COURSES,
  ENGLISH_I_COURSES,
  ENGLISH_II_COURSES,
  EXPLORATION_COURSES,
  FRESHMAN_COURSES,
  HUS_COURSES,
  MATH_COURSES,
  PHYSICS_COURSES,
  PPE_COURSES,
  SCIENCE_ECONOMY_COURSES,
  SOFTWARE_COURSES,
  WRITING_COURSES,
  getMajorRecommendationCoursesByCode,
  getOfferedCourses,
  type CourseMaster,
} from '../../../lib/const/course-master';
import { getMinorRecommendations } from '../../../lib/const/minor-courses';
import { resolveMajorCode } from '../domain/academic-context';

interface CourseCodeLike {
  courseCode?: string | null;
}

interface RequirementLike {
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

export type RecommendationSuppressionReason =
  | 'missing_major_context'
  | 'missing_minor_context'
  | 'display_cap';

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
}

export const DEFAULT_RECOMMENDATION_DISPLAY_POLICY: Required<RecommendationDisplayPolicy> = {
  maxTotal: 24,
  maxPerCategory: 8,
  maxPerRequirement: 4,
  maxPerBroadRequirement: 3,
  maxPerMajorRequirement: 6,
  maxPerMinorRequirement: 6,
};

const FINE_GRAINED_COURSE_MAP: Record<string, CourseMaster[]> = {
  'language-english-i': getOfferedCourses(ENGLISH_I_COURSES),
  'language-english-ii': getOfferedCourses(ENGLISH_II_COURSES),
  'language-writing': getOfferedCourses(WRITING_COURSES),
  'science-calculus': getOfferedCourses(CALCULUS_COURSES),
  'science-core-math': getOfferedCourses(CORE_MATH_COURSES),
  'science-sw-basic': getOfferedCourses(SOFTWARE_COURSES),
  'science-total': getOfferedCourses([
    ...MATH_COURSES,
    ...PHYSICS_COURSES,
    ...CHEMISTRY_COURSES,
    ...BIOLOGY_COURSES,
    ...SOFTWARE_COURSES,
  ]),
  'humanities-hus': getOfferedCourses(HUS_COURSES),
  'humanities-ppe': getOfferedCourses(PPE_COURSES),
  'humanities-total': getOfferedCourses([...HUS_COURSES, ...PPE_COURSES]),
  'etc-freshman': getOfferedCourses(FRESHMAN_COURSES),
  'etc-major-exploration': getOfferedCourses(EXPLORATION_COURSES),
  'etc-colloquium': getOfferedCourses(COLLOQUIUM_COURSES),
  'etc-science-economy': getOfferedCourses(SCIENCE_ECONOMY_COURSES),
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

  input.takenCourses?.forEach((course) => {
    const code = normalizeCourseCode(course.courseCode);
    if (code) codes.add(code);
  });

  Object.values(categories ?? {}).forEach((category) => {
    category?.userTakenCoursesList?.takenCourses?.forEach((course) => {
      const code = normalizeCourseCode(course.courseCode);
      if (code) codes.add(code);
    });
  });

  return codes;
}

function toRecommendationItem(
  course: CourseMaster,
  requirement: RequirementLike,
): RecommendationItem {
  return {
    courseCode: course.courseCode,
    courseName: course.courseNameKo,
    credit: course.credits,
    reason: requirement.label ?? requirement.id,
    categoryKey: requirement.categoryKey,
    requirementId: requirement.id,
  };
}

function excludeCourseCodes(courses: CourseMaster[], excludedCourseGroups: CourseMaster[][]): CourseMaster[] {
  const excludedCodes = new Set(
    excludedCourseGroups.flatMap((group) => group.map((course) => normalizeCourseCode(course.courseCode))),
  );

  return courses.filter((course) => !excludedCodes.has(normalizeCourseCode(course.courseCode)));
}

function getFineGrainedCourses(requirement: RequirementLike, satisfiedRequirementIds: ReadonlySet<string>): CourseMaster[] {
  if (requirement.id === 'science-total') {
    return excludeCourseCodes(
      getOfferedCourses([
        ...MATH_COURSES,
        ...PHYSICS_COURSES,
        ...CHEMISTRY_COURSES,
        ...BIOLOGY_COURSES,
        ...SOFTWARE_COURSES,
      ]),
      satisfiedRequirementIds.has('science-calculus') ? [CALCULUS_COURSES] : [],
    );
  }

  return FINE_GRAINED_COURSE_MAP[requirement.id] ?? [];
}

function getMinorCodeFromRequirement(requirementId: string): string | undefined {
  const minorCredits = requirementId.match(/^minor-credits-([A-Z0-9_]+)$/i);
  if (minorCredits) return minorCredits[1].toUpperCase();

  const minorMandatory = requirementId.match(/^minor-mandatory-rule-([A-Z0-9_]+)-[0-9]+$/i);
  return minorMandatory?.[1]?.toUpperCase();
}

function getCoursesForRequirement(
  requirement: RequirementLike,
  input: BuildGraduationRecommendationsInput,
  takenCourseCodes: Set<string>,
  satisfiedRequirementIds: ReadonlySet<string>,
): RecommendationItem[] {
  if (requirement.categoryKey === 'major' && requirement.id === 'major-credits') {
    const majorResolution = resolveMajorCode(input.userMajor);
    return getMajorRecommendationCoursesByCode(majorResolution.code).map((course) =>
      toRecommendationItem(course, requirement),
    );
  }

  if (requirement.categoryKey === 'minor') {
    const minorCode = getMinorCodeFromRequirement(requirement.id);
    const minorCodes = minorCode ? [minorCode] : [...(input.userMinors ?? [])];

    return minorCodes.flatMap((code) =>
      getMinorRecommendations(code, takenCourseCodes).map((course) => ({
        courseCode: course.courseCode,
        courseName: course.courseName,
        credit: course.credit,
        reason: requirement.label ?? requirement.id,
        categoryKey: requirement.categoryKey,
        requirementId: requirement.id,
      })),
    );
  }

  return getFineGrainedCourses(requirement, satisfiedRequirementIds).map((course) =>
    toRecommendationItem(course, requirement),
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
  if (requirement.id === 'science-calculus' || requirement.id === 'science-core-math' || requirement.id === 'science-sw-basic') {
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

    getCoursesForRequirement(requirement, input, takenCourseCodes, satisfiedRequirementIds).forEach((recommendation) => {
      const code = normalizeCourseCode(recommendation.courseCode);
      if (!code || takenCourseCodes.has(code) || seen.has(code)) return;

      seen.add(code);
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

export function buildGraduationRecommendations(
  input: BuildGraduationRecommendationsInput,
): RecommendationItem[] {
  return buildGraduationRecommendationGroups(input).recommendations;
}
