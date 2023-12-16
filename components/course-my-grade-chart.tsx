import {
  CartesianAxis,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Paper, Title } from '@mantine/core';
import React from 'react';
import { CourseListWithPeriod } from '../lib/utils/status';

const generateLineChartData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList: any) => {
    return {
      period: periodWithList.year + '년 ' + periodWithList.semester_str,
      credit: periodWithList.grade ?? 0,
    };
  });
};

export default function CourseMyGradeChart({ data }: { data: CourseListWithPeriod[] }) {
  const dataForLineChart = generateLineChartData(data);
  return (
    <Paper w="100%" p="xl" radius="md" withBorder>
      <Title order={3} mb="xl">
        학기별 성적 현황
      </Title>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataForLineChart} margin={{ left: 20, right: 20, bottom: 20 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tickSize={8}
            tickLine={false}
            axisLine={false}
            fontSize={14}
            tick={{ width: 30 }}
            interval="preserveStartEnd"
          />
          <YAxis dataKey="credit" tickLine={false} axisLine={false} hide domain={[2.5, 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="credit" stroke="#8884d8">
            <LabelList dataKey="credit" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
