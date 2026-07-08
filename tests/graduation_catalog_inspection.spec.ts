import {
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  formatGraduationCatalogInspection,
  inspectGraduationCatalogPublishBundle,
} from '../features/graduation/domain';

describe('graduation catalog inspection', () => {
  it('summarizes publish bundle source layer coverage', () => {
    const inspection = inspectGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE);
    const [sourceLayer] = inspection.sourceLayers;

    expect(inspection.totals).toMatchObject({
      sourceLayers: 1,
      rules: GRADUATION_CATALOG_PUBLISH_BUNDLE.ruleCatalog.rules.length,
      courseEquivalencies: GRADUATION_CATALOG_PUBLISH_BUNDLE.courseEquivalencies.equivalencies.length,
      evaluatorBackedRules: 1,
    });
    expect(sourceLayer).toMatchObject({
      id: 'gist-bachelor-manual-2026',
      manualYear: 2026,
      sourcePath: 'docs/bachelor_manual/2026_manual.pdf',
      ruleCount: GRADUATION_CATALOG_PUBLISH_BUNDLE.ruleCatalog.rules.length,
      courseEquivalencyCount: GRADUATION_CATALOG_PUBLISH_BUNDLE.courseEquivalencies.equivalencies.length,
    });
    expect(sourceLayer.pages.length).toBeGreaterThan(0);
    expect(inspection.unreferencedSourceLayerIds).toEqual([]);
  });

  it('summarizes tracked source page audit statuses', () => {
    const inspection = inspectGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE);
    const byPage = new Map(inspection.sourcePageAudits.map((audit) => [audit.page, audit]));

    expect(inspection.sourcePageAuditByStatus).toMatchObject({
      covered: 2,
      partial: 10,
      deferred: 2,
      'out-of-scope': 1,
    });
    expect(inspection.sourcePageAuditByStatus['catalog-gap']).toBeUndefined();
    expect(byPage.get(23)).toMatchObject({
      status: 'partial',
      referenced: true,
      ruleCount: expect.any(Number),
      courseEquivalencyCount: expect.any(Number),
    });
    expect(byPage.get(25)).toMatchObject({
      status: 'partial',
      referenced: true,
      ruleCount: expect.any(Number),
      courseEquivalencyCount: expect.any(Number),
    });
    expect(byPage.get(26)).toMatchObject({
      status: 'deferred',
      referenced: false,
    });
    expect(byPage.get(32)).toMatchObject({
      status: 'partial',
      referenced: true,
      ruleCount: expect.any(Number),
    });
    expect(byPage.get(31)).toMatchObject({
      status: 'out-of-scope',
      referenced: false,
    });
  });

  it('summarizes rule kinds, scopes, applicability, and evaluator ids', () => {
    const inspection = inspectGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(inspection.rulesByKind['credit-minimum']).toBeGreaterThan(0);
    expect(inspection.rulesByKind['course-limit']).toBe(1);
    expect(inspection.rulesByScope.global).toBeGreaterThan(0);
    expect(inspection.rulesByScope['program:minor']).toBeGreaterThan(0);
    expect(inspection.rulesByApplicabilitySignal.allCohorts).toBeGreaterThan(0);
    expect(inspection.rulesByApplicabilitySignal.entryYear).toBeGreaterThan(0);
    expect(inspection.rulesByEvaluatorId['ir-ai-code-course-limit']).toBe(1);
  });

  it('formats a stable human-readable report', () => {
    const inspection = inspectGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE);
    const output = formatGraduationCatalogInspection(inspection);

    expect(output).toContain('Graduation catalog inspect');
    expect(output).toContain('- source layers: 1');
    expect(output).toContain('gist-bachelor-manual-2026');
    expect(output).toContain('- evaluator-backed rules: 1');
    expect(output).toContain('- source page audit:');
    expect(output).toContain('partial: 10');
    expect(output).toContain(
      `- course equivalencies: ${GRADUATION_CATALOG_PUBLISH_BUNDLE.courseEquivalencies.equivalencies.length}`,
    );
  });

  it('keeps the inspection result JSON-serializable', () => {
    const inspection = inspectGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(JSON.parse(JSON.stringify(inspection))).toEqual(inspection);
  });
});
