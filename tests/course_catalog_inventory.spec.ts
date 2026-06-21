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
    expect(snapshot.schemaVersion).toBe(2);
    expect(inspection.totals.courses).toBe(994);
    expect(inspection.totals.offerings).toBe(459);
    expect(inspection.totals.historicalOfferings).toBe(374);
    expect(inspection.totals.manualListings).toBe(3333);
    expect(inspection.totals.relationships).toBe(11);
    expect(inspection.historicalOfferingsByAcademicYear).toEqual({ 2025: 374 });
    expect(inspection.manualListingsByAcademicYear).toEqual({
      2020: 387,
      2021: 297,
      2022: 267,
      2023: 521,
      2024: 544,
      2025: 655,
      2026: 662,
    });
    expect(inspection.facetsByFeature).toEqual({
      minor: 648,
      recommendation: 211,
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
    expect(snapshot.historicalOfferings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'history:2025-1:AI2004',
          courseCode: 'AI2004',
          academicYear: 2025,
          semester: '1',
        }),
      ]),
    );
    expect(snapshot.manualListings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'manual-listing:2026:AI2004',
          courseCode: 'AI2004',
          academicYear: 2026,
          credits: 3,
          lectureHours: 3,
          labHours: 1,
          page: 87,
        }),
        expect.objectContaining({
          id: 'manual-listing:2025:HS4611',
          courseCode: 'HS4611',
          academicYear: 2025,
          page: 112,
        }),
        expect.objectContaining({
          id: 'manual-listing:2020:GS1001',
          courseCode: 'GS1001',
          academicYear: 2020,
          page: 43,
        }),
      ]),
    );
    expect(snapshot.requirementFacets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'recommendation:major-credits:EC:EC2202',
          courseCode: 'EC2202',
          feature: 'recommendation',
          requirementId: 'major-credits',
          programCode: 'EC',
          sortOrder: 2,
        }),
        expect.objectContaining({
          id: 'recommendation:science-calculus:common:GS1001',
          courseCode: 'GS1001',
          feature: 'recommendation',
          requirementId: 'science-calculus',
          sortOrder: 0,
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

    expect(COURSE_CATALOG_SNAPSHOT.schemaVersion).toBe(2);
    expect(validateCourseCatalogSnapshot(COURSE_CATALOG_SNAPSHOT)).toEqual([]);
    expect(sha256(generatedJson)).toBe(sha256(builtJson));
  });
});
