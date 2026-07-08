import { COURSE_CATALOG_SNAPSHOT } from './generated';
import type {
  CourseCatalogCourse,
  CourseCatalogManualListing,
  CourseCatalogOffering,
  CourseCatalogRequirementFacet,
  CourseCatalogSnapshot,
  CourseCatalogSourceKind,
  CourseCatalogSourceRef,
} from './types';
import { buildCourseOfferingGroups, type CourseOfferingGroup } from './offering-view';
import { normalizeCourseCode, uniqueSourceRefs, uniqueStrings } from './normalize';

export interface CourseCatalogSearchItem {
  courseId: string;
  primaryCourseCode: string;
  displayTitleKo: string;
  displayTitleEn: string;
  aliasCodes: readonly string[];
  departments: readonly string[];
  tags: readonly string[];
  creditHours: number;
  lectureHours: number;
  labHours: number;
  level: number;
  lifecycleStatus: NonNullable<CourseCatalogCourse['lifecycle']>['status'];
  description: string;
  sourceRefs: readonly CourseCatalogSourceRef[];
  offerings: readonly {
    offeringId: string;
    courseCode: string;
    term: string;
    section: string;
    department?: string;
    category?: string;
    program?: CourseCatalogOffering['program'];
    meetings: CourseCatalogOffering['meetings'];
    equivalentCourseCodes: readonly string[];
  }[];
  offeringGroups: readonly CourseOfferingGroup[];
  manualListings: readonly {
    id: string;
    courseCode: string;
    academicYear: number;
    titleKo?: string;
    credits?: number;
    lectureHours?: number;
    labHours?: number;
    departments: readonly string[];
    page?: number;
  }[];
  facets: readonly {
    feature: CourseCatalogRequirementFacet['feature'];
    category: string;
    classification?: string;
    programCode?: string;
  }[];
  matchText: string;
}

export interface CourseCatalogSearchFilters {
  query?: string;
  category?: 'all' | 'mandatory' | 'humanities' | 'science' | 'major' | 'offered';
  departments?: readonly string[];
  terms?: readonly string[];
  level?: number | 'other' | 'all';
  credit?: number | '4+' | 'all';
  offeredOnly?: boolean;
  labOnly?: boolean;
  feature?: CourseCatalogRequirementFacet['feature'] | 'all';
  sourceKind?: CourseCatalogSourceKind | 'all';
}

