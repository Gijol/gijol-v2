import {
  MAJOR_MINOR_REQUIREMENT_CATALOG_RULES,
  RuleCatalogCompileError,
  compileRuleCatalog,
  evaluateRuleApplicability,
  selectRulesForContext,
  type RuleCatalogRule,
} from '../features/graduation/domain';

const sourceRef = {
  manualYear: 2026,
  page: 33,
  path: 'docs/bachelor_manual/2026_manual.pdf',
};

describe('graduation rule catalog compiler', () => {
  it('compiles the current major/minor catalog into stable lookup indexes', () => {
    const compiled = compileRuleCatalog(MAJOR_MINOR_REQUIREMENT_CATALOG_RULES);

    expect(compiled.byId.get('major-credits.2021-plus')).toMatchObject({
      kind: 'credit-minimum',
      scope: { type: 'program', programKind: 'major' },
      parameters: { requiredCredits: 36, unit: 'credits' },
      sourceRefs: [expect.objectContaining({ manualYear: 2026 })],
    });
    expect(compiled.byKind.get('course-limit')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'minor.ir.ai-code-course-limit',
          evaluatorId: 'ir-ai-code-course-limit',
          scope: { type: 'program', programKind: 'minor', programCodes: ['IR'] },
          parameters: {
            maxCourses: 4,
            unit: 'courses',
            reason: expect.any(String),
          },
        }),
      ]),
    );
    expect(compiled.byEvaluatorId.get('ir-ai-code-course-limit')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'minor.ir.ai-code-course-limit' })]),
    );
  });

  it('throws a structured compile error for invalid publishable catalog rules', () => {
    expect(() =>
      compileRuleCatalog([
        {
          id: 'invalid-rule',
          kind: 'credit-minimum',
          scope: { type: 'program-kind', programKind: 'major' },
          parameters: { requiredCredits: 36, unit: 'credits' },
          appliesTo: { allCohorts: true },
        },
      ]),
    ).toThrow(RuleCatalogCompileError);
  });

  it('selects entry-year and scope applicable rules without choosing a manual year', () => {
    const compiled = compileRuleCatalog(MAJOR_MINOR_REQUIREMENT_CATALOG_RULES);
    const selection = selectRulesForContext(compiled, {
      entryYear: 2021,
      programCodes: {
        major: ['EC'],
      },
    });
    const selectedIds = selection.applicableRules.map((rule) => rule.id);

    expect(selectedIds).toContain('thesis-i.2021-plus');
    expect(selectedIds).not.toContain('thesis-i.2018-2020');
    expect(selectedIds).not.toContain('major.ch.mandatory.analytical-chemistry');
    expect(selection.applicableRules.find((rule) => rule.id === 'thesis-i.2021-plus')?.sourceRefs).toEqual(
      expect.arrayContaining([expect.objectContaining({ manualYear: 2026 })]),
    );
  });

  it('separates missing and non-matching program scope from applicable rules', () => {
    const rule: RuleCatalogRule = {
      id: 'minor.ir.ai-code-course-limit',
      kind: 'course-limit',
      scope: { type: 'program', programKind: 'minor', programCodes: ['IR'] },
      parameters: { maxCourses: 4, unit: 'courses', reason: '테스트 제한' },
      sourceRefs: [sourceRef],
      appliesTo: { allCohorts: true },
    };

    expect(evaluateRuleApplicability(rule, { entryYear: 2021 })).toEqual({
      status: 'needs_context',
      missingContext: ['program'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { minor: [] },
      }),
    ).toEqual({ status: 'does_not_apply' });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { minor: ['AI'] },
      }),
    ).toEqual({ status: 'does_not_apply' });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { minor: ['IR'] },
      }),
    ).toEqual({ status: 'applies' });
  });

  it('treats program-kind scope as applicable only when that program kind is present', () => {
    const rule: RuleCatalogRule = {
      id: 'major-credits.2021-plus',
      kind: 'credit-minimum',
      scope: { type: 'program-kind', programKind: 'major' },
      parameters: { requiredCredits: 36, unit: 'credits' },
      sourceRefs: [sourceRef],
      appliesTo: { entryYear: { from: 2021 } },
    };

    expect(evaluateRuleApplicability(rule, { entryYear: 2021 })).toEqual({
      status: 'needs_context',
      missingContext: ['program'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { major: [] },
      }),
    ).toEqual({ status: 'does_not_apply' });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { major: ['EC'] },
      }),
    ).toEqual({ status: 'applies' });
  });

  it('separates missing declaration term from non-applicable declaration term rules', () => {
    const rule: RuleCatalogRule = {
      id: 'minor.ai.mandatory.a',
      kind: 'course-count',
      scope: { type: 'program', programKind: 'minor', programCodes: ['AI'] },
      parameters: {
        requiredCount: 1,
        unit: 'courses',
        courses: ['EC4209', 'AI4020', 'AI4021', 'AI4311'],
      },
      sourceRefs: [sourceRef],
      appliesTo: {
        allCohorts: true,
        declarationTerm: { to: { year: 2025, semester: '1' } },
      },
    };

    expect(evaluateRuleApplicability(rule, { entryYear: 2021 })).toEqual({
      status: 'needs_context',
      missingContext: ['program'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { minor: ['AI'] },
      }),
    ).toEqual({
      status: 'needs_context',
      missingContext: ['declarationTerm'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { minor: ['AI'] },
        declarationTerm: { year: 2024, semester: '2' },
      }),
    ).toEqual({ status: 'applies' });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { minor: ['AI'] },
        declarationTerm: { year: 2025, semester: '2' },
      }),
    ).toEqual({ status: 'does_not_apply' });
  });

  it('resolves declaration terms by scoped program kind when available', () => {
    const rule: RuleCatalogRule = {
      id: 'double-major.mm.2025-2-special-case',
      kind: 'course-count',
      scope: { type: 'program', programKind: 'double-major', programCodes: ['MM'] },
      parameters: {
        requiredCount: 1,
        unit: 'courses',
        courses: ['MM2701'],
      },
      sourceRefs: [{ ...sourceRef, page: 23 }],
      appliesTo: {
        allCohorts: true,
        declarationTerm: { from: { year: 2025, semester: '2' } },
      },
    };

    expect(evaluateRuleApplicability(rule, { entryYear: 2021 })).toEqual({
      status: 'needs_context',
      missingContext: ['program'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { 'double-major': ['MM'] },
      }),
    ).toEqual({
      status: 'needs_context',
      missingContext: ['declarationTerm'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { 'double-major': ['MM'] },
        declarationTerms: {
          minor: { year: 2025, semester: '2' },
          'double-major': { year: 2025, semester: '1' },
        },
      }),
    ).toEqual({ status: 'does_not_apply' });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2021,
        programCodes: { 'double-major': ['MM'] },
        declarationTerms: {
          minor: { year: 2025, semester: '1' },
          'double-major': { year: 2025, semester: '2' },
        },
      }),
    ).toEqual({ status: 'applies' });
  });

  it('separates missing evaluation term from future effective rules', () => {
    const rule: RuleCatalogRule = {
      id: 'future-effective-rule',
      kind: 'credit-minimum',
      scope: { type: 'program-kind', programKind: 'major' },
      parameters: { requiredCredits: 36, unit: 'credits' },
      sourceRefs: [sourceRef],
      appliesTo: {
        allCohorts: true,
        effectiveFrom: { year: 2026, semester: '1' },
      },
    };

    expect(evaluateRuleApplicability(rule, { entryYear: 2025 })).toEqual({
      status: 'needs_context',
      missingContext: ['program'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2025,
        programCodes: { major: ['EC'] },
      }),
    ).toEqual({
      status: 'needs_context',
      missingContext: ['evaluationTerm'],
    });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2025,
        programCodes: { major: ['EC'] },
        evaluationTerm: { year: 2025, semester: '2' },
      }),
    ).toEqual({ status: 'does_not_apply' });
    expect(
      evaluateRuleApplicability(rule, {
        entryYear: 2025,
        programCodes: { major: ['EC'] },
        evaluationTerm: { year: 2026, semester: '1' },
      }),
    ).toEqual({ status: 'applies' });
  });
});
