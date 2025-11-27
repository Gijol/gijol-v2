// @hooks/useMyCourseOverview.ts
import { useMemo } from 'react';
import type { CourseListWithPeriod } from '@utils/status';
import { buildCourseListWithPeriod, calcAverageGrade } from '@utils/course/analytics';
import { useGraduationStore } from '../stores/useGraduationStore';

const TOTAL_REQUIRED_CREDITS = 130;

export function useMyCourseOverview() {
  const { parsed, takenCourses, gradStatus } = useGraduationStore();

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

  return {
    parsed,
    courseListWithPeriod,
    totalCredit,
    overallAverageGrade,
    start_y,
    start_s,
    end_y,
    end_s,
    TOTAL_REQUIRED_CREDITS,
  };
}
