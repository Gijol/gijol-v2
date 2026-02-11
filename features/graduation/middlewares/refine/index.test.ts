import { toGraduationApiResponse } from './index';

describe('toGraduationApiResponse', () => {
  it('does not include UI-only fields like displayMessage', () => {
    const apiResponse = toGraduationApiResponse(
      {
        graduationCategory: {
          languageBasic: {
            messages: [],
            minConditionCredits: 7,
            satisfied: false,
            totalCredits: 0,
            userTakenCoursesList: { takenCourses: [] },
          },
          scienceBasic: {
            messages: [],
            minConditionCredits: 17,
            satisfied: false,
            totalCredits: 0,
            userTakenCoursesList: { takenCourses: [] },
          },
          major: {
            messages: [],
            minConditionCredits: 36,
            satisfied: false,
            totalCredits: 0,
            userTakenCoursesList: { takenCourses: [] },
          },
          minor: {
            messages: [],
            minConditionCredits: 0,
            satisfied: true,
            totalCredits: 0,
            userTakenCoursesList: { takenCourses: [] },
          },
          humanities: {
            messages: [],
            minConditionCredits: 24,
            satisfied: false,
            totalCredits: 0,
            userTakenCoursesList: { takenCourses: [] },
          },
          etcMandatory: {
            messages: [],
            minConditionCredits: 8,
            satisfied: false,
            totalCredits: 0,
            userTakenCoursesList: { takenCourses: [] },
          },
          otherUncheckedClass: {
            messages: [],
            minConditionCredits: 0,
            satisfied: true,
            totalCredits: 0,
            userTakenCoursesList: { takenCourses: [] },
          },
        },
        totalCredits: 0,
        totalSatisfied: false,
      },
      {
        recommendations: [{ courseCode: 'CS101', courseName: 'Intro CS', credit: 3, reason: 'Major deficit' }],
      },
    );

    expect(apiResponse.recommendations).toHaveLength(1);
    expect((apiResponse as any).displayMessage).toBeUndefined();
  });
});
