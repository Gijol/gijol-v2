// @hooks/useMyCourseOverview.ts
import { useMemo } from 'react';
import type { CourseListWithPeriod } from '@utils/status';
import { buildCourseListWithPeriod, calcAverageGrade } from '@utils/course/analytics';
import { useGraduationStore } from '../stores/useGraduationStore';

const TOTAL_REQUIRED_CREDITS = 130;

export function useMyCourseOverview() {
  const { parsed, userMajor, takenCourses, gradStatus } = useGraduationStore();

  const courseListWithPeriod: CourseListWithPeriod[] = useMemo(
    () => buildCourseListWithPeriod(parsed),
    [parsed]
  );

  const totalCredit =
    gradStatus?.totalCredits ?? takenCourses.reduce((s, c) => s + (Number(c.credit) || 0), 0);

  const overallAverageGrade = useMemo(
    () => calcAverageGrade(courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? [])),
    [courseListWithPeriod]
  );

  const start_y = courseListWithPeriod.at(0)?.year;
  const start_s = courseListWithPeriod.at(0)?.semester_str;
  const end_y = courseListWithPeriod.at(-1)?.year;
  const end_s = courseListWithPeriod.at(-1)?.semester_str;

  const semesterCount = courseListWithPeriod.length;
  const avgCreditPerSemester =
    semesterCount > 0 ? Math.round((totalCredit / semesterCount) * 10) / 10 : 0;

  // 베스트 학기(평균 학점 기준)
  const bestSemester = useMemo(() => {
    const withGrade = courseListWithPeriod.filter((t) => t.grade && t.grade > 0);
    if (!withGrade.length) return null;
    return withGrade.reduce((best, cur) => (cur.grade > best.grade ? cur : best), withGrade[0]);
  }, [courseListWithPeriod]);

  const creditsLeft = Math.max(TOTAL_REQUIRED_CREDITS - totalCredit, 0);
  const progress = Math.min((totalCredit / TOTAL_REQUIRED_CREDITS) * 100, 100);

  const studentId = parsed?.studentId;
  const majorName = userMajor;

  const entryYear =
    (parsed as any)?.entryYear ??
    (studentId && String(studentId).length >= 4
      ? Number(String(studentId).slice(0, 4))
      : undefined);

  return {
    parsed,
    courseListWithPeriod,
    totalCredit,
    overallAverageGrade,
    start_y,
    start_s,
    end_y,
    end_s,
    semesterCount,
    avgCreditPerSemester,
    bestSemester,
    creditsLeft,
    progress,
    studentId,
    majorName,
    entryYear,
    TOTAL_REQUIRED_CREDITS,
  };
}
