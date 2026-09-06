import type { MinorCourseInfo } from '@/lib/const/minor-courses';
import type { CourseCatalogRequirementFacet } from '../types';
import { minorCatalogSourceRef, normalizeCourseCode } from '../normalize';

export function minorCourseToRequirementFacet(
  minorCode: string,
  course: MinorCourseInfo,
  resolveCourseId: (courseCode: string) => string,
): CourseCatalogRequirementFacet | null {
  const courseCode = normalizeCourseCode(course.courseCode);
  if (!minorCode || !courseCode) return null;

  return {
    id: `minor:${minorCode}:${course.classification}:${courseCode}`,
    courseId: resolveCourseId(courseCode),
    courseCode,
    feature: 'minor',
    category: course.category,
    classification: course.classification,
    programCode: minorCode,
    sourceRefs: course.sourceRefs?.length ? course.sourceRefs : [minorCatalogSourceRef(minorCode)],
  };
}

export function buildRequirementFacetsFromMinorCourses(
  minorCoursesByCode: Readonly<Record<string, readonly MinorCourseInfo[]>>,
  resolveCourseId: (courseCode: string) => string,
): CourseCatalogRequirementFacet[] {
  return Object.entries(minorCoursesByCode).flatMap(([minorCode, courses]) =>
    courses
      .map((course) => minorCourseToRequirementFacet(minorCode, course, resolveCourseId))
      .filter((facet): facet is CourseCatalogRequirementFacet => facet !== null),
  );
}
