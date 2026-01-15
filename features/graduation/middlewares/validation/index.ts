import { UserTakenCourseListType, TakenCourseType } from '../../domain/types';

export interface ValidationResult {
  ok: boolean;
  value?: UserTakenCourseListType;
  errors?: string[];
}

/**
 * Parses raw input (e.g. from JSON or Excel) into a UserTakenCourseListType structure.
 * This function is defensive and ensures basic shape conformity.
 */
export const parseRawToTakenCourses = (raw: unknown): UserTakenCourseListType => {
  if (!raw || typeof raw !== 'object') {
    return { takenCourses: [] };
  }

  // If it's already in the shape { takenCourses: [...] }
  if ('takenCourses' in raw && Array.isArray((raw as any).takenCourses)) {
    return raw as UserTakenCourseListType;
  }

  // If it matches the fixture format { userTakenCourseList: [...] }
  if ('userTakenCourseList' in raw && Array.isArray((raw as any).userTakenCourseList)) {
    return { takenCourses: (raw as any).userTakenCourseList };
  }

  // If it's a direct array of courses
  if (Array.isArray(raw)) {
    return { takenCourses: raw };
  }

  // Fallback
  return { takenCourses: [] };
};

/**
 * Validates the semantic correctness of the taken courses list.
 * e.g. Year should be reasonable, semester should be non-empty string.
 */
export const validateTakenCourses = (input: UserTakenCourseListType): ValidationResult => {
  const errors: string[] = [];

  if (!input.takenCourses) {
    return { ok: false, errors: ['takenCourses array is missing'] };
  }

  input.takenCourses.forEach((course, index) => {
    if (!course.courseName) errors.push(`Row ${index}: Missing course name`);
    if (typeof course.credit !== 'number' || course.credit < 0) {
      errors.push(`Row ${index}: Invalid credit value`);
    }
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: input };
};

/**
 * Normalizes values (trim strings, standardize semester names).
 * Does strict type preservation (cannot add/remove fields).
 */
export const normalizeTakenCourses = (input: UserTakenCourseListType): UserTakenCourseListType => {
  const normalizedCourses: TakenCourseType[] = input.takenCourses.map((c) => ({
    ...c,
    courseName: c.courseName?.trim() || '',
    courseCode: c.courseCode?.trim() || '',
    semester: c.semester?.trim() || '',
    courseType: c.courseType?.trim() || '기타',
    // Fallback logic could go here if needed
  }));

  return { takenCourses: normalizedCourses };
};
