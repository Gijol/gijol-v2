import {
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

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { CourseListWithPeriod } from '@utils/status';
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
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>학기별 성적 현황</CardTitle>
      </CardHeader>
      <CardContent>
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
              stroke="#2563eb"
              strokeWidth={2}
              name="평균 학점"
            >
              <LabelList dataKey="credit" name="평균학점" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
