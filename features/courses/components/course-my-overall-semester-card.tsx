import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';

export default function OverallSemesterCard({
  start_y,
  start_s,
  end_y,
  end_s,
  semesterCount,
  avgCreditPerSemester,
  bestSemester,
}: {
  start_y?: number;
  start_s?: string;
  end_y?: number;
  end_s?: string;
  semesterCount: number;
  avgCreditPerSemester: number;
  bestSemester: any | null;
}) {
  const rangeLabel = start_y && start_s && end_y && end_s ? `${start_y}년 ${start_s} ~ ${end_y}년 ${end_s}` : '-';

  const bestLabel = bestSemester ? `${bestSemester.year}년 ${bestSemester.semester_str}` : '-';

  const bestGrade = bestSemester ? bestSemester.grade.toFixed(2) : null;

  return (
    <Card className="h-full border-slate-300 p-0 shadow-none">
      <CardHeader className="border-b border-slate-300 p-4">
        <CardTitle className="text-base font-medium">이수 학기 정보</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col p-4">
        {/* 기간 표시 */}
        <div className="text-foreground flex flex-col items-center justify-center text-lg font-bold">{rangeLabel}</div>
      </CardContent>
      <CardFooter className="border-t border-slate-300 p-4">
        {/* 핵심 통계 */}
        <div className="my-auto flex w-full items-center justify-center">
          <div className="text-center">
            <div className="text-foreground text-2xl font-bold">{semesterCount}</div>
            <div className="text-muted-foreground text-xs">총 학기</div>
          </div>
          <div className="mx-4 border-x border-slate-300 px-4 text-center">
            <div className="text-foreground text-2xl font-bold">{avgCreditPerSemester}</div>
            <div className="text-muted-foreground text-xs">평균 학점/학기</div>
          </div>
          <div className="text-center">
            <div className="text-foreground text-lg font-bold">{bestLabel}</div>
            {bestGrade && <div className="text-xs text-emerald-600 dark:text-emerald-400">최고 {bestGrade}</div>}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
