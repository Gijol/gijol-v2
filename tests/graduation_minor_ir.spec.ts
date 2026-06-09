import { course, evaluateFor, expectNoRequirement, expectRequirement } from './helpers/graduation-fixtures';

describe('manual-backed intelligent robot minor requirements', () => {
  it('reports needs_review when IR declaration term is missing', async () => {
    const result = await evaluateFor(
      2021,
      [
        course({ courseCode: 'IR4201', courseName: '딥러닝' }),
        course({ courseCode: 'IR4202', courseName: '메카트로닉스' }),
      ],
      { userMinors: ['IR'] },
    );

    expect(result.overallStatus).toBe('needs_review');
    expectRequirement(result, 'minor-declaration-term-IR', {
      status: 'needs_review',
      satisfied: false,
      requiredCredits: 0,
      acquiredCredits: 0,
      missingCredits: 0,
    });
  });

  it('does not require IR mandatory courses for a 2026-1 declaration', async () => {
    const result = await evaluateFor(
      2021,
      [
        course({ courseCode: 'AI2601', courseName: '로봇개론' }),
        course({ courseCode: 'AI3601', courseName: '핸즈온로봇제작' }),
        course({ courseCode: 'IR2201', courseName: '회로이론' }),
        course({ courseCode: 'IR4201', courseName: '딥러닝' }),
        course({ courseCode: 'IR4202', courseName: '메카트로닉스' }),
      ],
      {
        userMinors: ['IR'],
        minorDeclarationTerms: { IR: { year: 2026, semester: '1' } },
      },
    );

    const minorCredits = expectRequirement(result, 'minor-credits-IR', {
      satisfied: true,
      requiredCredits: 15,
      acquiredCredits: 15,
      missingCredits: 0,
    });

    expect(minorCredits.matchedCourses.map((matched) => matched.courseCode)).toEqual(
      expect.arrayContaining(['AI2601', 'AI3601']),
    );
    expect(minorCredits.sourceRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          manualYear: 2026,
          page: 29,
          path: 'docs/bachelor_manual/2026_manual.pdf',
        }),
      ]),
    );
    expectNoRequirement(result, 'minor-mandatory-rule-IR-0');
  });

  it('does not apply the old IR mandatory-three rule to pre-2026 declarations', async () => {
    const result = await evaluateFor(
      2021,
      [
        course({ courseCode: 'IR2202', courseName: '동역학' }),
        course({ courseCode: 'IR4208', courseName: '로봇 운동학' }),
        course({ courseCode: 'IR4310', courseName: '인간-AI 상호작용' }),
        course({ courseCode: 'IR2201', courseName: '회로이론' }),
        course({ courseCode: 'IR4207', courseName: '자동제어' }),
      ],
      {
        userMinors: ['IR'],
        minorDeclarationTerms: { IR: { year: 2025, semester: '2' } },
      },
    );

    expectRequirement(result, 'minor-credits-IR', {
      satisfied: true,
      requiredCredits: 15,
      acquiredCredits: 15,
      missingCredits: 0,
    });
    expectNoRequirement(result, 'minor-mandatory-rule-IR-0');
  });
});
