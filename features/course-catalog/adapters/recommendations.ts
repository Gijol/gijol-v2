import type { CourseMaster } from '@/lib/const/course-master';
import type { CourseCatalogRequirementFacet } from '../types';
import { normalizeCourseCode, recommendationSourceRef } from '../normalize';

export function buildRequirementFacetsFromRecommendationCourses(
  courses: readonly CourseMaster[],
  resolveCourseId: (courseCode: string) => string,
): CourseCatalogRequirementFacet[] {
  const seen = new Set<string>();

  return courses.flatMap((course) => {
    const courseCode = normalizeCourseCode(course.courseCode);
    if (!courseCode || seen.has(courseCode)) return [];
    seen.add(courseCode);

    return {
      id: `recommendation:${courseCode}`,
      courseId: resolveCourseId(courseCode),
      courseCode,
      feature: 'recommendation',
      category: course.department ?? 'graduation-recommendation',
      classification: course.isOffered ? 'offered' : 'not-offered',
      sourceRefs: [recommendationSourceRef()],
    } satisfies CourseCatalogRequirementFacet;
  });
}
