import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@components/ui/chart';
import { CourseListWithPeriod } from '@utils/status';

const generateChartData = (courseListWithPeriod: CourseListWithPeriod[]) =>
  courseListWithPeriod
    .filter((periodWithList) => periodWithList.grade > 0)
    .map((periodWithList) => ({
      period: `${periodWithList.year}년 ${periodWithList.semester_str}`,
      shortPeriod: `${String(periodWithList.year).slice(-2)}-${periodWithList.semester_str?.charAt(0)}`,
      grade: periodWithList.grade,
    }));

const chartConfig: ChartConfig = {
  grade: {
    label: '평균 평점',
    color: '#4f46e5',
  },
};

export default function CourseMyGradeChart({
  data,
  gradesVisible = false,
}: {
  data: CourseListWithPeriod[];
  gradesVisible?: boolean;
}) {
  const chartData = generateChartData(data);
  const latest = chartData.at(-1);

  return (
    <Card className="h-full min-w-0 gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-none dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold text-slate-950 dark:text-slate-50">학기별 성적</CardTitle>
          <CardDescription className="mt-1 text-xs">학기 평균 평점의 흐름을 확인합니다.</CardDescription>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">최근 학기</p>
          <p className="mt-0.5 text-lg font-bold text-slate-950 tabular-nums dark:text-slate-50">
            {gradesVisible && latest ? latest.grade.toFixed(2) : '•••'}
            {gradesVisible && latest && <span className="ml-1 text-xs font-medium text-slate-400">/ 4.5</span>}
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-5 pb-4 sm:px-4">
        {gradesVisible && chartData.length ? (
          <ChartContainer
            config={chartConfig}
            role="img"
            aria-label="학기별 평균 평점 추세 그래프. 4.5점 만점"
            className="aspect-auto h-[230px] w-full"
          >
            <AreaChart accessibilityLayer data={chartData} margin={{ top: 4, left: 0, right: 8 }}>
              <defs>
                <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-grade)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-grade)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
              <XAxis
                dataKey="shortPeriod"
                axisLine={false}
                tickLine={false}
                fontSize={11}
                tickMargin={10}
                minTickGap={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={11}
                tickMargin={8}
                width={36}
                domain={[0, 4.5]}
                ticks={[0, 1, 2, 3, 4, 4.5]}
              />
              <ChartTooltip
                cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
                content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.period} />}
              />
              <Area
                type="monotone"
                dataKey="grade"
                stroke="var(--color-grade)"
                strokeWidth={2}
                fill="url(#gradeGradient)"
                dot={{ r: 2.5, fill: '#fff', strokeWidth: 2, stroke: 'var(--color-grade)' }}
                activeDot={{ r: 4, fill: 'var(--color-grade)', strokeWidth: 2, stroke: '#fff' }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : gradesVisible ? (
          <div className="flex h-[230px] items-center justify-center rounded-lg bg-slate-50 px-6 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            표시할 성적 기록이 없습니다.
          </div>
        ) : (
          <div className="flex h-[230px] flex-col items-center justify-center rounded-lg bg-slate-50 px-6 text-center dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200 ring-inset dark:bg-slate-950 dark:ring-slate-700">
              <LockKeyhole aria-hidden="true" size={16} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">성적 정보가 숨겨져 있습니다.</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
              상단 학업 현황에서 ‘성적 보기’를 누르면 학기별 추이를 표시합니다.
            </p>
          </div>
        )}
        <p className="mt-1 px-3 text-xs text-slate-500 dark:text-slate-400">4.5 만점 · 소수점 셋째 자리 절삭</p>
      </CardContent>
    </Card>
  );
}
