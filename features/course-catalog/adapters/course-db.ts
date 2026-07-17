import type { CourseDB } from '@const/course-db';
import type { CourseCatalogCourse } from '../types';
import { courseDbSourceRef, normalizeCourseCode, uniqueStrings } from '../normalize';

export function courseDbRowToCatalogCourse(row: CourseDB): CourseCatalogCourse | null {
  const primaryCode = normalizeCourseCode(row.primaryCourseCode);
  if (!row.courseUid || !primaryCode) return null;

  const aliasCodes = row.aliasCodes.map(normalizeCourseCode).filter((code) => code && code !== primaryCode);
  const departments = uniqueStrings([
    row.departmentContext,
    ...row.participatingDepartments,
  ]);

  return {
    courseId: row.courseUid,
    primaryCode,
    aliases: [
      { code: primaryCode, relation: 'primary', sourceRefs: [courseDbSourceRef()] },
      ...aliasCodes.map((code) => ({
        code,
        relation: 'same_course' as const,
        sourceRefs: [courseDbSourceRef()],
      })),
    ],
    titleKo: row.displayTitleKo || primaryCode,
    ...(row.displayTitleEn ? { titleEn: row.displayTitleEn } : {}),
    credits: row.creditHours,
    lectureHours: row.lectureHours,
    labHours: row.labHours,
    departments,
    tags: uniqueStrings(row.tags),
    ...(row.description ? { description: row.description } : {}),
    lifecycle: {
      status: row.offered2025_1 || row.offered2025_2 ? 'active' : 'unknown',
    },
    sourceRefs: [courseDbSourceRef()],
  };
}

export function buildCoursesFromCourseDb(rows: readonly CourseDB[]): CourseCatalogCourse[] {
  return rows
    .map(courseDbRowToCatalogCourse)
    .filter((course): course is CourseCatalogCourse => course !== null);
}
