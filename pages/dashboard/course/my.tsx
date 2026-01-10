import React from 'react';
import { useRouter } from 'next/router';
import { HelpCircle } from 'lucide-react';

import CourseMyGradeChart from '@components/course-my-grade-chart';
import CourseMyTableChart from '@components/course-my-table-chart';
import CourseMyCreditChart from '@components/course-my-credit-chart';

import { convertGradeTo4Scale, CourseListWithPeriod } from '@utils/status';
import { useMyCourseOverview } from '@hooks/useMyCourseOverview';
import { TOTAL_REQUIRED_CREDITS } from '@const/grad-status-constants';
import UploadEmptyState from '@components/graduation/upload-empty-state';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Progress } from '@components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';

function OverallSemesterCard({
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

function OverallAcademicCard({
  totalCredit,
  totalRequired,
  averageGrade,
  progress,
}: {
  totalCredit: number;
  totalRequired: number;
  averageGrade: number | null;
  progress: number; // 0~100
}) {
  return (
    <Card className="h-full border-slate-300 p-0 shadow-none">
      <CardHeader className="border-b border-slate-300 p-4">
        <CardTitle className="text-base font-medium">학업 현황</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col p-4">
        {/* 두 개의 핵심 지표를 나란히 배치 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 이수 학점 */}
          <div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-foreground text-3xl font-bold">{totalCredit}</span>
              <span className="text-muted-foreground text-lg">/ {totalRequired}</span>
            </div>
            <div className="text-muted-foreground text-center text-xs">이수 학점</div>
          </div>

          {/* 평균 학점 */}
          <div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-foreground text-3xl font-bold">{averageGrade ?? '-'}</span>
              <span className="text-muted-foreground text-lg">/ 4.5</span>
            </div>
            <div className="text-muted-foreground mt-1 text-center text-xs">평균 학점</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-300 p-4">
        {/* GPA 환산 */}
        {averageGrade != null && (
          <>
            <span className="text-muted-foreground mr-2 text-sm">
              GPA 4.0 환산:{' '}
              <span className="text-foreground font-medium">{convertGradeTo4Scale(averageGrade, 4.5)}</span>
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-secondary hover:bg-secondary/80 cursor-help rounded-full p-0.5 transition-colors">
                    <HelpCircle className="text-muted-foreground h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>정확하지 않으므로 참고용으로만 사용해주세요!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default function My() {
  const {
    parsed,
    courseListWithPeriod,
    totalCredit,
    overallAverageGrade,
    start_y,
    start_s,
    end_y,
    end_s,
    semesterCount,
    avgCreditPerSemester,
    bestSemester,
    progress,
    studentId,
    majorName,
    entryYear,
    TOTAL_REQUIRED_CREDITS,
  } = useMyCourseOverview();

  // 아직 업로드된 데이터가 없을 때
  if (!parsed || !parsed.userTakenCourseList?.length) {
    return (
      <div className="min-h-screen w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">📊 수강 현황</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">성적표를 업로드하면 학업 현황을 분석해드립니다.</p>
        </div>
        <UploadEmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">📊 수강 현황</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {studentId && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              학번 {studentId}
            </span>
          )}
          {majorName && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {majorName}
            </span>
          )}
          {entryYear && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {entryYear}학번
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <OverallAcademicCard
          totalCredit={totalCredit}
          totalRequired={TOTAL_REQUIRED_CREDITS}
          averageGrade={overallAverageGrade}
          progress={progress}
        />
        <OverallSemesterCard
          start_y={start_y}
          start_s={start_s}
          end_y={end_y}
          end_s={end_s}
          semesterCount={semesterCount}
          avgCreditPerSemester={avgCreditPerSemester}
          bestSemester={bestSemester}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid grid-cols-1 gap-6">
        <CourseMyCreditChart data={courseListWithPeriod} />
        <CourseMyGradeChart data={courseListWithPeriod} />
      </div>

      {/* Table Section */}
      <div className="mb-8">
        <CourseMyTableChart data={courseListWithPeriod} />
      </div>
    </div>
  );
}
