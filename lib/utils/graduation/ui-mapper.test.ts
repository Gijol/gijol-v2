import { toGraduationUiViewModel } from './ui-mapper';
import type { GraduationApiResponseType } from '@lib/types/grad';

describe('graduation ui mapper', () => {
  it('adds displayMessage on client side only', () => {
    const apiResponse: GraduationApiResponseType = {
      graduationCategory: {
        languageBasic: {
          messages: [],
          minConditionCredits: 7,
          satisfied: true,
          totalCredits: 7,
          userTakenCoursesList: { takenCourses: [] },
        },
        scienceBasic: {
          messages: [],
          minConditionCredits: 17,
          satisfied: true,
          totalCredits: 17,
          userTakenCoursesList: { takenCourses: [] },
        },
        major: {
          messages: [],
          minConditionCredits: 36,
          satisfied: true,
          totalCredits: 36,
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
          satisfied: true,
          totalCredits: 24,
          userTakenCoursesList: { takenCourses: [] },
        },
        etcMandatory: {
          messages: [],
          minConditionCredits: 8,
          satisfied: true,
          totalCredits: 8,
          userTakenCoursesList: { takenCourses: [] },
        },
        otherUncheckedClass: {
          messages: [],
          minConditionCredits: 0,
          satisfied: true,
          totalCredits: 10,
          userTakenCoursesList: { takenCourses: [] },
        },
      },
      totalCredits: 130,
      totalSatisfied: true,
      recommendations: [],
      fineGrainedRequirements: [],
    };

    const uiModel = toGraduationUiViewModel(apiResponse);
    expect(uiModel.displayMessage).toContain('충족');
    expect(uiModel.recommendations).toEqual([]);
  });
});
