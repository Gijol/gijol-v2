import { courseCodeForRequirements, isApprovedRecognition } from './credit-recognition';
import type { ScienceField, ScienceRebalanceResult, FieldCompletionResult, TakenCourseType } from './types';
import { CALCULUS_CODES, getCoreMathCodes, SCIENCE_FIELD_COURSES } from './rule-catalog/science-courses';

export function compareScienceCourseOrder(a: TakenCourseType, b: TakenCourseType): number {
  const order: Record<string, number> = {
    '1': 1,
    '1학기': 1,
    spring: 1,
    봄: 1,
    여름: 2,
    여름학기: 2,
    summer: 2,
    '2': 3,
    '2학기': 3,
    fall: 3,
    가을: 3,
    겨울: 4,
    겨울학기: 4,
    winter: 4,
  };
  return a.year - b.year || (order[a.semester] ?? 0) - (order[b.semester] ?? 0);
}

/** Preserve partial progress; only move true extra/unselected courses to free electives. */
export function allocateScienceCourses(courses: TakenCourseType[], entryYear: number): ScienceRebalanceResult {
  const sorted = [...courses].sort(compareScienceCourseOrder);
  const details = new Map<ScienceField, FieldCompletionResult>();
  const required = new Set<TakenCourseType>();
  const math = [
    sorted.find((c) => (CALCULUS_CODES as readonly string[]).includes(courseCodeForRequirements(c))),
    sorted.find((c) => getCoreMathCodes(entryYear).includes(courseCodeForRequirements(c))),
  ].filter((c): c is TakenCourseType => Boolean(c));
  math.forEach((c) => required.add(c));
  sorted
    .filter(
      (c) =>
        isApprovedRecognition(c) &&
        c.creditRecognition?.category === 'scienceBasic' &&
        !c.creditRecognition.matchedCourseCode,
    )
    .forEach((c) => required.add(c));
  details.set('math', {
    field: 'math',
    isComplete: math.length === 2,
    requiredCourses: math,
    hasLab: true,
    labVerified: true,
    completionIndex: math.length ? Math.max(...math.map((c) => sorted.indexOf(c))) : -1,
  });

  for (const field of Object.keys(SCIENCE_FIELD_COURSES) as Array<keyof typeof SCIENCE_FIELD_COURSES>) {
    const codes = SCIENCE_FIELD_COURSES[field];
    const lecture = sorted.find((c) => (codes.lectures as readonly string[]).includes(courseCodeForRequirements(c)));
    const lab = sorted.find((c) => (codes.labs as readonly string[]).includes(courseCodeForRequirements(c)));
    const matched = [lecture, lab].filter((c): c is TakenCourseType => Boolean(c));
    const labVerified = field === 'sw' || Boolean(lecture && lab && compareScienceCourseOrder(lab, lecture) >= 0);
    details.set(field, {
      field,
      isComplete: Boolean(lecture && labVerified),
      hasLab: field === 'sw' || Boolean(lab),
      labVerified,
      requiredCourses: matched,
      completionIndex: matched.length ? Math.max(...matched.map((c) => sorted.indexOf(c))) : -1,
    });
  }

  const natural: ScienceField[] = ['physics', 'chemistry', 'biology'];
  const selectedFields: ScienceField[] = details.get('sw')!.isComplete
    ? [
        'sw',
        ...natural
          .sort(
            (a, b) =>
              Number(details.get(b)!.isComplete) - Number(details.get(a)!.isComplete) ||
              (details.get(a)!.completionIndex < 0 ? Infinity : details.get(a)!.completionIndex) -
                (details.get(b)!.completionIndex < 0 ? Infinity : details.get(b)!.completionIndex),
          )
          .slice(0, 2),
      ]
    : natural;
  selectedFields.forEach((field) => details.get(field)!.requiredCourses.forEach((c) => required.add(c)));
  return {
    scienceBasic: sorted.filter((c) => required.has(c)),
    freeElective: sorted.filter((c) => !required.has(c)),
    selectedFields,
    fieldDetails: details,
  };
}
