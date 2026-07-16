import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { CourseListWithPeriod } from '@utils/status';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@components/ui/chart';

const generateLineChartData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod
    .filter((periodWithList) => periodWithList.grade > 0)
    .map((periodWithList) => ({
      period: periodWithList.year + '년 ' + periodWithList.semester_str,
      shortPeriod: `${String(periodWithList.year).slice(-2)}-${periodWithList.semester_str?.charAt(0)}`,
      grade: periodWithList.grade,
    }));
};

const chartConfig: ChartConfig = {
  grade: {
    label: '평균 학점',
    color: 'var(--chart-2)',
  },
};

export default function CourseMyGradeChart({ data }: { data: CourseListWithPeriod[] }) {
  const dataForLineChart = generateLineChartData(data);
  const latest = dataForLineChart.at(-1);

  return (
    <Card className="w-full border-slate-300 py-0 shadow-none">
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b border-slate-300 p-4">
        <div>
          <CardTitle className="text-base font-semibold">학기별 성적 현황</CardTitle>
          <CardDescription className="mt-1 text-xs">학사편람 기준, 소수점 셋째 자리 절삭</CardDescription>
        </div>
        {latest && (
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 tabular-nums">{latest.grade.toFixed(2)}</p>
            <p className="text-xs text-slate-500">최근 학기 / 4.5</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="py-5 pr-4 pl-1">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart accessibilityLayer data={dataForLineChart} margin={{ top: 8, left: 4, right: 12 }}>
            <defs>
              <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-grade)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-grade)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.65} />
            <XAxis
              dataKey="shortPeriod"
              axisLine={false}
              tickLine={false}
              fontSize={11}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              fontSize={11}
              tickMargin={8}
              width={28}
              domain={[0, 4.5]}
              ticks={[0, 1, 2, 3, 4, 4.5]}
            />
            <ChartTooltip
              cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent indicator="dot" labelFormatter={(_, payload) => payload?.[0]?.payload?.period} />
              }
            />
            <Area
              type="monotone"
              dataKey="grade"
              stroke="var(--color-grade)"
              strokeWidth={2}
              fill="url(#gradeGradient)"
              dot={{ r: 2.5, fill: '#fff', strokeWidth: 2, stroke: 'var(--color-grade)' }}
              activeDot={{ r: 4, fill: 'var(--color-grade)', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
