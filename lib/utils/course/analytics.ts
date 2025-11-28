import type { UserStatusType } from '@lib/types/index';
import type { CourseListWithPeriod } from '@utils/status';
import type { CourseWithGradeStatusType } from '@lib/types/score-status';

const GRADE_POINT_45: Record<string, number> = {
  'A+': 4.5,
  A0: 4.0,
  A: 4.0,
  'B+': 3.5,
  B0: 3.0,
  B: 3.0,
  'C+': 2.5,
  C0: 2.0,
  C: 2.0,
  'D+': 1.5,
  D0: 1.0,
  D: 1.0,
  F: 0,
  P: NaN,
  NP: NaN,
  S: NaN,
  U: NaN,
};

export type HasGradeAndCredit = {
  credit: number;
  grade?: string | null;
};

export function calcAverageGrade<T extends HasGradeAndCredit>(courses: T[]): number | null {
  const graded = courses.filter((c) => {
    const g = String(c.grade ?? '').toUpperCase();
    return g && !Number.isNaN(GRADE_POINT_45[g]);
  });

  if (!graded.length) return null;

  let totalPoints = 0;
  let totalCredits = 0;

  graded.forEach((c) => {
    const g = String(c.grade ?? '').toUpperCase();
    const p = GRADE_POINT_45[g];
    if (Number.isNaN(p)) return;
    const cr = Number(c.credit) || 0;
    totalPoints += p * cr;
    totalCredits += cr;
  });

  if (!totalCredits) return null;

  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

type ParsedCourseRow = {
  year: number;
  semester: string;
  semester_idx?: number;
  semester_str?: string;
  credit: number;
  grade?: string | null;
  courseCode?: string;
  courseName?: string;
  courseType?: string;
  [key: string]: any;
};

function inferSemesterIdx(sem: string): number {
  if (/1/.test(sem)) return 1;
  if (/2/.test(sem)) return 2;
  if (/3|여름|summer/i.test(sem)) return 3;
  if (/4|겨울|winter/i.test(sem)) return 4;
  return 0;
}

function inferSemesterStr(sem: string): string {
  if (sem.includes('학기')) return sem;
  return sem;
}

// UserStatusType -> CourseListWithPeriod[]
export function buildCourseListWithPeriod(parsed: UserStatusType | null): CourseListWithPeriod[] {
  if (!parsed || !parsed.userTakenCourseList) return [];

  const rows: ParsedCourseRow[] = parsed.userTakenCourseList.map((c: any) => ({
    year: Number(c.year) || 0,
    semester: c.semester || '',
    semester_idx: Number(c.semester_idx ?? 0) || undefined,
    semester_str: c.semester_str || c.semester || '',
    credit: Number(c.credit) || 0,
    grade: c.grade ?? null,
    courseCode: c.courseCode ?? c.code ?? '',
    courseName: c.courseName ?? c.course ?? '',
    courseType: c.courseType ?? c.type ?? '',
  }));

  const byKey: Record<string, ParsedCourseRow[]> = {};
  rows.forEach((c) => {
    const key = `${c.year}-${c.semester}`;
    if (!byKey[key]) byKey[key] = [];
    byKey[key].push(c);
  });

  const terms: CourseListWithPeriod[] = Object.entries(byKey).map(([key, list]) => {
    const [yStr, sem] = key.split('-');
    const year = Number(yStr) || 0;
    const avg = calcAverageGrade(list);
    const semester_idx = list[0]?.semester_idx ?? inferSemesterIdx(sem);
    const semester_str = list[0]?.semester_str || inferSemesterStr(sem);

    return {
      year,
      semester_idx,
      semester_str,
      grade: avg ?? 0,
      userTakenCourseList: list as any as CourseWithGradeStatusType[],
    };
  });

  terms.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.semester_idx || 0) - (b.semester_idx || 0);
  });

  return terms;
}
