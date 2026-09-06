import { GRADUATION_CATALOG_PUBLISH_BUNDLE } from '../features/graduation/domain';
import { course, evaluateFor, expectNoRequirement, expectRequirement } from './helpers/graduation-fixtures';

const AI_ELECTIVES = [
  course({ courseCode: 'AI3004', courseName: '운영체제' }),
  course({ courseCode: 'AI3501', courseName: '컴퓨터 그래픽스' }),
  course({ courseCode: 'AI3202', courseName: 'AI3202' }),
  course({ courseCode: 'AI3001', courseName: '오토마타이론' }),
  course({ courseCode: 'AI3003', courseName: '데이터베이스 시스템' }),
];

describe('manual-backed AI convergence minor requirements', () => {
  it('reports needs_review when AI minor declaration term is missing', async () => {
    const result = await evaluateFor(2021, AI_ELECTIVES, { userMinors: ['AI'] });

    expect(result.overallStatus).toBe('needs_review');
    expectRequirement(result, 'minor-declaration-term-AI', {
      status: 'needs_review',
      satisfied: false,
      requiredCredits: 0,
      acquiredCredits: 0,
      missingCredits: 0,
    });
    expectNoRequirement(result, 'minor-mandatory-rule-AI-0');
  });

  it('does not apply mandatory A/B requirements for 2025-2 or later declarations', async () => {
    const result = await evaluateFor(2021, AI_ELECTIVES, {
      userMinors: ['AI'],
      minorDeclarationTerms: { AI: { year: 2025, semester: '2' } },
    });

    expectRequirement(result, 'minor-credits-AI', {
      satisfied: true,
      requiredCredits: 15,
      acquiredCredits: 15,
      missingCredits: 0,
    });
    expectNoRequirement(result, 'minor-mandatory-rule-AI-0');
    expectNoRequirement(result, 'minor-mandatory-rule-AI-1');
  });

  it('applies mandatory A/B requirements for 2021-2 through 2025-1 declarations', async () => {
    const result = await evaluateFor(2021, AI_ELECTIVES, {
      userMinors: ['AI'],
      minorDeclarationTerms: { AI: { year: 2025, semester: '1' } },
    });

    expectRequirement(result, 'minor-credits-AI', {
      satisfied: true,
      requiredCredits: 15,
      acquiredCredits: 15,
      missingCredits: 0,
    });
    expectRequirement(result, 'minor-mandatory-rule-AI-0', {
      satisfied: false,
      requiredCredits: 1,
      acquiredCredits: 0,
      missingCredits: 1,
    });
    expectRequirement(result, 'minor-mandatory-rule-AI-1', {
      satisfied: false,
      requiredCredits: 1,
      acquiredCredits: 0,
      missingCredits: 1,
    });
  });

  it('accepts EC4209 and AI4028 as AI mandatory A/B courses for 2025-1 declarations', async () => {
    const result = await evaluateFor(
      2021,
      [
        course({ courseCode: 'EC4209', courseName: '인공지능' }),
        course({ courseCode: 'AI4028', courseName: 'AI 산업 전략과 실증 프로젝트' }),
        course({ courseCode: 'AI3004', courseName: '운영체제' }),
        course({ courseCode: 'AI3501', courseName: '컴퓨터 그래픽스' }),
        course({ courseCode: 'AI3202', courseName: 'AI3202' }),
      ],
      {
        userMinors: ['AI'],
        minorDeclarationTerms: { AI: { year: 2025, semester: '1' } },
      },
    );

    expectRequirement(result, 'minor-credits-AI', {
      satisfied: true,
      requiredCredits: 15,
      acquiredCredits: 15,
      missingCredits: 0,
    });
    expectRequirement(result, 'minor-mandatory-rule-AI-0', {
      satisfied: true,
      requiredCredits: 1,
      acquiredCredits: 1,
      missingCredits: 0,
    });
    expectRequirement(result, 'minor-mandatory-rule-AI-1', {
      satisfied: true,
      requiredCredits: 1,
      acquiredCredits: 1,
      missingCredits: 0,
    });
  });

  it('accepts AI4001 as mandatory B for 2024-2 transition declarations', async () => {
    const result = await evaluateFor(
      2021,
      [
        course({ courseCode: 'AI4021', courseName: '기계학습 및 딥러닝' }),
        course({ courseCode: 'AI4001', courseName: 'AI핵심기술 기반 실무 프로젝트 2' }),
        course({ courseCode: 'AI3004', courseName: '운영체제' }),
        course({ courseCode: 'AI3501', courseName: '컴퓨터 그래픽스' }),
        course({ courseCode: 'AI3202', courseName: 'AI3202' }),
      ],
      {
        userMinors: ['AI'],
        minorDeclarationTerms: { AI: { year: 2024, semester: '2' } },
      },
    );

    const mandatoryB = expectRequirement(result, 'minor-mandatory-rule-AI-1', {
      satisfied: true,
      requiredCredits: 1,
      acquiredCredits: 1,
      missingCredits: 0,
    });

    expect(mandatoryB.matchedCourses.map((matched) => matched.courseCode)).toContain('AI4001');
  });
});

describe('AI minor historical handbook recognition', () => {
  it('counts the old colloquium and verified cross-listed AI4020', async () => {
    const result = await evaluateFor(
      2021,
      [
        course({ courseCode: 'AI2002', credit: 1, year: 2024, semester: '1' }),
        course({ courseCode: 'AI4020', year: 2024, semester: '1' }),
        course({ courseCode: 'AI4001', year: 2024, semester: '1' }),
      ],
      { userMinors: ['AI'], minorDeclarationTerms: { AI: { year: 2024, semester: '1' } } },
    );
    expectRequirement(result, 'minor-credits-AI', { acquiredCredits: 7 });
    expectRequirement(result, 'minor-mandatory-rule-AI-0', { satisfied: true });
    expectRequirement(result, 'minor-mandatory-rule-AI-1', { satisfied: true });
  });
  it('does not grant the colloquium exception to a new declarer', async () => {
    const result = await evaluateFor(2021, [course({ courseCode: 'AI2002', credit: 1 })], {
      userMinors: ['AI'],
      minorDeclarationTerms: { AI: { year: 2025, semester: '2' } },
    });
    expectRequirement(result, 'minor-credits-AI', { acquiredCredits: 0 });
  });
});

it('publishes the same historical project allowance used by the evaluator, without leaking to 2025-1', async () => {
  for (const year of [2024, 2025]) {
    const result = await evaluateFor(2021, [course({ courseCode: 'AI4001', year: 2024, semester: '1' })], {
      userMinors: ['AI'],
      minorDeclarationTerms: { AI: { year, semester: '1' } },
    });
    expectRequirement(result, 'minor-mandatory-rule-AI-1', { satisfied: year === 2024 });
    const published = result.catalogSelection.applicableRules.find((rule) =>
      rule.id.startsWith('minor.ai.mandatory.b'),
    );
    expect(published).toBeDefined();
    const parameters = GRADUATION_CATALOG_PUBLISH_BUNDLE.ruleCatalog.rules.find((rule) => rule.id === published!.id)!
      .parameters as { courses: readonly string[] };
    expect(parameters.courses.includes('AI4001')).toBe(year === 2024);
  }
});
