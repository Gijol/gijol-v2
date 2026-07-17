import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { CourseListWithPeriod } from '@utils/status';
import { sumEarnedCredits } from '@utils/course/credits';

const getPeriodValue = (period: CourseListWithPeriod) => `${period.year}-${period.semester_idx}`;

const getGradeBadgeVariant = (grade: string | number) => {
  const gradeString = String(grade).toUpperCase();
  if (gradeString.startsWith('A')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (gradeString.startsWith('B')) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
  if (gradeString.startsWith('C')) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  if (gradeString.startsWith('D')) return 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300';
  if (gradeString === 'F' || gradeString === 'U') return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
};

function GradeBadge({ grade, visible }: { grade: string | number; visible: boolean }) {
  return (
    <span
      className={`inline-flex min-w-12 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${
        visible ? getGradeBadgeVariant(grade) : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      {visible ? grade : '•••'}
    </span>
  );
}

export default function CourseMyTableChart({
  data,
  gradesVisible = false,
}: {
  data: CourseListWithPeriod[];
  gradesVisible?: boolean;
}) {
  const periodOptions = useMemo(
    () =>
      data.map((period) => ({
        value: getPeriodValue(period),
        label: `${period.year}년 ${period.semester_str}`,
      })),
    [data],
  );

  const [selectedPeriodValue, setSelectedPeriodValue] = useState(() => periodOptions.at(-1)?.value ?? '');

  useEffect(() => {
    if (periodOptions.length > 0 && !periodOptions.some((period) => period.value === selectedPeriodValue)) {
      setSelectedPeriodValue(periodOptions.at(-1)?.value ?? '');
    }
  }, [periodOptions, selectedPeriodValue]);

  const selectedPeriod = data.find((period) => getPeriodValue(period) === selectedPeriodValue);
  const selectedPeriodLabel =
    periodOptions.find((period) => period.value === selectedPeriodValue)?.label ?? '선택한 학기';
  const courseList = selectedPeriod?.userTakenCourseList ?? [];
  const totalCredits = sumEarnedCredits(courseList);

  return (
    <Card className="min-w-0 gap-0 overflow-hidden border-slate-200 bg-white p-0 shadow-none dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-slate-950 dark:text-slate-50">수강 과목</CardTitle>
            <CardDescription className="mt-1 text-xs">선택한 학기의 과목과 성적을 확인합니다.</CardDescription>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                <strong className="font-semibold text-slate-800 tabular-nums dark:text-slate-200">
                  {courseList.length.toLocaleString('ko-KR')}
                </strong>
                과목
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span aria-label={`총 취득학점 ${totalCredits}학점`}>
                총{' '}
                <strong className="font-semibold text-slate-800 tabular-nums dark:text-slate-200">
                  {totalCredits}
                </strong>
                학점
              </span>
            </div>
          </div>

          <Select value={selectedPeriodValue} onValueChange={setSelectedPeriodValue}>
            <SelectTrigger
              aria-label="조회할 학기 선택"
              className="h-9 w-full touch-manipulation border-slate-200 bg-white text-sm shadow-none sm:w-[180px] dark:border-slate-700 dark:bg-slate-950"
            >
              <SelectValue placeholder="학기 선택" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-slate-700">
              {periodOptions.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {courseList.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            해당 학기에 수강한 과목이 없습니다.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-slate-200 sm:hidden dark:divide-slate-800">
              {courseList.map((course, index) => (
                <li key={`${course.courseCode}-${course.courseName}-mobile-${index}`} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="min-w-0 text-sm font-semibold break-words text-slate-900 dark:text-slate-100">
                      {course.courseName || '과목명 없음'}
                    </p>
                    <GradeBadge grade={course.grade} visible={gradesVisible} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">{course.courseCode || '코드 없음'}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span>{course.courseType || '구분 없음'}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span className="tabular-nums">{course.credit}학점</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden sm:block">
              <Table className="min-w-[680px]">
                <TableCaption className="sr-only">{selectedPeriodLabel} 수강 과목 목록</TableCaption>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-900">
                    <TableHead scope="col" className="h-10 w-32 px-5 text-xs font-medium">
                      강의코드
                    </TableHead>
                    <TableHead scope="col" className="h-10 text-xs font-medium">
                      강의명
                    </TableHead>
                    <TableHead scope="col" className="h-10 w-32 text-xs font-medium">
                      구분
                    </TableHead>
                    <TableHead scope="col" className="h-10 w-20 text-center text-xs font-medium">
                      학점
                    </TableHead>
                    <TableHead scope="col" className="h-10 w-24 pr-5 text-center text-xs font-medium">
                      성적
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseList.map((course, index) => (
                    <TableRow
                      key={`${course.courseCode}-${course.courseName}-${index}`}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60"
                    >
                      <TableCell className="px-5 py-3 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {course.courseCode || '—'}
                      </TableCell>
                      <TableCell className="max-w-[320px] py-3 text-sm font-medium break-words whitespace-normal text-slate-900 dark:text-slate-100">
                        {course.courseName || '과목명 없음'}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-500 dark:text-slate-400">
                        {course.courseType || '—'}
                      </TableCell>
                      <TableCell className="py-3 text-center text-sm text-slate-700 tabular-nums dark:text-slate-300">
                        {course.credit}
                      </TableCell>
                      <TableCell className="py-3 pr-5 text-center">
                        <GradeBadge grade={course.grade} visible={gradesVisible} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
