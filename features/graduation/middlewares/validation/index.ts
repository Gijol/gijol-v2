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
  // 1. First pass: normalize strings
  let normalizedCourses: TakenCourseType[] = input.takenCourses.map((c) => ({
    ...c,
    courseName: c.courseName?.trim() || '',
    courseCode: c.courseCode?.trim() || '',
    semester: c.semester?.trim() || '',
    courseType: c.courseType?.trim() || '기타',
    grade: c.grade?.trim().toUpperCase() || '',
  }));

  // 2. Filter out F grades
  normalizedCourses = normalizedCourses.filter((c) => c.grade !== 'F');

  // 3. Handle Retakes: Deduplicate by courseCode, keeping the one with better grade/info
  // Defines grade priority for sorting
  const gradeRank: Record<string, number> = {
    'A+': 100,
    A0: 95,
    'A-': 90,
    'B+': 85,
    B0: 80,
    'B-': 75,
    'C+': 70,
    C0: 65,
    'C-': 60,
    'D+': 55,
    D0: 50,
    S: 45, // S is usually passing, treat as reasonable
    U: 0,
    F: -1,
  };

  const getRank = (g: string) => gradeRank[g] || 0;

  // List of courses that can be taken multiple times (Colloquium, etc)
  // For now, only adding UC9331 as explicitly known repeatable requirement
  const REPEATABLE_CODES = new Set(['UC9331']);

  const validMap = new Map<string, TakenCourseType>();
  const repeatableCourses: TakenCourseType[] = [];

  normalizedCourses.forEach((course) => {
    const code = course.courseCode;
    if (!code) return; // Skip if no code

    if (REPEATABLE_CODES.has(code)) {
      repeatableCourses.push(course);
      return;
    }

    if (validMap.has(code)) {
      const existing = validMap.get(code)!;
      const currentRank = getRank(course.grade || '');
      const existingRank = getRank(existing.grade || '');

      // Keep the one with higher rank
      if (currentRank > existingRank) {
        validMap.set(code, course);
      } else if (currentRank === existingRank) {
        // Tie-breaker: prefer recent year/semester
        if (course.year > existing.year) {
          validMap.set(code, course);
        } else if (course.year === existing.year && course.semester > existing.semester) {
          validMap.set(code, course);
        }
      }
    } else {
      validMap.set(code, course);
    }
  });

  return { takenCourses: [...Array.from(validMap.values()), ...repeatableCourses] };
};
