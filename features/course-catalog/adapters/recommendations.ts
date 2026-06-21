import type { CourseMaster } from '@/lib/const/course-master';
import type { CourseCatalogRequirementFacet } from '../types';
import { normalizeCourseCode, recommendationSourceRef } from '../normalize';

export interface RecommendationCourseGroup {
  requirementId: string;
  courses: readonly CourseMaster[];
  category?: string;
  programCode?: string;
}

function recommendationFacetId(group: RecommendationCourseGroup, courseCode: string): string {
  return [
    'recommendation',
    group.requirementId,
    group.programCode ?? 'common',
    courseCode,
  ].join(':');
}

export function buildRequirementFacetsFromRecommendationGroups(
  groups: readonly RecommendationCourseGroup[],
  resolveCourseId: (courseCode: string) => string,
): CourseCatalogRequirementFacet[] {
  return groups.flatMap((group) => {
    const seen = new Set<string>();

    return group.courses.flatMap((course, index) => {
      const courseCode = normalizeCourseCode(course.courseCode);
      if (!course.isOffered || !courseCode || seen.has(courseCode)) return [];
      seen.add(courseCode);

      return {
        id: recommendationFacetId(group, courseCode),
        courseId: resolveCourseId(courseCode),
        courseCode,
        feature: 'recommendation',
        category: group.category ?? course.department ?? 'graduation-recommendation',
        classification: 'offered',
        programCode: group.programCode,
        requirementId: group.requirementId,
        sortOrder: index,
        sourceRefs: [recommendationSourceRef()],
      } satisfies CourseCatalogRequirementFacet;
    });
  });
}
