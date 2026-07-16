import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { CourseListWithPeriod } from '@utils/status';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@components/ui/chart';

const generateTableData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList: CourseListWithPeriod) => {
    return {
      name: periodWithList.year + '년 ' + periodWithList.semester_str,
      shortName: `${String(periodWithList.year).slice(-2)}-${periodWithList.semester_str?.charAt(0)}`,
      학점: periodWithList.userTakenCourseList?.reduce((acc: any, cnt: any) => acc + cnt.credit, 0) ?? 0,
    };
  });
};

const chartConfig: ChartConfig = {
  학점: {
    label: '이수 학점',
    color: 'var(--chart-1)',
  },
};

export default function CourseMyCreditChart({ data }: { data: CourseListWithPeriod[] }) {
  const dataForTable = generateTableData(data);
  const latest = dataForTable.at(-1);

  return (
    <Card className="w-full border-slate-300 py-0 shadow-none">
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b border-slate-300 p-4">
        <div>
          <CardTitle className="text-base font-semibold">학기별 이수 학점</CardTitle>
          <CardDescription className="mt-1 text-xs">학기마다 취득한 학점의 변화</CardDescription>
        </div>
        {latest && (
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 tabular-nums">{latest.학점}</p>
            <p className="text-xs text-slate-500">최근 학기</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="py-5 pr-4 pl-1">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart accessibilityLayer data={dataForTable} margin={{ top: 8, left: 4, right: 12 }}>
            <defs>
              <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.65} />
            <XAxis
              dataKey="shortName"
              axisLine={false}
              tickLine={false}
              fontSize={11}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis axisLine={false} tickLine={false} fontSize={11} tickMargin={8} width={28} allowDecimals={false} />
            <ChartTooltip
              cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent indicator="dot" labelFormatter={(_, payload) => payload?.[0]?.payload?.name} />
              }
            />
            <Area
              type="monotone"
              dataKey="학점"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#creditGradient)"
              dot={{ r: 2.5, fill: '#fff', strokeWidth: 2, stroke: '#3b82f6' }}
              activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
