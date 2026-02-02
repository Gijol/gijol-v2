import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { CourseListWithPeriod } from '@utils/status';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@components/ui/chart';

const generateTableData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList: CourseListWithPeriod) => {
    return {
      name: periodWithList.year + '년 ' + periodWithList.semester_str,
      shortName: periodWithList.semester_str?.charAt(0) + '학기',
      학점: periodWithList.userTakenCourseList?.reduce((acc: any, cnt: any) => acc + cnt.credit, 0) ?? 0,
    };
  });
};

const chartConfig: ChartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
};

export default function CourseMyCreditChart({ data }: { data: CourseListWithPeriod[] }) {
  const dataForTable = generateTableData(data);

  return (
    <Card className="w-full border-slate-300 py-0 shadow-none">
      <CardHeader className="border-b border-slate-300 p-4">
        <CardTitle className="text-base font-medium">📊 학기별 이수 학점</CardTitle>
      </CardHeader>
      <CardContent className="py-4 pr-4 pl-1">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={dataForTable} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} fontSize={12} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              type="natural"
              dataKey="학점"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#creditGradient)"
              dot={{ r: 0, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
