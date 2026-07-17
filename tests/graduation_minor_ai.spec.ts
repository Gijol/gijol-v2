import { course, evaluateFor, expectNoRequirement, expectRequirement } from './helpers/graduation-fixtures';

const AI_ELECTIVES = [
  course({ courseCode: 'AI2004', courseName: 'AI 프로그래밍' }),
  course({ courseCode: 'AI2050', courseName: 'AI 기초' }),
  course({ courseCode: 'AI2051', courseName: 'AI 실습' }),
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
        course({ courseCode: 'AI2004', courseName: 'AI 프로그래밍' }),
        course({ courseCode: 'AI2050', courseName: 'AI 기초' }),
        course({ courseCode: 'AI2051', courseName: 'AI 실습' }),
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
        course({ courseCode: 'AI2004', courseName: 'AI 프로그래밍' }),
        course({ courseCode: 'AI2050', courseName: 'AI 기초' }),
        course({ courseCode: 'AI2051', courseName: 'AI 실습' }),
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
