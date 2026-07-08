import { evaluateGraduationStatus } from '../features/graduation/domain/engine';
import { course, expectRequirement } from './helpers/graduation-fixtures';

describe('graduation overall status', () => {
  it('reports unsatisfied when known requirements are not met', async () => {
    const result = await evaluateGraduationStatus({
      takenCourses: { takenCourses: [] },
      ruleContext: {
        entryYear: 2021,
        userMajor: 'EC',
      },
    });

    expect(result.overallStatus).toBe('unsatisfied');
    expect(result.totalSatisfied).toBe(false);
  });

  it('reports needs_review when major context is missing', async () => {
    const result = await evaluateGraduationStatus({
      takenCourses: {
        takenCourses: [
          course({
            courseCode: 'GS1607',
            courseName: '학술영어',
            credit: 2,
          }),
        ],
      },
      ruleContext: {
        entryYear: 2021,
      },
    });

    expect(result.overallStatus).toBe('needs_review');
    expect(result.totalSatisfied).toBe(false);
    expect(result.graduationCategory.major.satisfied).toBe(false);

    expectRequirement(result, 'major-context', {
      status: 'needs_review',
      satisfied: false,
      requiredCredits: 0,
      acquiredCredits: 0,
      missingCredits: 0,
    });
  });
});
