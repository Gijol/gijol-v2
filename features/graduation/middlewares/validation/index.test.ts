import { normalizeSemester, normalizeTakenCourses, validateTakenCourses } from './index';
import type { UserTakenCourseListType } from '../../domain/types';

describe('graduation validation middleware', () => {
  it('normalizes semester aliases to canonical values', () => {
    expect(normalizeSemester('봄학기')).toBe('1');
    expect(normalizeSemester('fall')).toBe('2');
    expect(normalizeSemester('여름학기')).toBe('여름');
    expect(normalizeSemester('winter')).toBe('겨울');
  });

  it('rejects invalid semester values', () => {
    const input: UserTakenCourseListType = {
      takenCourses: [
        {
          year: 2022,
          semester: '3학기',
          courseType: '전공',
          courseName: '자료구조',
          courseCode: 'CS2001',
          credit: 3,
          grade: 'A0',
        },
      ],
    };

    const result = validateTakenCourses(input);
    expect(result.ok).toBe(false);
    expect(result.errors?.some((e) => e.includes('Invalid semester value'))).toBe(true);
  });

  it('rejects empty course list', () => {
    const result = validateTakenCourses({ takenCourses: [] });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('takenCourses array is empty');
  });

  it('uses normalized semester ordering for retake tie-breaks', () => {
    const input: UserTakenCourseListType = {
      takenCourses: [
        {
          year: 2022,
          semester: '봄학기',
          courseType: '전공',
          courseName: '자료구조',
          courseCode: 'cs2001',
          credit: 3,
          grade: 'B0',
        },
        {
          year: 2022,
          semester: '2학기',
          courseType: '전공',
          courseName: '자료구조',
          courseCode: 'CS-2001',
          credit: 3,
          grade: 'B0',
        },
      ],
    };

    const normalized = normalizeTakenCourses(input);
    expect(normalized.takenCourses).toHaveLength(1);
    expect(normalized.takenCourses[0].semester).toBe('2');
    expect(normalized.takenCourses[0].courseCode).toBe('CS2001');
  });

  it('keeps courses without code instead of dropping them', () => {
    const input: UserTakenCourseListType = {
      takenCourses: [
        {
          year: 2022,
          semester: '1',
          courseType: '교양',
          courseName: '세미나',
          courseCode: '',
          credit: 1,
          grade: 'S',
        },
      ],
    };

    const normalized = normalizeTakenCourses(input);
    expect(normalized.takenCourses).toHaveLength(1);
    expect(normalized.takenCourses[0].courseName).toBe('세미나');
  });
});
