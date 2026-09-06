import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import { buildCourseCatalogSnapshotFromWorkspace } from '../features/course-catalog/node';
import {
  inspectCourseCatalogQuality,
  inspectCourseCatalogSnapshot,
  validateCourseCatalogSnapshot,
} from '../features/course-catalog/inspect';
import { stringifyCourseCatalogSnapshot } from '../features/course-catalog/serialization';
import { COURSE_CATALOG_SNAPSHOT } from '../features/course-catalog/generated';
import { TIMETABLE_SOURCES } from '../features/course-catalog/timetable-sources';

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

describe('course catalog inventory', () => {
  it('builds a canonical read-only snapshot from current course sources', () => {
    const { snapshot, diagnostics } = buildCourseCatalogSnapshotFromWorkspace(process.cwd());
    const inspection = inspectCourseCatalogSnapshot(snapshot);
    const quality = inspectCourseCatalogQuality(snapshot);

    expect(validateCourseCatalogSnapshot(snapshot)).toEqual([]);
    expect(snapshot.schemaVersion).toBe(2);
    expect(inspection.totals.courses).toBe(1298);
    expect(inspection.totals.offerings).toBe(5548);
    expect(Object.keys(inspection.offeringsByTerm)).toEqual(TIMETABLE_SOURCES.map((source) => source.term));
    expect(inspection.totals.historicalOfferings).toBe(4297);
    expect(inspection.totals.manualListings).toBe(4305);
    expect(inspection.totals.relationships).toBe(15);
    expect(inspection.historicalOfferingsByAcademicYear).toEqual({
      2020: 484,
      2021: 514,
      2022: 591,
      2023: 603,
      2024: 636,
      2025: 676,
      2026: 793,
    });
    expect(inspection.manualListingsByAcademicYear).toEqual({
      2020: 515,
      2021: 557,
      2022: 550,
      2023: 607,
      2024: 641,
      2025: 704,
      2026: 731,
    });
    expect(inspection.facetsByFeature).toEqual({
      minor: 628,
      recommendation: 213,
      roadmap: 774,
    });
    expect(diagnostics.syntheticCourseCount).toBe(689);
    expect(diagnostics.roadmapMissingCourseCodeNodes).toHaveLength(324);
    expect(quality.totals).toEqual({
      offeringsWithoutMeetings: 427,
      meetingsWithoutRoom: 3095,
      offeringsWithCapacityZero: 1552,
      instructorsWithoutStaffId: 0,
      offeringGroups: 4698,
      multiCodeOfferingGroups: 722,
      offeringGroupsWithMultipleDepartments: 719,
      offeringGroupsWithMultipleSections: 1,
      manualListedCoursesWithoutOffering: 219,
      offeredCoursesWithoutManualListing: 353,
    });
    expect(quality.byTerm['2026-1']).toEqual({
      offerings: 434,
      offeringsWithoutMeetings: 18,
      meetings: 762,
      meetingsWithoutRoom: 58,
      offeringsWithCapacityZero: 102,
      instructors: 496,
      instructorsWithoutStaffId: 0,
      offeringGroups: 366,
      multiCodeOfferingGroups: 56,
      offeringGroupsWithMultipleDepartments: 56,
      offeringGroupsWithMultipleSections: 0,
    });
    expect(quality.byTerm['2026-2']).toEqual({
      offerings: 607,
      offeringsWithoutMeetings: 138,
      meetings: 816,
      meetingsWithoutRoom: 584,
      offeringsWithCapacityZero: 266,
      instructors: 535,
      instructorsWithoutStaffId: 0,
      offeringGroups: 512,
      multiCodeOfferingGroups: 82,
      offeringGroupsWithMultipleDepartments: 79,
      offeringGroupsWithMultipleSections: 1,
    });
    expect(quality.samples.multiCodeOfferingGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          offeringGroupId: 'group:2020-1:BS3201:01',
          courseCodes: ['BS3201', 'EV3217'],
          sections: ['01'],
        }),
      ]),
    );
    expect(quality.samples.manualListedCoursesWithoutOffering).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryCode: 'AI4801',
        }),
      ]),
    );
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
          offeringId: '2026-1:AI2003:01',
          courseCode: 'AI2003',
          term: '2026-1',
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
    const generatedPath = join(process.cwd(), 'features/course-catalog/generated/course-catalog.snapshot.json');
    const generatedJson = readFileSync(generatedPath, 'utf8').trimEnd();
    const builtJson = stringifyCourseCatalogSnapshot(snapshot);

    expect(COURSE_CATALOG_SNAPSHOT.schemaVersion).toBe(2);
    expect(validateCourseCatalogSnapshot(COURSE_CATALOG_SNAPSHOT)).toEqual([]);
    expect(sha256(generatedJson)).toBe(sha256(builtJson));
  });
});
