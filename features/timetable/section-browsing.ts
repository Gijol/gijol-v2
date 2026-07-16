import type { SectionOffering } from '@/lib/types/timetable';
import { normalizeCourseCode } from '@/features/course-catalog/normalize';

export const SECTION_BROWSING_PAGE_SIZE = 30;
export const SECTION_BROWSING_MAX_PAGE_SIZE = 100;

export interface SectionBrowsingQuery {
  query?: string;
  department?: string;
  courseCodes?: readonly string[];
  page?: number;
  pageSize?: number;
}

export interface SectionBrowsingPage {
  content: SectionOffering[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  departments: string[];
  graduateSectionCount: number;
}

export interface SectionBrowser {
  browse(query?: SectionBrowsingQuery): SectionBrowsingPage;
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value!));
}

function matchesSearch(section: SectionOffering, rawQuery: string): boolean {
  const query = rawQuery.trim().toLocaleLowerCase('ko-KR');
  if (!query) return true;

  return (
    section.title.toLocaleLowerCase('ko-KR').includes(query) ||
    section.course_code.toLocaleLowerCase('ko-KR').includes(query) ||
    section.instructors.some((instructor) => instructor.name.toLocaleLowerCase('ko-KR').includes(query))
  );
}

export function createSectionBrowser(sections: readonly SectionOffering[]): SectionBrowser {
  const stableSections = [...sections];
  const departments = Array.from(
    new Set(stableSections.map((section) => section.department.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, 'ko-KR'));
  const graduateSectionCount = stableSections.filter((section) => /대학원|석사|박사|석박/.test(section.program)).length;

  return {
    browse(query = {}) {
      const page = positiveInteger(query.page, 1);
      const pageSize = Math.min(
        positiveInteger(query.pageSize, SECTION_BROWSING_PAGE_SIZE),
        SECTION_BROWSING_MAX_PAGE_SIZE,
      );
      const requestedCodes = new Set((query.courseCodes ?? []).map(normalizeCourseCode));
      const filtered = stableSections.filter(
        (section) =>
          matchesSearch(section, query.query ?? '') &&
          (!query.department || section.department === query.department) &&
          (requestedCodes.size === 0 || requestedCodes.has(normalizeCourseCode(section.course_code))),
      );
      const totalElements = filtered.length;
      const offset = (page - 1) * pageSize;

      return {
        content: filtered.slice(offset, offset + pageSize),
        page,
        pageSize,
        totalElements,
        totalPages: Math.ceil(totalElements / pageSize),
        departments,
        graduateSectionCount,
      };
    },
  };
}
