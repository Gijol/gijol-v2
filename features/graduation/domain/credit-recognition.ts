import { historicalRequirementCode } from './rule-catalog/historical-courses';
import type { CategoryKey, TakenCourseType } from './types';

/** User records the school's approved recognition; ordinary transcript types are not approvals. */
export interface CreditRecognition {
  status: 'approved' | 'pending';
  category?: CategoryKey;
  institution?: string;
  matchedCourseCode?: string;
}

export const RECOGNITION_AREAS: { value: CategoryKey; label: string }[] = [
  { value: 'major', label: '전공' },
  { value: 'humanities', label: '인문사회' },
  { value: 'scienceBasic', label: '기초과학' },
  { value: 'languageBasic', label: '언어의 기초' },
  { value: 'otherUncheckedClass', label: '자유선택' },
];

export function isApprovedRecognition(course: Pick<TakenCourseType, 'creditRecognition'>): boolean {
  return course.creditRecognition?.status === 'approved';
}

export function courseCodeForRequirements(course: TakenCourseType): string {
  const code = ((isApprovedRecognition(course) && course.creditRecognition?.matchedCourseCode) || course.courseCode)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return isApprovedRecognition(course) && course.creditRecognition?.matchedCourseCode
    ? code
    : historicalRequirementCode(code, course);
}
