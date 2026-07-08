import type { RoadmapData } from '@/lib/types/roadmap';
import { normalizeCourseCode } from './normalize';
import { createCourseCatalogSearchItems, type CourseCatalogSearchItem } from './search';

const ROADMAP_ONLY_SOURCE_KIND = 'roadmap-preset';

function hasNonRoadmapEvidence(item: CourseCatalogSearchItem): boolean {
  return item.sourceRefs.some((sourceRef) => sourceRef.kind !== ROADMAP_ONLY_SOURCE_KIND);
}

function createRoadmapCatalogLookup(
  items: readonly CourseCatalogSearchItem[] = createCourseCatalogSearchItems(),
): Map<string, CourseCatalogSearchItem> {
  const byCode = new Map<string, CourseCatalogSearchItem>();

  items.filter(hasNonRoadmapEvidence).forEach((item) => {
    [item.primaryCourseCode, ...item.aliasCodes].forEach((courseCode) => {
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

export function enrichRoadmapDataWithCatalog(
  roadmapData: RoadmapData,
  items: readonly CourseCatalogSearchItem[] = createCourseCatalogSearchItems(),
): RoadmapData {
  const catalogByCode = createRoadmapCatalogLookup(items);
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

    const item = catalogByCode.get(courseCode);
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
}
