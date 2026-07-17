import { buildCourseCatalogSnapshotFromWorkspace } from '../../features/course-catalog/node';
import {
  inspectCourseCatalogQuality,
  inspectCourseCatalogSnapshot,
  validateCourseCatalogSnapshot,
} from '../../features/course-catalog/inspect';

const { snapshot, diagnostics } = buildCourseCatalogSnapshotFromWorkspace();
const issues = validateCourseCatalogSnapshot(snapshot);

if (issues.length > 0) {
  console.error('Invalid course catalog snapshot:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(JSON.stringify({
  inspection: inspectCourseCatalogSnapshot(snapshot),
  quality: inspectCourseCatalogQuality(snapshot),
  diagnostics: {
    syntheticCourseCount: diagnostics.syntheticCourseCount,
    roadmapMissingCourseCodeNodes: diagnostics.roadmapMissingCourseCodeNodes.length,
  },
}, null, 2));
