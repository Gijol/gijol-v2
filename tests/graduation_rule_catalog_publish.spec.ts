import {
  COMPILED_GRADUATION_RULE_CATALOG,
  GRADUATION_RULE_CATALOG,
  GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT,
  RuleCatalogSerializationError,
  createRuleCatalogPublishSnapshot,
  selectRulesForContext,
  stringifyRuleCatalogPublishSnapshot,
  validateJsonSerializableRuleCatalog,
  validateRuleCatalog,
} from '../features/graduation/domain';

const sourceRef = {
  manualYear: 2026,
  page: 33,
  path: 'docs/bachelor_manual/2026_manual.pdf',
};

describe('publishable graduation rule catalog', () => {
  it('combines basic and major/minor rule catalogs without duplicate IDs', () => {
    const ids = GRADUATION_RULE_CATALOG.map((rule) => rule.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(validateRuleCatalog(GRADUATION_RULE_CATALOG, { publishable: true })).toMatchObject({
      ok: true,
      issues: [],
    });
  });

  it('compiles a single catalog boundary for publish and runtime selection', () => {
    expect(COMPILED_GRADUATION_RULE_CATALOG.byId.get('basic-2021-plus.total-credits')).toMatchObject({
      kind: 'credit-minimum',
      scope: { type: 'global' },
    });
    expect(COMPILED_GRADUATION_RULE_CATALOG.byId.get('major-credits.2021-plus')).toMatchObject({
      kind: 'credit-minimum',
      scope: { type: 'program-kind', programKind: 'major' },
    });
    expect(COMPILED_GRADUATION_RULE_CATALOG.byId.get('minor.ir.ai-code-course-limit')).toMatchObject({
      kind: 'course-limit',
      evaluatorId: 'ir-ai-code-course-limit',
    });
  });

  it('selects applicable rules across basic and major/minor layers for one student context', () => {
    const selection = selectRulesForContext(COMPILED_GRADUATION_RULE_CATALOG, {
      entryYear: 2021,
      programCodes: {
        major: ['EC'],
        minor: ['IR'],
      },
    });
    const selectedIds = selection.applicableRules.map((rule) => rule.id);

    expect(selectedIds).toContain('basic-2021-plus.total-credits');
    expect(selectedIds).toContain('basic-2021-plus.etc-major-exploration');
    expect(selectedIds).toContain('major-credits.2021-plus');
    expect(selectedIds).toContain('minor.ir.ai-code-course-limit');
    expect(selectedIds).not.toContain('minor.ai.mandatory.a');
    expect(selectedIds).not.toContain('major.ch.mandatory.analytical-chemistry');
    expect(selectedIds).not.toContain('basic-2020.arts');
    expect(selectedIds).not.toContain('major-credits.2018-2020');
  });

  it('keeps program-scoped rules out of applicable results when program context is missing', () => {
    const selection = selectRulesForContext(COMPILED_GRADUATION_RULE_CATALOG, { entryYear: 2021 });
    const selectedIds = selection.applicableRules.map((rule) => rule.id);
    const needsContextIds = selection.needsContext.map(({ rule }) => rule.id);

    expect(selectedIds).toContain('basic-2021-plus.total-credits');
    expect(selectedIds).not.toContain('major-credits.2021-plus');
    expect(selectedIds).not.toContain('minor.ir.ai-code-course-limit');
    expect(needsContextIds).toContain('major-credits.2021-plus');
    expect(needsContextIds).toContain('minor.ir.ai-code-course-limit');
  });

  it('exports a JSON-serializable publish snapshot without losing rule fields', () => {
    expect(validateJsonSerializableRuleCatalog(GRADUATION_RULE_CATALOG)).toMatchObject({
      ok: true,
      issues: [],
    });

    expect(GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT).toMatchObject({
      schemaVersion: 1,
      rules: expect.arrayContaining([
        expect.objectContaining({ id: 'basic-2021-plus.total-credits' }),
        expect.objectContaining({ id: 'minor.ir.ai-code-course-limit', evaluatorId: 'ir-ai-code-course-limit' }),
      ]),
    });

    const serialized = stringifyRuleCatalogPublishSnapshot(GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT);
    expect(JSON.parse(serialized)).toEqual(GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT);
  });

  it('rejects publish snapshots that would lose values during JSON serialization', () => {
    expect(() =>
      createRuleCatalogPublishSnapshot([
        {
          id: 'rule-with-undefined-parameter',
          kind: 'credit-minimum',
          scope: { type: 'global' },
          parameters: { requiredCredits: 130, unit: 'credits', note: undefined },
          sourceRefs: [sourceRef],
          appliesTo: { allCohorts: true },
        },
      ]),
    ).toThrow(RuleCatalogSerializationError);

    expect(() =>
      createRuleCatalogPublishSnapshot([
        {
          id: 'rule-with-function-parameter',
          kind: 'credit-minimum',
          scope: { type: 'global' },
          parameters: { requiredCredits: 130, unit: 'credits', compute: () => 130 },
          sourceRefs: [sourceRef],
          appliesTo: { allCohorts: true },
        },
      ]),
    ).toThrow(RuleCatalogSerializationError);
  });
});
