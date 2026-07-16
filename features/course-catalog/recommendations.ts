import { normalizeCourseCode, uniqueStrings } from './normalize';
import type {
  CourseCatalogCourse,
  CourseCatalogRequirementFacet,
  CourseCatalogSnapshot,
  CourseCatalogSourceRef,
} from './types';

export interface CatalogRecommendationCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  credit: number;
  requirementId?: string;
  category: string;
  classification?: string;
  programCode?: string;
  sortOrder?: number;
  aliasCodes: readonly string[];
  sourceRefs: readonly CourseCatalogSourceRef[];
}

export interface RecommendationRequirementOptions {
  programCode?: string;
  excludeRequirementIds?: readonly string[];
}

export interface CourseCatalogRecommendationIndex {
  getRecommendationCoursesForRequirement(
    requirementId: string,
    options?: RecommendationRequirementOptions,
  ): CatalogRecommendationCourse[];
  getMajorRecommendationCourses(majorCode?: string | null): CatalogRecommendationCourse[];
  getMinorRecommendationCourses(minorCode?: string | null): CatalogRecommendationCourse[];
  isCourseTaken(course: CatalogRecommendationCourse, takenCourseCodes: ReadonlySet<string>): boolean;
  getCourseIdsForCodes(courseCodes: Iterable<string>): Set<string>;
}

const MINOR_RECOMMENDATION_CLASSIFICATION_ORDER: Record<string, number> = {
  'Major Mandatory': 0,
  'Major Elective': 1,
};

function courseAliasCodes(course: CourseCatalogCourse): string[] {
  return uniqueStrings(course.aliases.map((alias) => normalizeCourseCode(alias.code)));
}

function compareRecommendationCourses(a: CatalogRecommendationCourse, b: CatalogRecommendationCourse): number {
  const sortOrderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const sortOrderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  if (sortOrderA !== sortOrderB) return sortOrderA - sortOrderB;
  return a.courseCode.localeCompare(b.courseCode);
}

function compareMinorRecommendationCourses(a: CatalogRecommendationCourse, b: CatalogRecommendationCourse): number {
  const classificationA = MINOR_RECOMMENDATION_CLASSIFICATION_ORDER[a.classification ?? ''] ?? 99;
  const classificationB = MINOR_RECOMMENDATION_CLASSIFICATION_ORDER[b.classification ?? ''] ?? 99;
  if (classificationA !== classificationB) return classificationA - classificationB;
  return compareRecommendationCourses(a, b);
}

export function createCourseCatalogRecommendationIndex(
  snapshot: CourseCatalogSnapshot,
): CourseCatalogRecommendationIndex {
  const coursesById = new Map(snapshot.courses.map((course) => [course.courseId, course]));
  const courseIdByCode = new Map<string, string>();
  const facetsByRequirementId = new Map<string, CourseCatalogRequirementFacet[]>();

  snapshot.courses.forEach((course) => {
    course.aliases.forEach((alias) => {
      const code = normalizeCourseCode(alias.code);
      if (code && !courseIdByCode.has(code)) {
        courseIdByCode.set(code, course.courseId);
      }
    });
  });

  snapshot.requirementFacets.forEach((facet) => {
    if (!facet.requirementId) return;
    const facets = facetsByRequirementId.get(facet.requirementId) ?? [];
    facetsByRequirementId.set(facet.requirementId, [...facets, facet]);
  });

  function facetToRecommendationCourse(facet: CourseCatalogRequirementFacet): CatalogRecommendationCourse | null {
    const course = coursesById.get(facet.courseId);
    if (!course) return null;

    return {
      courseId: course.courseId,
      courseCode: normalizeCourseCode(facet.courseCode),
      courseName: course.titleKo || facet.courseCode,
      credit: course.credits,
      requirementId: facet.requirementId,
      category: facet.category,
      classification: facet.classification,
      programCode: facet.programCode,
      sortOrder: facet.sortOrder,
      aliasCodes: courseAliasCodes(course),
      sourceRefs: facet.sourceRefs,
    };
  }

  function getExcludedCourseIds(requirementIds: readonly string[] = []): Set<string> {
    const excluded = new Set<string>();

    requirementIds.forEach((requirementId) => {
      (facetsByRequirementId.get(requirementId) ?? []).forEach((facet) => {
        excluded.add(facet.courseId);
        const courseId = courseIdByCode.get(normalizeCourseCode(facet.courseCode));
        if (courseId) excluded.add(courseId);
      });
    });

    return excluded;
  }

  function getRecommendationCoursesForRequirement(
    requirementId: string,
    options: RecommendationRequirementOptions = {},
  ): CatalogRecommendationCourse[] {
    const programCode = normalizeCourseCode(options.programCode);
    const excludedCourseIds = getExcludedCourseIds(options.excludeRequirementIds);

    return (facetsByRequirementId.get(requirementId) ?? [])
      .filter((facet) => facet.feature === 'recommendation')
      .filter((facet) => facet.classification === 'offered')
      .filter((facet) => !programCode || normalizeCourseCode(facet.programCode) === programCode)
      .map(facetToRecommendationCourse)
      .filter((course): course is CatalogRecommendationCourse => course !== null)
      .filter((course) => !excludedCourseIds.has(course.courseId))
      .sort(compareRecommendationCourses);
  }

  function getMajorRecommendationCourses(majorCode?: string | null): CatalogRecommendationCourse[] {
    const programCode = normalizeCourseCode(majorCode);
    if (!programCode) return [];
    return getRecommendationCoursesForRequirement('major-credits', { programCode });
  }

  function getMinorRecommendationCourses(minorCode?: string | null): CatalogRecommendationCourse[] {
    const programCode = normalizeCourseCode(minorCode);
    if (!programCode) return [];

    return snapshot.requirementFacets
      .filter((facet) => facet.feature === 'minor')
      .filter((facet) => normalizeCourseCode(facet.programCode) === programCode)
      .filter((facet) => facet.classification !== undefined)
      .filter((facet) => facet.classification! in MINOR_RECOMMENDATION_CLASSIFICATION_ORDER)
      .map(facetToRecommendationCourse)
      .filter((course): course is CatalogRecommendationCourse => course !== null)
      .sort(compareMinorRecommendationCourses);
  }

  function getCourseIdsForCodes(courseCodes: Iterable<string>): Set<string> {
    const courseIds = new Set<string>();

    Array.from(courseCodes).forEach((courseCode) => {
      const courseId = courseIdByCode.get(normalizeCourseCode(courseCode));
      if (courseId) courseIds.add(courseId);
    });

    return courseIds;
  }

  function isCourseTaken(course: CatalogRecommendationCourse, takenCourseCodes: ReadonlySet<string>): boolean {
    const normalizedTakenCodes = new Set(
      Array.from(takenCourseCodes).map((courseCode) => normalizeCourseCode(courseCode)),
    );
    if (normalizedTakenCodes.has(normalizeCourseCode(course.courseCode))) return true;
    if (course.aliasCodes.some((aliasCode) => normalizedTakenCodes.has(normalizeCourseCode(aliasCode)))) return true;
    return getCourseIdsForCodes(normalizedTakenCodes).has(course.courseId);
  }

  return {
    getRecommendationCoursesForRequirement,
    getMajorRecommendationCourses,
    getMinorRecommendationCourses,
    isCourseTaken,
    getCourseIdsForCodes,
  };
}
