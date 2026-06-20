import { refineGradStatusForUI } from '../features/graduation/middlewares/refine';
import {
  buildGraduationCatalogSelectionSummary,
  evaluateGraduationStatus,
} from '../features/graduation/domain';
import { course, evaluateFor } from './helpers/graduation-fixtures';

function ids(values: readonly { id: string }[]): string[] {
  return values.map((value) => value.id);
}

describe('graduation catalog selection adapter', () => {
  it('summarizes applicable catalog rules for the selected major without leaking unselected minors', () => {
    const summary = buildGraduationCatalogSelectionSummary({
      entryYear: 2021,
      userMajor: 'EC',
      userMinors: [],
    });
    const applicableIds = ids(summary.applicableRules);
    const needsContextIds = summary.needsContext.map((item) => item.rule.id);

    expect(applicableIds).toContain('basic-2021-plus.total-credits');
    expect(applicableIds).toContain('major-credits.2021-plus');
    expect(applicableIds).toContain('major.ec.mandatory.experiment');
    expect(applicableIds).not.toContain('minor.ir.ai-code-course-limit');
    expect(applicableIds).not.toContain('minor.ai.mandatory.a');
    expect(needsContextIds).not.toContain('minor.ir.ai-code-course-limit');
    expect(summary.sourceRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ manualYear: 2026, page: 22 }),
        expect.objectContaining({ manualYear: 2026, page: 32 }),
        expect.objectContaining({ manualYear: 2026, page: 33 }),
      ]),
    );
  });

  it('keeps missing major context visible in the catalog selection summary', async () => {
    const result = await evaluateGraduationStatus({
      takenCourses: {
        takenCourses: [course({ courseCode: 'GS1607', courseName: '학술영어', credit: 2 })],
      },
      ruleContext: {
        entryYear: 2021,
      },
    });
    const needsContext = result.catalogSelection.needsContext.find((item) => item.rule.id === 'major-credits.2021-plus');

    expect(result.overallStatus).toBe('needs_review');
    expect(needsContext).toMatchObject({
      missingContext: ['program'],
      rule: {
        scope: { type: 'program-kind', programKind: 'major' },
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 33 })],
      },
    });
  });

  it('keeps selected minor declaration-term gaps visible without applying the wrong minor rules', async () => {
    const result = await evaluateFor(
      2021,
      [
        course({ courseCode: 'AI2004', courseName: 'AI 프로그래밍' }),
        course({ courseCode: 'AI2050', courseName: 'AI 기초' }),
      ],
      { userMinors: ['AI'] },
    );
    const applicableIds = ids(result.catalogSelection.applicableRules);
    const mandatoryA = result.catalogSelection.needsContext.find((item) => item.rule.id === 'minor.ai.mandatory.a');

    expect(applicableIds).toContain('minor-declaration-term-AI');
    expect(applicableIds).not.toContain('minor.ir.ai-code-course-limit');
    expect(mandatoryA).toMatchObject({
      missingContext: ['declarationTerm'],
      rule: {
        scope: { type: 'program', programKind: 'minor', programCodes: ['AI'] },
      },
    });
  });

  it('passes catalog selection through the UI view model', async () => {
    const result = await evaluateFor(2021, [], { userMajor: 'EC' });
    const viewModel = refineGradStatusForUI(result);

    expect(viewModel.catalogSelection).toEqual(result.catalogSelection);
    expect(viewModel.catalogSelection?.applicableRules.map((rule) => rule.id)).toContain('major-credits.2021-plus');
  });
});
