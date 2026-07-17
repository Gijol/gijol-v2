import {
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  diffGraduationCatalogPublishBundles,
  formatGraduationCatalogSnapshotDiff,
} from '../features/graduation/domain';

describe('graduation catalog snapshot diff', () => {
  it('reports matching bundles as ok', () => {
    const diff = diffGraduationCatalogPublishBundles(
      GRADUATION_CATALOG_PUBLISH_BUNDLE,
      GRADUATION_CATALOG_PUBLISH_BUNDLE,
    );

    expect(diff.ok).toBe(true);
    expect(formatGraduationCatalogSnapshotDiff(diff)).toBe('Graduation catalog snapshot matches.\n');
  });

  it('summarizes added, removed, and changed rule ids', () => {
    const [firstRule, ...remainingRules] = GRADUATION_CATALOG_PUBLISH_BUNDLE.ruleCatalog.rules;
    const actual = {
      ...GRADUATION_CATALOG_PUBLISH_BUNDLE,
      ruleCatalog: {
        ...GRADUATION_CATALOG_PUBLISH_BUNDLE.ruleCatalog,
        rules: [
          {
            ...remainingRules[0],
            label: `${remainingRules[0].label ?? remainingRules[0].id} changed`,
          },
          ...remainingRules.slice(1),
          {
            ...firstRule,
            id: 'test.added-rule',
          },
        ],
      },
    };

    const diff = diffGraduationCatalogPublishBundles(GRADUATION_CATALOG_PUBLISH_BUNDLE, actual);
    const formatted = formatGraduationCatalogSnapshotDiff(diff);

    expect(diff.ok).toBe(false);
    expect(diff.rules.removedIds).toEqual([firstRule.id]);
    expect(diff.rules.addedIds).toEqual(['test.added-rule']);
    expect(diff.rules.changedIds).toEqual([remainingRules[0].id]);
    expect(formatted).toContain(`rules removed: ${firstRule.id}`);
    expect(formatted).toContain('rules added: test.added-rule');
    expect(formatted).toContain(`rules changed: ${remainingRules[0].id}`);
  });

  it('summarizes source layer and nested schema version changes', () => {
    const actual = {
      ...GRADUATION_CATALOG_PUBLISH_BUNDLE,
      sourceLayers: {
        schemaVersion: 2,
        layers: [
          ...GRADUATION_CATALOG_PUBLISH_BUNDLE.sourceLayers.layers,
          {
            id: 'test-manual-2027',
            label: 'Test manual 2027',
            manualYear: 2027,
            sourcePath: 'docs/bachelor_manual/2027_manual.pdf',
          },
        ],
      },
    } as unknown as typeof GRADUATION_CATALOG_PUBLISH_BUNDLE;

    const diff = diffGraduationCatalogPublishBundles(GRADUATION_CATALOG_PUBLISH_BUNDLE, actual);
    const formatted = formatGraduationCatalogSnapshotDiff(diff);

    expect(diff.ok).toBe(false);
    expect(diff.nestedSchemaVersionChanges).toEqual(['sourceLayers.schemaVersion']);
    expect(diff.sourceLayers.addedIds).toEqual(['test-manual-2027']);
    expect(formatted).toContain('nested schemaVersion changed: sourceLayers.schemaVersion');
    expect(formatted).toContain('source layers added: test-manual-2027');
  });
});
