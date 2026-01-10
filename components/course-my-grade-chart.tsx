import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { CourseListWithPeriod } from '@utils/status';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './ui/chart';

const generateLineChartData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList: any) => {
    return {
      period: periodWithList.year + '년 ' + periodWithList.semester_str,
      grade: periodWithList.grade ?? 0,
    };
  });
};

const chartConfig = {
  grade: {
    label: '평균 학점',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function CourseMyGradeChart({ data }: { data: CourseListWithPeriod[] }) {
  const dataForLineChart = generateLineChartData(data);

  return (
    <Card className="w-full border-slate-300 py-0 shadow-none">
      <CardHeader className="border-b border-slate-300 p-4">
        <CardTitle className="text-base font-medium">📈 학기별 성적 현황</CardTitle>
      </CardHeader>
      <CardContent className="py-4 pr-4 pl-1">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart accessibilityLayer data={dataForLineChart} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-grade)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-grade)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="period" axisLine={false} tickLine={false} fontSize={12} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} fontSize={12} tickMargin={8} domain={[2.5, 4.5]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              type="natural"
              dataKey="grade"
              stroke="var(--color-grade)"
              strokeWidth={2}
              fill="url(#gradeGradient)"
              dot={{ r: 0, fill: 'var(--color-grade)', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: 'var(--color-grade)', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
