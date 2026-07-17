import {
  filterCourseCatalogSearchItems,
  getUniqueCatalogDepartments,
  getUniqueCatalogOfferingTerms,
  type CourseCatalogSearchFilters,
  type CourseCatalogSearchItem,
} from './search';
import type { CourseCatalogOffering } from './types';

export const COURSE_DISCOVERY_DEFAULT_PAGE_SIZE = 24;
export const COURSE_DISCOVERY_MAX_PAGE_SIZE = 100;

export interface CourseDiscoveryQuery extends CourseCatalogSearchFilters {
  moocOnly?: boolean;
  program?: CourseCatalogOffering['program'] | 'all';
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

function toListItem(item: CourseCatalogSearchItem): CourseDiscoveryListItem {
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
        content: filtered.slice(offset, offset + pageSize).map(toListItem),
        page,
        pageSize,
        totalElements,
        totalPages,
        facets,
      };
    },

    getDetail(courseId) {
      return itemsById.get(courseId);
    },
  };
}
