import type { RoadmapData } from '@/lib/types/roadmap';
import { createCourseDiscovery } from './discovery';
import { expandCourseCodeCandidates, getCourseCodeSearchVariants, normalizeCourseCode } from './normalize';
import type { CourseCatalogSearchItem } from './search';

const ROADMAP_ONLY_SOURCE_KIND = 'roadmap-preset';

export const ROADMAP_COURSE_CANDIDATE_PAGE_SIZE = 50;

export interface RoadmapCourseCandidate {
  courseId: string;
  primaryCourseCode: string;
  displayTitleKo: string;
  displayTitleEn: string;
  aliasCodes: readonly string[];
  creditHours: number;
}

export interface RoadmapCourseCandidatePage {
  content: RoadmapCourseCandidate[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface RoadmapCourseCandidateQuery {
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface RoadmapCatalog {
  enrichPreset(roadmapData: RoadmapData): RoadmapData;
  searchCandidates(query?: RoadmapCourseCandidateQuery): RoadmapCourseCandidatePage;
}

function hasNonRoadmapEvidence(item: CourseCatalogSearchItem): boolean {
  return item.sourceRefs.some((sourceRef) => sourceRef.kind !== ROADMAP_ONLY_SOURCE_KIND);
}

function createRoadmapCatalogLookup(items: readonly CourseCatalogSearchItem[]): Map<string, CourseCatalogSearchItem> {
  const byCode = new Map<string, CourseCatalogSearchItem>();

  items.filter(hasNonRoadmapEvidence).forEach((item) => {
    getCourseCodeSearchVariants([item.primaryCourseCode, ...item.aliasCodes]).forEach((courseCode) => {
      const normalized = normalizeCourseCode(courseCode);
      if (normalized && !byCode.has(normalized)) {
        byCode.set(normalized, item);
      }
    });
  });

  return byCode;
}

function toCatalogInfo(item: CourseCatalogSearchItem) {
  return {
    courseId: item.courseId,
    primaryCourseCode: item.primaryCourseCode,
    displayTitleKo: item.displayTitleKo,
    displayTitleEn: item.displayTitleEn || undefined,
    aliasCodes: item.aliasCodes,
    departments: item.departments,
    tags: item.tags,
    creditHours: item.creditHours,
    lectureHours: item.lectureHours,
    labHours: item.labHours,
    description: item.description || undefined,
    manualListings: item.manualListings,
    offerings: item.offerings.map((offering) => ({
      offeringId: offering.offeringId,
      courseCode: offering.courseCode,
      term: offering.term,
      section: offering.section,
      meetings: offering.meetings,
      equivalentCourseCodes: offering.equivalentCourseCodes,
    })),
    offeringGroups: item.offeringGroups.map((offeringGroup) => ({
      offeringGroupId: offeringGroup.offeringGroupId,
      term: offeringGroup.term,
      section: offeringGroup.section,
      courseCodes: offeringGroup.courseCodes,
      sections: offeringGroup.sections,
      departments: offeringGroup.departments,
      department: offeringGroup.department,
      category: offeringGroup.category,
      program: offeringGroup.program,
      meetings: offeringGroup.meetings,
      meetingBadges: offeringGroup.meetingBadges,
    })),
  };
}

export function createRoadmapCatalog(items: readonly CourseCatalogSearchItem[]): RoadmapCatalog {
  const supportedItems = items.filter(hasNonRoadmapEvidence);
  const catalogByCode = createRoadmapCatalogLookup(supportedItems);
  const candidateDiscovery = createCourseDiscovery(supportedItems);

  return {
    enrichPreset(roadmapData) {
      const unresolvedCourseCodes = new Set<string>();
      let enrichedNodeCount = 0;
      let missingCourseCodeNodeCount = 0;

      const nodes = roadmapData.nodes.map((node) => {
        if (node.type === 'semesterHeader') return node;

        const courseCode = normalizeCourseCode(node.data.courseCode);
        if (!courseCode) {
          missingCourseCodeNodeCount += 1;
          return node;
        }

        const item = expandCourseCodeCandidates(courseCode)
          .map((candidate) => catalogByCode.get(candidate))
          .find((candidate): candidate is CourseCatalogSearchItem => Boolean(candidate));
        if (!item) {
          unresolvedCourseCodes.add(courseCode);
          return node;
        }

        enrichedNodeCount += 1;
        return {
          ...node,
          data: {
            ...node.data,
            label: item.displayTitleKo || node.data.label,
            credits: item.creditHours || node.data.credits,
            catalog: toCatalogInfo(item),
          },
        };
      });

      return {
        ...roadmapData,
        meta: {
          ...roadmapData.meta,
          catalog: {
            enrichedNodeCount,
            missingCourseCodeNodeCount,
            unresolvedCourseCodes: Array.from(unresolvedCourseCodes).sort(),
          },
        },
        nodes,
      };
    },

    searchCandidates(query = {}) {
      const result = candidateDiscovery.search({
        query: query.query,
        page: query.page,
        pageSize: query.pageSize ?? ROADMAP_COURSE_CANDIDATE_PAGE_SIZE,
      });

      return {
        content: result.content.map((course) => ({
          courseId: course.courseId,
          primaryCourseCode: course.primaryCourseCode,
          displayTitleKo: course.displayTitleKo,
          displayTitleEn: course.displayTitleEn,
          aliasCodes: course.aliasCodes,
          creditHours: course.creditHours,
        })),
        page: result.page,
        pageSize: result.pageSize,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      };
    },
  };
}

export function enrichRoadmapDataWithCatalog(
  roadmapData: RoadmapData,
  items: readonly CourseCatalogSearchItem[],
): RoadmapData {
  return createRoadmapCatalog(items).enrichPreset(roadmapData);
}
