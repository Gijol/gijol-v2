import {
  CATALOG_SOURCE_LAYERS,
  CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT,
  GRADUATION_RULE_CATALOG,
  createCatalogSourceLayerPublishSnapshot,
  validateCatalogSourceLayers,
  type CatalogSourceLayer,
  type RuleCatalogRule,
} from '../features/graduation/domain';

const sourceRef = {
  manualYear: 2026,
  page: 33,
  path: 'docs/bachelor_manual/2026_manual.pdf',
};

function issueCodes(layers: readonly CatalogSourceLayer[], rules: readonly RuleCatalogRule[] = []): string[] {
  return validateCatalogSourceLayers(layers, rules).issues.map((issue) => issue.code);
}

describe('graduation catalog source layers', () => {
  it('registers current rules and verified historical exception sources', () => {
    expect(validateCatalogSourceLayers(CATALOG_SOURCE_LAYERS, GRADUATION_RULE_CATALOG)).toMatchObject({
      ok: true,
      issues: [],
    });
    expect(CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT.schemaVersion).toBe(1);
    expect(CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT.layers.map((layer) => layer.manualYear).sort()).toEqual([
      2020, 2021, 2023, 2024, 2025, 2026,
    ]);
    for (const layer of CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT.layers) {
      expect(layer.sourcePath).toBe(`docs/bachelor_manual/${layer.manualYear}_manual.pdf`);
    }
  });

  it('rejects duplicate or invalid source layer metadata', () => {
    const codes = issueCodes([
      {
        id: 'duplicate-layer',
        label: 'Layer A',
        manualYear: 2026,
        sourcePath: 'docs/bachelor_manual/2026_manual.pdf',
      },
      {
        id: 'duplicate-layer',
        label: 'Layer B',
        manualYear: 2027,
        sourcePath: 'docs/bachelor_manual/2027_manual.pdf',
      },
      {
        id: '',
        label: '',
        manualYear: 0,
        sourcePath: '',
      },
    ]);

    expect(codes).toContain('duplicate-source-layer-id');
    expect(codes).toContain('invalid-source-layer');
  });

  it('rejects rule sourceRefs that do not match a registered layer', () => {
    const codes = issueCodes(CATALOG_SOURCE_LAYERS, [
      {
        id: 'unregistered-source-rule',
        kind: 'credit-minimum',
        scope: { type: 'global' },
        parameters: { requiredCredits: 130, unit: 'credits' },
        sourceRefs: [{ ...sourceRef, manualYear: 2027, path: 'docs/bachelor_manual/2027_manual.pdf' }],
        appliesTo: { allCohorts: true },
      },
    ]);

    expect(codes).toContain('unregistered-source-ref');
  });

  it('rejects non-JSON layer values before publish', () => {
    const codes = issueCodes([
      {
        id: 'layer-with-undefined-description',
        label: 'Layer',
        manualYear: 2026,
        sourcePath: 'docs/bachelor_manual/2026_manual.pdf',
        description: undefined,
      },
    ]);

    expect(codes).toContain('not-json-serializable');
  });

  it('creates a JSON publish snapshot for valid layers', () => {
    expect(JSON.parse(JSON.stringify(createCatalogSourceLayerPublishSnapshot(CATALOG_SOURCE_LAYERS)))).toEqual(
      CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT,
    );
  });
});
