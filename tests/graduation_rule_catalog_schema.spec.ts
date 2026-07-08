import {
  MAJOR_MINOR_REQUIREMENT_CATALOG_RULES,
  RULE_EVALUATOR_REGISTRY,
  validateRuleCatalog,
  type RuleCatalogScope,
  type RuleCatalogRule,
} from '../features/graduation/domain';

const sourceRef = {
  manualYear: 2026,
  page: 33,
  path: 'docs/bachelor_manual/2026_manual.pdf',
};

function getIssueCodes(rules: readonly RuleCatalogRule[]): string[] {
  return validateRuleCatalog(rules, { publishable: true }).issues.map((issue) => issue.code);
}

describe('graduation rule catalog schema validator', () => {
  it('accepts the current publishable major/minor catalog view', () => {
    expect(validateRuleCatalog(MAJOR_MINOR_REQUIREMENT_CATALOG_RULES, { publishable: true })).toMatchObject({
      ok: true,
      issues: [],
    });
  });

  it('rejects duplicate rule IDs before publish', () => {
    const issueCodes = getIssueCodes([
      {
        id: 'duplicate-rule',
        kind: 'credit-minimum',
        scope: { type: 'global' },
        parameters: { requiredCredits: 130, unit: 'credits' },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
      },
      {
        id: 'duplicate-rule',
        kind: 'credit-minimum',
        scope: { type: 'global' },
        parameters: { requiredCredits: 130, unit: 'credits' },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
      },
    ]);

    expect(issueCodes).toContain('duplicate-rule-id');
  });

  it('rejects publishable rules without source references', () => {
    const issueCodes = getIssueCodes([
      {
        id: 'rule-without-source',
        kind: 'credit-minimum',
        scope: { type: 'program-kind', programKind: 'major' },
        parameters: { requiredCredits: 36, unit: 'credits' },
        appliesTo: { allCohorts: true },
      },
    ]);

    expect(issueCodes).toContain('missing-source-ref');
  });

  it('rejects missing or conflicting applicability conditions', () => {
    const issueCodes = getIssueCodes([
      {
        id: 'rule-without-applies-to',
        kind: 'credit-minimum',
        scope: { type: 'program-kind', programKind: 'major' },
        parameters: { requiredCredits: 36, unit: 'credits' },
        sourceRefs: [sourceRef],
      },
      {
        id: 'rule-with-conflicting-applies-to',
        kind: 'credit-minimum',
        scope: { type: 'program-kind', programKind: 'major' },
        parameters: { requiredCredits: 36, unit: 'credits' },
        sourceRefs: [sourceRef],
        appliesTo: {
          allCohorts: true,
          entryYear: { from: 2021 },
        },
      },
    ]);

    expect(issueCodes).toContain('missing-applies-to');
    expect(issueCodes).toContain('conflicting-applies-to');
  });

  it('rejects unknown evaluator IDs', () => {
    const issueCodes = getIssueCodes([
      {
        id: 'custom-evaluator-rule',
        kind: 'course-limit',
        scope: { type: 'program', programKind: 'minor', programCodes: ['IR'] },
        parameters: { maxCourses: 4, unit: 'courses', reason: '테스트 제한' },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
        evaluatorId: 'admin-authored-special-logic',
      },
    ]);

    expect(issueCodes).toContain('unknown-evaluator-id');
  });

  it('accepts future double-major and advanced-major program scopes', () => {
    const doubleMajorScope = {
      type: 'program',
      programKind: 'double-major',
      programCodes: ['MM'],
    } as const satisfies RuleCatalogScope;
    const advancedMajorScope = {
      type: 'program-kind',
      programKind: 'advanced-major',
    } as const satisfies RuleCatalogScope;

    expect(
      validateRuleCatalog(
        [
          {
            id: 'double-major.mm.credits',
            kind: 'credit-minimum',
            scope: doubleMajorScope,
            parameters: { requiredCredits: 36, unit: 'credits' },
            sourceRefs: [sourceRef],
            appliesTo: { allCohorts: true },
          },
          {
            id: 'advanced-major.credits',
            kind: 'credit-minimum',
            scope: advancedMajorScope,
            parameters: { requiredCredits: 36, unit: 'credits' },
            sourceRefs: [sourceRef],
            appliesTo: { allCohorts: true },
          },
        ],
        { publishable: true },
      ),
    ).toMatchObject({
      ok: true,
      issues: [],
    });
  });

  it('exposes evaluator registry contracts for admin publish validation', () => {
    expect(RULE_EVALUATOR_REGISTRY['ir-ai-code-course-limit']).toMatchObject({
      id: 'ir-ai-code-course-limit',
      requiredKind: 'course-limit',
      parameterContract: 'CourseLimitRuleParameters',
      scopeContract: { type: 'program', programKind: 'minor', programCodes: ['IR'] },
    });
  });

  it('rejects evaluator rules that do not match the registered contract', () => {
    const issueCodes = getIssueCodes([
      {
        id: 'evaluator-with-wrong-kind',
        kind: 'course-count',
        scope: { type: 'program', programKind: 'minor', programCodes: ['IR'] },
        parameters: { maxCourses: 4, unit: 'courses', reason: '테스트 제한' },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
        evaluatorId: 'ir-ai-code-course-limit',
      },
      {
        id: 'evaluator-with-wrong-scope',
        kind: 'course-limit',
        scope: { type: 'program', programKind: 'minor', programCodes: ['AI'] },
        parameters: { maxCourses: 4, unit: 'courses', reason: '테스트 제한' },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
        evaluatorId: 'ir-ai-code-course-limit',
      },
      {
        id: 'evaluator-with-wrong-parameters',
        kind: 'course-limit',
        scope: { type: 'program', programKind: 'minor', programCodes: ['IR'] },
        parameters: { maxCourses: 0, unit: 'courses', reason: '테스트 제한' },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
        evaluatorId: 'ir-ai-code-course-limit',
      },
    ]);

    expect(issueCodes.filter((code) => code === 'invalid-evaluator-contract')).toHaveLength(3);
  });

  it('rejects missing scope and invalid primitive parameters', () => {
    const issueCodes = getIssueCodes([
      {
        id: 'rule-without-scope',
        kind: 'credit-minimum',
        parameters: { requiredCredits: 36, unit: 'credits' },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
      },
      {
        id: 'rule-with-invalid-parameters',
        kind: 'course-count',
        scope: { type: 'program', programKind: 'major', programCodes: ['EC'] },
        parameters: { requiredCount: 1, unit: 'courses', courses: [] },
        sourceRefs: [sourceRef],
        appliesTo: { allCohorts: true },
      },
    ]);

    expect(issueCodes).toContain('missing-scope');
    expect(issueCodes).toContain('invalid-parameters');
  });
});
