import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ScrollArea } from '@components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { CourseListWithPeriod } from '@utils/status';

const generateSelectData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList) => {
    return {
      value: periodWithList.year + '년도 ' + periodWithList.semester_str,
      label: periodWithList.year + '년도 ' + periodWithList.semester_str,
    };
  });
};

const generateTableList = (courseListWithPeriod: CourseListWithPeriod[], cntPeriod: string) => {
  return courseListWithPeriod
    ?.filter((periodList) => cntPeriod === periodList.year + '년도 ' + periodList.semester_str)
    ?.at(0)
    ?.userTakenCourseList?.map((course) => {
      return (
        <TableRow key={`${course.courseCode} + ${course.grade}`}>
          <TableCell>{course.courseCode}</TableCell>
          <TableCell>{course.courseName}</TableCell>
          <TableCell>{course.courseType}</TableCell>
          <TableCell>{course.credit}</TableCell>
          <TableCell>{course.grade}</TableCell>
        </TableRow>
      );
    });
};

export default function CourseMyTableChart({ data }: { data: CourseListWithPeriod[] }) {
  /* 수강한 강의 선택 */
  const [cntPeriod, setCntPeriod] = useState('2020년도 1학기');

  const tableList = generateTableList(data, cntPeriod);
  const dataForSelect = generateSelectData(data);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-xl font-bold">{cntPeriod}</CardTitle>
        <Select value={cntPeriod} onValueChange={setCntPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="수강 시기를 고르세요" />
          </SelectTrigger>
          <SelectContent>
            {dataForSelect.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>강의 코드</TableHead>
                  <TableHead>강의 명</TableHead>
                  <TableHead>강의 종류</TableHead>
                  <TableHead>학점</TableHead>
                  <TableHead>성적</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableList}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
