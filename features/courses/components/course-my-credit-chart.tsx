import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@components/ui/chart';
import { CourseListWithPeriod } from '@utils/status';
import { sumEarnedCredits } from '@utils/course/credits';

const generateChartData = (courseListWithPeriod: CourseListWithPeriod[]) =>
  courseListWithPeriod.map((periodWithList) => ({
    name: `${periodWithList.year}년 ${periodWithList.semester_str}`,
    shortName: `${String(periodWithList.year).slice(-2)}-${periodWithList.semester_str?.charAt(0)}`,
    credits: sumEarnedCredits(periodWithList.userTakenCourseList ?? []),
  }));

const chartConfig: ChartConfig = {
  credits: {
    label: '이수 학점',
    color: '#2563eb',
  },
};

export default function CourseMyCreditChart({ data }: { data: CourseListWithPeriod[] }) {
  const chartData = generateChartData(data);
  const latest = chartData.at(-1);
  const average = chartData.length
    ? Math.round((chartData.reduce((sum, semester) => sum + semester.credits, 0) / chartData.length) * 10) / 10
    : 0;

  return (
    <Card className="h-full min-w-0 gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-none dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold text-slate-950 dark:text-slate-50">학기별 이수학점</CardTitle>
          <CardDescription className="mt-1 text-xs">학기마다 이수한 학점을 비교합니다.</CardDescription>
        </div>
        {latest && (
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">최근 학기</p>
            <p className="mt-0.5 text-lg font-bold text-slate-950 tabular-nums dark:text-slate-50">
              {latest.credits}
              <span className="ml-1 text-xs font-medium text-slate-400">학점</span>
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="px-2 pt-5 pb-4 sm:px-4">
        {chartData.length ? (
          <ChartContainer
            config={chartConfig}
            role="img"
            aria-label={`학기별 이수학점 막대그래프. 학기당 평균 ${average}학점`}
            className="aspect-auto h-[230px] w-full"
          >
            <BarChart accessibilityLayer data={chartData} margin={{ top: 4, left: 0, right: 8 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
              <XAxis
                dataKey="shortName"
                axisLine={false}
                tickLine={false}
                fontSize={11}
                tickMargin={10}
                minTickGap={12}
              />
              <YAxis axisLine={false} tickLine={false} fontSize={11} tickMargin={8} width={28} allowDecimals={false} />
              <ChartTooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.name} />}
              />
              <Bar
                dataKey="credits"
                fill="var(--color-credits)"
                radius={[4, 4, 0, 0]}
                maxBarSize={34}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[230px] items-center justify-center rounded-lg bg-slate-50 px-6 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            표시할 이수학점 기록이 없습니다.
          </div>
        )}
        {chartData.length > 0 && (
          <p className="mt-1 px-3 text-xs text-slate-500 dark:text-slate-400">
            학기당 평균{' '}
            <strong className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">{average}학점</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
