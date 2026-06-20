import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import { buildCourseCatalogSnapshotFromWorkspace } from '../features/course-catalog/node';
import { inspectCourseCatalogSnapshot, validateCourseCatalogSnapshot } from '../features/course-catalog/inspect';
import { stringifyCourseCatalogSnapshot } from '../features/course-catalog/serialization';
import { COURSE_CATALOG_SNAPSHOT } from '../features/course-catalog/generated';

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

describe('course catalog inventory', () => {
  it('builds a canonical read-only snapshot from current course sources', () => {
    const { snapshot, diagnostics } = buildCourseCatalogSnapshotFromWorkspace(process.cwd());
    const inspection = inspectCourseCatalogSnapshot(snapshot);

    expect(validateCourseCatalogSnapshot(snapshot)).toEqual([]);
    expect(snapshot.schemaVersion).toBe(1);
    expect(inspection.totals.courses).toBe(994);
    expect(inspection.totals.offerings).toBe(459);
    expect(inspection.totals.relationships).toBe(11);
    expect(inspection.facetsByFeature).toEqual({
      minor: 648,
      recommendation: 148,
      roadmap: 774,
    });
    expect(diagnostics.syntheticCourseCount).toBe(380);
    expect(diagnostics.roadmapMissingCourseCodeNodes).toHaveLength(324);
    expect(snapshot.courses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          courseId: 'UG_THESIS_RESEARCH_I',
          primaryCode: 'AI9102',
          aliases: expect.arrayContaining([
            expect.objectContaining({ code: 'BS9102' }),
            expect.objectContaining({ code: 'EC9102' }),
          ]),
        }),
      ]),
    );
    expect(snapshot.offerings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          offeringId: '2026-spring:AI2003:01',
          courseCode: 'AI2003',
          term: '2026-spring',
        }),
      ]),
    );
  });

  it('keeps the generated course catalog snapshot in sync with the builder', () => {
    const { snapshot } = buildCourseCatalogSnapshotFromWorkspace(process.cwd());
    const generatedPath = join(
      process.cwd(),
      'features/course-catalog/generated/course-catalog.snapshot.json',
    );
    const generatedJson = readFileSync(generatedPath, 'utf8').trimEnd();
    const builtJson = stringifyCourseCatalogSnapshot(snapshot);

    expect(COURSE_CATALOG_SNAPSHOT.schemaVersion).toBe(1);
    expect(validateCourseCatalogSnapshot(COURSE_CATALOG_SNAPSHOT)).toEqual([]);
    expect(sha256(generatedJson)).toBe(sha256(builtJson));
  });
});
