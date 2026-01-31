import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { CourseListWithPeriod } from '@utils/status';
import { Badge } from '@components/ui/badge';

const generateSelectData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList) => {
    return {
      value: periodWithList.year + '년도 ' + periodWithList.semester_str,
      label: periodWithList.year + '년도 ' + periodWithList.semester_str,
    };
  });
};

const getGradeBadgeVariant = (grade: string | number) => {
  const gradeStr = String(grade).toUpperCase();
  if (gradeStr.startsWith('A')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (gradeStr.startsWith('B')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (gradeStr.startsWith('C')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (gradeStr.startsWith('D')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  if (gradeStr === 'F') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (gradeStr === 'P' || gradeStr === 'S') return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
};

export default function CourseMyTableChart({ data }: { data: CourseListWithPeriod[] }) {
  const dataForSelect = generateSelectData(data);

  // 가장 최근 학기로 초기화
  const [cntPeriod, setCntPeriod] = useState(() => {
    if (dataForSelect.length > 0) {
      return dataForSelect[dataForSelect.length - 1].value;
    }
    return '2020년도 1학기';
  });

  // 데이터가 변경되면 가장 최근 학기로 업데이트
  useEffect(() => {
    if (dataForSelect.length > 0 && !dataForSelect.find((d) => d.value === cntPeriod)) {
      setCntPeriod(dataForSelect[dataForSelect.length - 1].value);
    }
  }, [dataForSelect, cntPeriod]);

  const selectedPeriod = data?.find((periodList) => cntPeriod === periodList.year + '년도 ' + periodList.semester_str);
  const courseList = selectedPeriod?.userTakenCourseList ?? [];
  const totalCredits = courseList.reduce((acc, course) => acc + (course.credit || 0), 0);

  return (
    <Card className="w-full border-slate-300 p-0 shadow-none">
      <CardHeader className="border-b border-slate-300 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-medium">학기별 수강 과목</CardTitle>
            <span className="text-muted-foreground text-sm">
              {courseList.length}과목 · {totalCredits}학점
            </span>
          </div>
          <Select value={cntPeriod} onValueChange={setCntPeriod}>
            <SelectTrigger className="h-8 w-full border border-slate-200 text-sm sm:w-[160px]">
              <SelectValue placeholder="학기 선택" />
            </SelectTrigger>
            <SelectContent className="border border-slate-200">
              {dataForSelect.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {courseList.length === 0 ? (
          <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
            해당 학기에 수강한 과목이 없습니다.
          </div>
        ) : (
          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-9 text-xs font-medium">강의코드</TableHead>
                  <TableHead className="h-9 text-xs font-medium">강의명</TableHead>
                  <TableHead className="h-9 text-xs font-medium">구분</TableHead>
                  <TableHead className="h-9 w-16 text-center text-xs font-medium">학점</TableHead>
                  <TableHead className="h-9 w-16 text-center text-xs font-medium">성적</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseList.map((course) => (
                  <TableRow key={`${course.courseCode}-${course.grade}`} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground py-2.5 font-mono text-sm">
                      {course.courseCode}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm font-medium">{course.courseName}</TableCell>
                    <TableCell className="text-muted-foreground py-2.5 text-sm">{course.courseType}</TableCell>
                    <TableCell className="py-2.5 text-center text-sm">{course.credit}</TableCell>
                    <TableCell className="py-2.5 text-center">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getGradeBadgeVariant(course.grade)}`}
                      >
                        {course.grade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
