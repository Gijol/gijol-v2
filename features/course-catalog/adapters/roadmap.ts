import type { RoadmapData } from '@/lib/types/roadmap';
import type { CourseCatalogRequirementFacet } from '../types';
import { normalizeCourseCode, roadmapPresetSourceRef } from '../normalize';

export interface RoadmapCatalogExtraction {
  facets: CourseCatalogRequirementFacet[];
  missingCourseCodeNodes: {
    preset: string;
    nodeId: string;
    label: string;
    semester?: string;
  }[];
}

export function buildRequirementFacetsFromRoadmaps(
  roadmapPresets: Readonly<Record<string, RoadmapData>>,
  resolveCourseId: (courseCode: string) => string,
): RoadmapCatalogExtraction {
  const facets: CourseCatalogRequirementFacet[] = [];
  const missingCourseCodeNodes: RoadmapCatalogExtraction['missingCourseCodeNodes'] = [];

  Object.entries(roadmapPresets).forEach(([preset, roadmap]) => {
    roadmap.nodes.forEach((node) => {
      const courseCode = normalizeCourseCode(node.data.courseCode);
      if (!courseCode) {
        missingCourseCodeNodes.push({
          preset,
          nodeId: node.id,
          label: node.data.label,
          semester: node.data.semester,
        });
        return;
      }

      facets.push({
        id: `roadmap:${preset}:${node.id}:${courseCode}`,
        courseId: resolveCourseId(courseCode),
        courseCode,
        feature: 'roadmap',
        category: node.data.category,
        classification: node.data.semester,
        programCode: roadmap.meta.major,
        sourceRefs: [roadmapPresetSourceRef(preset)],
      });
    });
  });

  return { facets, missingCourseCodeNodes };
}
