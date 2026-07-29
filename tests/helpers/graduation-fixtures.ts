import { evaluateGraduationStatus } from '../../features/graduation/domain/engine';
import type {
  FineGrainedRequirement,
  GradStatusResponseV2,
  MinorDeclarationTerms,
  TakenCourseType,
} from '../../features/graduation/domain/types';

type CourseInput = Partial<TakenCourseType> & Pick<TakenCourseType, 'courseCode'>;

export function course(input: CourseInput): TakenCourseType {
  const { courseCode, courseName, credit, grade, ...rest } = input;

  return {
    year: 2021,
    semester: '1',
    courseType: '교양',
    courseName: courseName ?? courseCode,
    courseCode,
    credit: credit ?? 3,
    grade: grade ?? 'A0',
    ...rest,
  };
}

export async function evaluateFor(
  entryYear: number,
  takenCourses: TakenCourseType[],
  context: { userMajor?: string; userMinors?: string[]; minorDeclarationTerms?: MinorDeclarationTerms } = {},
): Promise<GradStatusResponseV2> {
  return evaluateGraduationStatus({
    takenCourses: { takenCourses },
    ruleContext: {
      entryYear,
      userMajor: context.userMajor ?? 'EC',
      userMinors: context.userMinors,
      minorDeclarationTerms: context.minorDeclarationTerms,
    },
  });
}

export function findRequirement(result: GradStatusResponseV2, id: string): FineGrainedRequirement | undefined {
  return result.fineGrainedRequirements.find((requirement) => requirement.id === id);
}

export function expectRequirement(
  result: GradStatusResponseV2,
  id: string,
  expected: Partial<
    Pick<
      FineGrainedRequirement,
      'satisfied' | 'status' | 'requiredCredits' | 'acquiredCredits' | 'missingCredits' | 'unit'
    >
  >,
): FineGrainedRequirement {
  const requirement = findRequirement(result, id);
  expect(requirement).toBeDefined();
  expect(requirement).toMatchObject(expected);
  return requirement!;
}

export function expectNoRequirement(result: GradStatusResponseV2, id: string): void {
  expect(findRequirement(result, id)).toBeUndefined();
}
