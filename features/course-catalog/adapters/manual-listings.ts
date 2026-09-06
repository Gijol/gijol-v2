import type { CourseCatalogCourse, CourseCatalogManualListing } from '../types';
import { manualListingSourceRef, normalizeCourseCode, uniqueSourceRefs, uniqueStrings } from '../normalize';

export interface ExtractedManualListingEntry {
  courseCode: string;
  titleKo?: string;
  page: number;
  credits?: number;
  lectureHours?: number;
  labHours?: number;
}

export interface CourseManualListingSource {
  academicYear: number;
  sourcePath: string;
  sourceSha256?: string;
  extractionMethod: 'pdftotext' | 'ocr';
  entries: readonly ExtractedManualListingEntry[];
}

export interface ManualListingExtractionSnapshot {
  schemaVersion: 1;
  sources: readonly CourseManualListingSource[];
}

function catalogCourseByCode(courses: readonly CourseCatalogCourse[]): Map<string, CourseCatalogCourse> {
  const byCode = new Map<string, CourseCatalogCourse>();

  courses.forEach((course) => {
    byCode.set(normalizeCourseCode(course.primaryCode), course);
    course.aliases.forEach((alias) => {
      const code = normalizeCourseCode(alias.code);
      if (code && !byCode.has(code)) byCode.set(code, course);
    });
  });

  return byCode;
}

export function buildManualListingsFromSources(
  sources: readonly CourseManualListingSource[],
  options: {
    catalogCourses: readonly CourseCatalogCourse[];
    resolveCourseId: (courseCode: string) => string;
  },
): CourseCatalogManualListing[] {
  const courseByCode = catalogCourseByCode(options.catalogCourses);

  return sources.flatMap((source) =>
    source.entries.flatMap((entry) => {
      const courseCode = normalizeCourseCode(entry.courseCode);
      const course = courseByCode.get(courseCode);
      if (!course) return [];

      return [
        {
          id: `manual-listing:${source.academicYear}:${courseCode}`,
          courseId: options.resolveCourseId(courseCode),
          courseCode,
          academicYear: source.academicYear,
          // Current catalog titles/credits are not evidence for historical handbook values.
          titleKo: entry.titleKo,
          credits: entry.credits,
          lectureHours: entry.lectureHours,
          labHours: entry.labHours,
          departments: uniqueStrings(course.departments),
          page: entry.page,
          sourceRefs: uniqueSourceRefs([
            manualListingSourceRef({
              academicYear: source.academicYear,
              path: source.sourcePath,
              page: entry.page,
            }),
          ]),
        },
      ];
    }),
  );
}
