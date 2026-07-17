import {
  CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT,
  COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT,
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT,
  GraduationCatalogPublishBundleValidationError,
  createGraduationCatalogPublishBundle,
  stringifyGraduationCatalogPublishBundle,
  validateGraduationCatalogPublishBundle,
} from '../features/graduation/domain';

describe('graduation catalog publish bundle', () => {
  it('combines rule catalog and course equivalencies into one export artifact', () => {
    expect(GRADUATION_CATALOG_PUBLISH_BUNDLE).toMatchObject({
      schemaVersion: 1,
      sourceLayers: {
        schemaVersion: 1,
        layers: expect.arrayContaining([
          expect.objectContaining({
            id: 'gist-bachelor-manual-2026',
            manualYear: 2026,
            sourcePath: 'docs/bachelor_manual/2026_manual.pdf',
          }),
        ]),
      },
      ruleCatalog: {
        schemaVersion: 1,
        rules: expect.arrayContaining([
          expect.objectContaining({ id: 'basic-2021-plus.total-credits' }),
          expect.objectContaining({ id: 'minor.ir.ai-code-course-limit' }),
        ]),
      },
      courseEquivalencies: {
        schemaVersion: 1,
        equivalencies: expect.arrayContaining([
          expect.objectContaining({ id: 'ch-physical-chemistry-a-same-course' }),
          expect.objectContaining({ id: 'bs-biochemistry-i-renumbered' }),
        ]),
      },
    });
  });

  it('round-trips through JSON without losing fields', () => {
    const serialized = stringifyGraduationCatalogPublishBundle(GRADUATION_CATALOG_PUBLISH_BUNDLE);
    expect(JSON.parse(serialized)).toEqual(GRADUATION_CATALOG_PUBLISH_BUNDLE);
  });

  it('can build a bundle from explicit snapshots', () => {
    expect(
      createGraduationCatalogPublishBundle(
        CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT,
        GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT,
        COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT,
      ),
    ).toEqual(GRADUATION_CATALOG_PUBLISH_BUNDLE);
  });

  it('validates source layer coverage at the bundle boundary', () => {
    expect(() =>
      createGraduationCatalogPublishBundle(
        { schemaVersion: 1, layers: [] },
        GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT,
        COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT,
      ),
    ).toThrow(GraduationCatalogPublishBundleValidationError);
  });

  it('reports invalid nested schema versions before export', () => {
    const result = validateGraduationCatalogPublishBundle({
      ...GRADUATION_CATALOG_PUBLISH_BUNDLE,
      ruleCatalog: {
        ...GRADUATION_CATALOG_PUBLISH_BUNDLE.ruleCatalog,
        schemaVersion: 2,
      },
    } as unknown as typeof GRADUATION_CATALOG_PUBLISH_BUNDLE);

    expect(result.issues.map((issue) => issue.code)).toContain('invalid-schema-version');
  });
});
