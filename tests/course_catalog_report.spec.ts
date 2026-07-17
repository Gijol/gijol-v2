import { buildCourseCatalogSnapshotFromWorkspace } from '../features/course-catalog/node';
import {
  buildCourseCatalogSourceDiffReport,
  renderCourseCatalogSourceDiffReportMarkdown,
} from '../features/course-catalog/report';

describe('course catalog source diff report', () => {
  it('summarizes manual vs registration offering differences', () => {
    const { snapshot } = buildCourseCatalogSnapshotFromWorkspace(process.cwd());
    const report = buildCourseCatalogSourceDiffReport(snapshot);

    expect(report.totals).toEqual(
      expect.objectContaining({
        offerings: 5448,
        manualListings: 3590,
        manualOnlyCourses: 134,
        offeredOnlyCourses: 358,
      }),
    );
    expect(report.termCoverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          term: '2026-2',
          sections: 507,
          uniqueCourseCodes: 399,
        }),
      ]),
    );
    expect(report.manualListedCoursesWithoutOffering).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryCode: 'AI4801',
        }),
      ]),
    );
    expect(report.offeredCoursesWithoutManualListing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryCode: 'AI3050',
        }),
      ]),
    );
    expect(report.offeringTitleVariants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          courseCode: 'AI4001',
        }),
      ]),
    );
  });

  it('renders a readable markdown report', () => {
    const { snapshot } = buildCourseCatalogSnapshotFromWorkspace(process.cwd());
    const markdown = renderCourseCatalogSourceDiffReportMarkdown(
      buildCourseCatalogSourceDiffReport(snapshot),
    );

    expect(markdown).toContain('# Course Catalog Source Diff Report');
    expect(markdown).toContain('## Manual Listed Without Actual Offering (134)');
    expect(markdown).toContain('## Actually Offered Without Manual Listing (358)');
    expect(markdown).toContain('| 2026-2 | 2026 2학기 | 507 | 399 |');
  });
});
