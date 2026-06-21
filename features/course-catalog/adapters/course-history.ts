import type { CourseDB } from '@const/course-db';
import type {
  CourseCatalogHistoricalOffering,
  CourseCatalogSourceRef,
} from '../types';
import { normalizeCourseCode } from '../normalize';

function courseDbOfferedSourceRef(term: string): CourseCatalogSourceRef {
  return {
    kind: 'course-db',
    sourceId: `course-db:offered:${term}`,
    path: 'DB/course_db.csv',
    note: `offered_${term.replace('-', '_')}`,
  };
}

function parseOfferedTerm(term: string): { academicYear: number; semester: string } | null {
  const match = term.match(/^(\d{4})-(.+)$/);
  if (!match) return null;
  const academicYear = Number(match[1]);
  if (!Number.isFinite(academicYear)) return null;
  return { academicYear, semester: match[2] };
}

function semesterLabel(semester: string): string {
  if (semester === '1') return '1학기';
  if (semester === '2') return '2학기';
  return semester;
}

export function buildHistoricalOfferingsFromCourseDb(
  rows: readonly CourseDB[],
  resolveCourseId: (courseCode: string) => string,
): CourseCatalogHistoricalOffering[] {
  return rows.flatMap((row) => {
    const courseCode = normalizeCourseCode(row.primaryCourseCode);
    if (!courseCode) return [];

    const offerings: CourseCatalogHistoricalOffering[] = [];

    (row.offeredTerms ?? []).forEach((term) => {
      const parsed = parseOfferedTerm(term);
      if (!parsed) return;

      offerings.push({
        id: `history:${term}:${courseCode}`,
        courseId: resolveCourseId(courseCode),
        courseCode,
        academicYear: parsed.academicYear,
        semester: parsed.semester,
        term,
        sourceLabel: '강의 DB 개설 플래그',
        sourceRefs: [courseDbOfferedSourceRef(term)],
      });
    });

    return offerings;
  });
}

export function formatHistoricalOfferingTerm(
  offering: Pick<CourseCatalogHistoricalOffering, 'academicYear' | 'semester'>,
): string {
  return `${offering.academicYear} ${semesterLabel(offering.semester)}`;
}
