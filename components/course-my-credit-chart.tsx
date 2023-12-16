import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { Paper, Stack, Title } from '@mantine/core';
import React, { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { CourseListWithPeriod } from '../lib/utils/status';

const generateTableData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList: CourseListWithPeriod) => {
    return {
      name: periodWithList.year + '년 ' + periodWithList.semester_str,
      credit:
        periodWithList.userTakenCourseList?.reduce((acc: any, cnt: any) => acc + cnt.credit, 0) ??
        0,
    };
  });
};

export default function CourseMyCreditChart({ data }: { data: CourseListWithPeriod[] }) {
  const dataForTable = generateTableData(data);
  const matches = useMediaQuery(`(min-width: 48em)`);
  return (
    <Paper component={Stack} w="100%" p="xl" radius="md" withBorder>
      <Title order={3} mb="xl">
        학점 이수 현황
      </Title>
      <ResponsiveContainer minHeight={300} width="100%" height={300}>
        <BarChart data={dataForTable} margin={{ left: 20, right: 20, bottom: 20 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            fontSize={14}
            tick={{ width: 30 }}
          />
          <Tooltip />
          <Bar type="monotone" dataKey="credit" fill="#4593fc" radius={8} barSize={40}>
            <LabelList dataKey="credit" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
