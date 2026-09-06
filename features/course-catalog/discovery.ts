import {
  filterCourseCatalogSearchItems,
  getUniqueCatalogDepartments,
  getUniqueCatalogOfferingTerms,
  type CourseCatalogSearchFilters,
  type CourseCatalogSearchItem,
} from './search';
import type { CourseCatalogOffering } from './types';
import { normalizeCourseCode } from './normalize';

export const COURSE_DISCOVERY_DEFAULT_PAGE_SIZE = 24;
export const COURSE_DISCOVERY_MAX_PAGE_SIZE = 100;

export interface CourseDiscoveryQuery extends CourseCatalogSearchFilters {
  moocOnly?: boolean;
  program?: CourseCatalogOffering['program'] | 'all';
  userMajor?: string;
  userMinors?: readonly string[];
  page?: number;
  pageSize?: number;
}

export interface CourseDiscoveryListItem {
  courseId: string;
  primaryCourseCode: string;
  displayTitleKo: string;
  displayTitleEn: string;
  aliasCodes: readonly string[];
  departments: readonly string[];
  representativeTag?: string;
  creditHours: number;
  labHours: number;
  lifecycleStatus: CourseCatalogSearchItem['lifecycleStatus'];
  offeringTerms: readonly string[];
  offeringPrograms: readonly NonNullable<CourseCatalogOffering['program']>[];
}

export interface CourseDiscoveryFacets {
  departments: readonly string[];
  terms: readonly string[];
}

export interface CourseDiscoveryPage {
  content: CourseDiscoveryListItem[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  facets: CourseDiscoveryFacets;
}

export interface CourseDiscovery {
  search(query?: CourseDiscoveryQuery): CourseDiscoveryPage;
  getDetail(courseId: string): CourseCatalogSearchItem | undefined;
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value!));
}

function getRepresentativeAcademicTag(item: CourseCatalogSearchItem, query: CourseDiscoveryQuery): string | undefined {
  const userMajor = normalizeCourseCode(query.userMajor);
  const userMinors = new Set((query.userMinors ?? []).map(normalizeCourseCode).filter(Boolean));
  const courseCodes = [item.primaryCourseCode, ...item.aliasCodes].map(normalizeCourseCode);
  const matchesMajor =
    Boolean(userMajor) &&
    (courseCodes.some((courseCode) => courseCode.startsWith(userMajor)) ||
      item.facets.some(
        (facet) => facet.feature === 'recommendation' && normalizeCourseCode(facet.programCode) === userMajor,
      ));

  if (courseCodes.some((code) => ['GS1490', 'GS1499'].includes(code))) return '소프트웨어';
  if (matchesMajor) return '전공';

  const matchingMinorFacets = item.facets.filter(
    (facet) => facet.feature === 'minor' && userMinors.has(normalizeCourseCode(facet.programCode)),
  );
  if (matchingMinorFacets.length > 0) {
    const isMandatory = matchingMinorFacets.some(
      (facet) => facet.category.includes('필수') || facet.classification?.toLowerCase().includes('mandatory'),
    );
    return isMandatory ? '부전공필수' : '부전공선택';
  }

  const requirementIds = item.facets.flatMap((facet) => (facet.requirementId ? [facet.requirementId] : []));
  if (requirementIds.some((requirementId) => requirementId.startsWith('science-'))) return '기초과학';
  if (requirementIds.some((requirementId) => requirementId.startsWith('language-'))) return '언어의 기초';
  if (
    requirementIds.some((requirementId) => requirementId.startsWith('humanities-')) ||
    courseCodes.some((courseCode) => /^(HS|EB|LH|MB|PP|SS)/.test(courseCode))
  ) {
    return '인문사회';
  }
  if (requirementIds.some((requirementId) => requirementId.startsWith('etc-'))) return '공통필수';

  return undefined;
}

function toListItem(item: CourseCatalogSearchItem, query: CourseDiscoveryQuery): CourseDiscoveryListItem {
  const offeringTerms = Array.from(new Set(item.offeringGroups.map((group) => group.term))).sort();
  const offeringPrograms = Array.from(
    new Set(
      item.offeringGroups
        .map((group) => group.program)
        .filter((program): program is NonNullable<CourseCatalogOffering['program']> => Boolean(program)),
    ),
  ).sort();

  return {
    courseId: item.courseId,
    primaryCourseCode: item.primaryCourseCode,
    displayTitleKo: item.displayTitleKo,
    displayTitleEn: item.displayTitleEn,
    aliasCodes: item.aliasCodes,
    departments: item.departments,
    representativeTag: getRepresentativeAcademicTag(item, query),
    creditHours: item.creditHours,
    labHours: item.labHours,
    lifecycleStatus: item.lifecycleStatus,
    offeringTerms,
    offeringPrograms,
  };
}

export function createCourseDiscovery(items: readonly CourseCatalogSearchItem[]): CourseDiscovery {
  const orderedItems = [...items].sort(
    (a, b) => a.primaryCourseCode.localeCompare(b.primaryCourseCode) || a.courseId.localeCompare(b.courseId),
  );
  const itemsById = new Map(orderedItems.map((item) => [item.courseId, item]));
  const facets: CourseDiscoveryFacets = {
    departments: getUniqueCatalogDepartments(orderedItems),
    terms: getUniqueCatalogOfferingTerms(orderedItems),
  };

  return {
    search(query = {}) {
      const page = positiveInteger(query.page, 1);
      const pageSize = Math.min(
        positiveInteger(query.pageSize, COURSE_DISCOVERY_DEFAULT_PAGE_SIZE),
        COURSE_DISCOVERY_MAX_PAGE_SIZE,
      );
      let filtered = filterCourseCatalogSearchItems(orderedItems, query);

      if (query.moocOnly) {
        filtered = filtered.filter((item) => item.tags.includes('MOOC'));
      }
      if (query.program && query.program !== 'all') {
        filtered = filtered.filter((item) =>
          item.offeringGroups.some((offeringGroup) => offeringGroup.program === query.program),
        );
      }

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / pageSize);
      const offset = (page - 1) * pageSize;

      return {
        content: filtered.slice(offset, offset + pageSize).map((item) => toListItem(item, query)),
        page,
        pageSize,
        totalElements,
        totalPages,
        facets,
      };
    },

    getDetail(courseId) {
      return (
        itemsById.get(courseId) ??
        orderedItems.find((item) => item.primaryCourseCode === courseId || item.aliasCodes.includes(courseId))
      );
    },
  };
}
