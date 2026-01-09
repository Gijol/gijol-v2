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

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
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
  const rangeLabel =
    start_y && start_s && end_y && end_s ? `${start_y}년 ${start_s} ~ ${end_y}년 ${end_s}` : '-';

  const bestLabel = bestSemester
    ? `${bestSemester.year}년 ${bestSemester.semester_str} (${bestSemester.grade.toFixed(2)} / 4.5)`
    : '-';

  return (
    <Card className="h-full transition-all hover:bg-secondary/10 hover:shadow-md">
      <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
        <h3 className="text-lg font-semibold text-foreground">
          🗃️ 이수 학기 정보
        </h3>
        <div className="flex justify-center">
          <span className="text-xl font-semibold whitespace-nowrap text-foreground">
            {rangeLabel}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">
              총 이수 학기:
            </span>
            <span className="text-sm font-semibold text-foreground">
              {semesterCount}학기
            </span>
          </div>

          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">
              학기당 평균 이수 학점:
            </span>
            <span className="text-sm font-semibold text-foreground">
              {avgCreditPerSemester}학점
            </span>
          </div>

          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">
              최고 학기:
            </span>
            <span className="text-sm font-semibold text-foreground">
              {bestLabel}
            </span>
          </div>
        </div>
      </CardContent>
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
    <div className="flex flex-col gap-4">
      <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            누적 이수 학점
          </h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-foreground">{totalCredit}</span>
            <span className="text-lg font-medium text-muted-foreground">/ {TOTAL_REQUIRED_CREDITS}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{progress.toFixed(2)}%</span>
            </div>
            <Progress value={progress} className="h-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
        <CardContent className="p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-foreground">
            평균 학점
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {averageGrade ?? '-'}
            </span>
            <span className="text-lg font-medium text-muted-foreground">
              / 4.5
            </span>
          </div>

          {averageGrade != null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                GPA(4.0 기준) 환산 : {convertGradeTo4Scale(averageGrade, 4.5)}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-full bg-secondary p-1 cursor-help hover:bg-secondary/80 transition-colors">
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>정확하지 않으므로 참고용으로만 사용해주세요!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-bold mb-8 text-foreground">
          📑 수강현황
        </h2>
        <UploadEmptyState />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 mt-5 text-foreground">
        📑 수강현황
      </h2>

      <div className="flex gap-4 mb-6 text-muted-foreground text-sm flex-wrap">
        <span>학번: {studentId}</span>
        <span>전공: {majorName}</span>
        <span>입학년도: {entryYear}년</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CourseMyCreditChart data={courseListWithPeriod} />
        </div>
        <div className="lg:col-span-6">
          <CourseMyGradeChart data={courseListWithPeriod} />
        </div>
        <div className="lg:col-span-12">
          <CourseMyTableChart data={courseListWithPeriod} />
        </div>
      </div>

      <div className="h-16" />
      <div className="mt-10 mb-12 pb-12 flex justify-center">
        <p className="text-base text-muted-foreground text-center">
          언제나 여러분의 성공적인 학업 여정을 응원합니다! 🎓🚀
        </p>
      </div>
    </div>
  );
}
