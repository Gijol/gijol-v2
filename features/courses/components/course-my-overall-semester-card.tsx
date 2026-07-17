import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

type BestSemester = {
  year: number;
  semester_str: string;
  grade: number;
};

export default function OverallSemesterCard({
  start_y,
  start_s,
  end_y,
  end_s,
  semesterCount,
  avgCreditPerSemester,
  bestSemester,
  gradesVisible,
}: {
  start_y?: number;
  start_s?: string;
  end_y?: number;
  end_s?: string;
  semesterCount: number;
  avgCreditPerSemester: number;
  bestSemester: BestSemester | null;
  gradesVisible: boolean;
}) {
  const rangeLabel =
    start_y && start_s && end_y && end_s ? `${start_y}년 ${start_s} – ${end_y}년 ${end_s}` : '기록 없음';
  const bestLabel = bestSemester ? `${bestSemester.year}년 ${bestSemester.semester_str}` : '기록 없음';

  return (
    <Card className="h-full min-w-0 gap-0 overflow-hidden border-slate-200 bg-white p-0 shadow-none dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <CardTitle className="text-base font-semibold text-slate-950 dark:text-slate-50">이수 학기</CardTitle>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">학업 기간과 학기별 이수량입니다.</p>
      </CardHeader>

      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">이수 기간</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950 tabular-nums dark:text-slate-50">
            {rangeLabel}
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-2 divide-x divide-slate-200 border-y border-slate-200 py-5 dark:divide-slate-800 dark:border-slate-800">
          <div className="pr-5">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">이수 학기</dt>
            <dd className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-950 tabular-nums dark:text-slate-50">{semesterCount}</span>
              <span className="text-xs text-slate-400">학기</span>
            </dd>
          </div>
          <div className="pl-5">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">학기당 평균</dt>
            <dd className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-950 tabular-nums dark:text-slate-50">
                {avgCreditPerSemester}
              </span>
              <span className="text-xs text-slate-400">학점</span>
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3.5 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">최고 성적 학기</p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
              {bestLabel}
            </p>
            {bestSemester && (
              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 tabular-nums ring-1 ring-slate-200 ring-inset dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700">
                {gradesVisible ? `${bestSemester.grade.toFixed(2)} 평점` : '평점 비공개'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
