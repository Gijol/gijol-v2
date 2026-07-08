import type { CourseDB } from '@const/course-db';
import type { SectionOffering } from '@/lib/types/timetable';
import type {
  CourseCatalogHistoricalOffering,
  CourseCatalogSourceRef,
} from '../types';
import { normalizeCourseCode, timetableSourceRef } from '../normalize';

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

export function buildHistoricalOfferingsFromTimetable(
  sources: readonly {
    sections: readonly SectionOffering[];
    term: string;
    sourcePath: string;
  }[],
  resolveCourseId: (courseCode: string) => string,
): CourseCatalogHistoricalOffering[] {
  return sources.flatMap((source) => {
    const parsed = parseOfferedTerm(source.term);
    if (!parsed) return [];

    const courseCodes = Array.from(new Set(
      source.sections.map((section) => normalizeCourseCode(section.course_code)).filter(Boolean),
    )).sort();

    return courseCodes.map((courseCode) => ({
      id: `history:${source.term}:${courseCode}`,
      courseId: resolveCourseId(courseCode),
      courseCode,
      academicYear: parsed.academicYear,
      semester: parsed.semester,
      term: source.term,
      sourceLabel: '수강신청 시스템 개설강좌정보',
      sourceRefs: [timetableSourceRef(source.sourcePath)],
    }));
  });
}

export function formatHistoricalOfferingTerm(
  offering: Pick<CourseCatalogHistoricalOffering, 'academicYear' | 'semester'>,
): string {
  return `${offering.academicYear} ${semesterLabel(offering.semester)}`;
}
