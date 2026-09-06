import { course, evaluateFor, expectRequirement } from './helpers/graduation-fixtures';

describe('2020–2026 handbook regression audit', () => {
  it('allows any three chemistry mandatory courses, including biochemistry and inorganic chemistry', async () => {
    const result = await evaluateFor(
      2021,
      [course({ courseCode: 'CH3106' }), course({ courseCode: 'CH3208' }), course({ courseCode: 'CH2104' })],
      { userMinors: ['CH'] },
    );
    expectRequirement(result, 'minor-mandatory-rule-CH-0', { satisfied: true, acquiredCredits: 3 });
  });
});
