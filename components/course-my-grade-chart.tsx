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
import React from 'react';

import { Notification, Paper, Title, useMantineTheme } from '@mantine/core';
import React from 'react';
import { CourseListWithPeriod } from '../lib/utils/status';
import CustomTooltip from '@components/rechart-custom-tooltip';


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
  const theme = useMantineTheme();
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
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="credit"
            stroke={theme.colors.blue[6]}
            strokeWidth={2}
            name="평균 학점"
          >
            <LabelList dataKey="credit" name="평균학점" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