function courseLevel(course: CourseCatalogCourse): number {
  if (course.level) return Math.floor(course.level / 1000) * 1000;
  const match = course.primaryCode.match(/\d/);
  if (!match) return 0;
  return Number(match[0]) * 1000;
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function isMajorCode(code: string): boolean {
  return ['EC', 'MA', 'MC', 'BS', 'EV', 'AI', 'PS', 'CH', 'MM', 'MD', 'SE', 'CT', 'FE', 'IR'].some((prefix) =>
    code.startsWith(prefix),
  );
}

function categoryMatches(item: CourseCatalogSearchItem, category: CourseCatalogSearchFilters['category']): boolean {
  if (!category || category === 'all') return true;
  const code = item.primaryCourseCode;
  if (category === 'mandatory') return code.startsWith('UC') || code.startsWith('GS1');
  if (category === 'humanities') return code.startsWith('HS');
  if (category === 'science') return code.startsWith('GS') && !code.startsWith('GS1');
  if (category === 'major') return isMajorCode(code);
  if (category === 'offered') return item.offerings.length > 0 || item.lifecycleStatus === 'active';
  return true;
}

function meetingKey(meeting: CourseCatalogOffering['meetings'][number]): string {
  return [
    meeting.day,
    meeting.start,
    meeting.end,
    meeting.room ?? '',
  ].join(':');
}

function offeringGroupKey(offering: CourseCatalogOffering): string {
  return [
    offering.term,
    offering.section,
    offering.meetings.map(meetingKey).sort().join('|'),
  ].join('::');
}

function compactOfferingsBySchedule(offerings: readonly CourseCatalogOffering[]): CourseCatalogSearchItem['offerings'] {
  const byKey = new Map<string, CourseCatalogSearchItem['offerings'][number]>();

  offerings.forEach((offering) => {
    const key = offeringGroupKey(offering);
    const existing = byKey.get(key);
    const equivalentCourseCodes = uniqueStrings([
      ...(existing?.equivalentCourseCodes ?? []),
      offering.courseCode,
    ]);

    byKey.set(key, {
      offeringId: existing?.offeringId ?? offering.offeringId,
      courseCode: equivalentCourseCodes[0] ?? offering.courseCode,
      term: offering.term,
      section: offering.section,
      department: existing?.department ?? offering.department,
      category: existing?.category ?? offering.category,
      program: existing?.program ?? offering.program,
      meetings: offering.meetings,
      equivalentCourseCodes,
    });
  });

  return Array.from(byKey.values()).sort((a, b) =>
    a.term.localeCompare(b.term) ||
    a.section.localeCompare(b.section) ||
    a.equivalentCourseCodes.join(',').localeCompare(b.equivalentCourseCodes.join(',')));
}

export function createCourseCatalogSearchItems(
  snapshot: CourseCatalogSnapshot = COURSE_CATALOG_SNAPSHOT,
): CourseCatalogSearchItem[] {
  const offeringsByCourseId = new Map<string, CourseCatalogOffering[]>();
  const manualListingsByCourseId = new Map<string, CourseCatalogManualListing[]>();
  const facetsByCourseId = new Map<string, CourseCatalogRequirementFacet[]>();

  snapshot.offerings.forEach((offering) => {
    offeringsByCourseId.set(offering.courseId, [...(offeringsByCourseId.get(offering.courseId) ?? []), offering]);
  });
  snapshot.manualListings.forEach((listing) => {
    manualListingsByCourseId.set(listing.courseId, [...(manualListingsByCourseId.get(listing.courseId) ?? []), listing]);
  });
  snapshot.requirementFacets.forEach((facet) => {
    facetsByCourseId.set(facet.courseId, [...(facetsByCourseId.get(facet.courseId) ?? []), facet]);
  });

  return snapshot.courses.map((course) => {
    const offerings = offeringsByCourseId.get(course.courseId) ?? [];
    const manualListings = manualListingsByCourseId.get(course.courseId) ?? [];
    const facets = facetsByCourseId.get(course.courseId) ?? [];
    const aliasCodes = uniqueStrings(course.aliases.map((alias) => normalizeCourseCode(alias.code)));
    const sourceRefs = uniqueSourceRefs([
      ...course.sourceRefs,
      ...course.aliases.flatMap((alias) => alias.sourceRefs ?? []),
      ...offerings.flatMap((offering) => offering.sourceRefs),
      ...manualListings.flatMap((listing) => listing.sourceRefs),
      ...facets.flatMap((facet) => facet.sourceRefs),
    ]);
    const compactOfferings = compactOfferingsBySchedule(offerings);
    const offeringGroups = buildCourseOfferingGroups(offerings);
    const compactFacets = facets.map((facet) => ({
      feature: facet.feature,
      category: facet.category,
      classification: facet.classification,
      programCode: facet.programCode,
    }));
    const compactManualListings = manualListings.map((listing) => ({
      id: listing.id,
      courseCode: listing.courseCode,
      academicYear: listing.academicYear,
      titleKo: listing.titleKo,
      credits: listing.credits,
      lectureHours: listing.lectureHours,
      labHours: listing.labHours,
      departments: listing.departments,
      page: listing.page,
    }));
    const departments = uniqueStrings([
      ...course.departments,
      ...offerings.map((offering) => offering.department ?? ''),
      ...manualListings.flatMap((listing) => listing.departments),
    ]);
    const tags = uniqueStrings([
      ...course.tags,
      ...facets.map((facet) => facet.category),
      ...facets.map((facet) => facet.classification ?? ''),
    ]);
    const matchText = normalizeSearchText([
      course.primaryCode,
      course.titleKo,
      course.titleEn ?? '',
      course.description ?? '',
      ...aliasCodes,
      ...departments,
      ...tags,
      ...manualListings.map((listing) => String(listing.academicYear)),
      ...facets.map((facet) => facet.programCode ?? ''),
    ].join(' '));

    return {
      courseId: course.courseId,
      primaryCourseCode: course.primaryCode,
      displayTitleKo: course.titleKo,
      displayTitleEn: course.titleEn ?? '',
      aliasCodes,
      departments,
      tags,
      creditHours: course.credits,
      lectureHours: course.lectureHours ?? 0,
      labHours: course.labHours ?? 0,
      level: courseLevel(course),
      lifecycleStatus: course.lifecycle?.status ?? 'unknown',
      description: course.description ?? '',
      sourceRefs,
      offerings: compactOfferings,
      offeringGroups,
      manualListings: compactManualListings,
      facets: compactFacets,
      matchText,
    };
  }).sort((a, b) => a.primaryCourseCode.localeCompare(b.primaryCourseCode));
}

export function filterCourseCatalogSearchItems(
  items: readonly CourseCatalogSearchItem[],
  filters: CourseCatalogSearchFilters,
): CourseCatalogSearchItem[] {
  const query = normalizeSearchText(filters.query ?? '');
  return items.filter((item) => {
    if (query && !item.matchText.includes(query)) return false;
    if (!categoryMatches(item, filters.category)) return false;
    if (filters.departments?.length) {
      const matchesDepartment = item.departments.some((department) =>
        filters.departments?.some((selected) => department.includes(selected)));
      if (!matchesDepartment) return false;
    }
    if (filters.terms?.length) {
      const matchesTerm = item.offeringGroups.some((offeringGroup) =>
        filters.terms?.includes(offeringGroup.term));
      if (!matchesTerm) return false;
    }
    if (filters.level && filters.level !== 'all') {
      if (filters.level === 'other') {
        if (item.level > 0 && item.level < 5000) return false;
      } else if (item.level !== filters.level) {
        return false;
      }
    }
    if (filters.credit && filters.credit !== 'all') {
      if (filters.credit === '4+') {
        if (item.creditHours < 4) return false;
      } else if (item.creditHours !== filters.credit) {
        return false;
      }
    }
    if (filters.offeredOnly && item.offeringGroups.length === 0 && item.lifecycleStatus !== 'active') return false;
    if (filters.labOnly && item.labHours <= 0) return false;
    if (filters.feature && filters.feature !== 'all') {
      if (!item.facets.some((facet) => facet.feature === filters.feature)) return false;
    }
    if (filters.sourceKind && filters.sourceKind !== 'all') {
      if (!item.sourceRefs.some((sourceRef) => sourceRef.kind === filters.sourceKind)) return false;
    }
    return true;
  });
}

export function getUniqueCatalogDepartments(items: readonly CourseCatalogSearchItem[]): string[] {
  return uniqueStrings(items.flatMap((item) => item.departments));
}

export function getUniqueCatalogOfferingTerms(items: readonly CourseCatalogSearchItem[]): string[] {
  return uniqueStrings(items.flatMap((item) => item.offeringGroups.map((offeringGroup) => offeringGroup.term)));
}
