import React from 'react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { HelpCircle } from 'lucide-react';

import { convertGradeTo4Scale, CourseListWithPeriod } from '@utils/status';
import { useMyCourseOverview } from '@hooks/useMyCourseOverview';
import { TOTAL_REQUIRED_CREDITS } from '@const/grad-status-constants';
import UploadEmptyState from '@/features/graduation/components/upload-empty-state';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Progress } from '@components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';

const CourseMyGradeChart = dynamic(() => import('@/features/courses/components/course-my-grade-chart'), {
  loading: () => <div className="h-[250px] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
  ssr: false,
});
const CourseMyTableChart = dynamic(() => import('@/features/courses/components/course-my-table-chart'), {
  loading: () => <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
  ssr: false,
});
const CourseMyCreditChart = dynamic(() => import('@/features/courses/components/course-my-credit-chart'), {
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
  ssr: false,
});

import OverallSemesterCard from '@/features/courses/components/course-my-overall-semester-card';
import OverallAcademicCard from '@/features/courses/components/course-my-overall-academic-card';

export default function My() {
  const {
    parsed,
    courseListWithPeriod,
    totalCredit,
    overallAverageGrade,
    majorAverageGrade,
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
        <NextSeo title="수강 현황" description="내 수강 현황을 확인하세요" noindex />
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
      <NextSeo title="수강 현황" description="내 수강 현황을 확인하세요" noindex />
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
          majorAverageGrade={majorAverageGrade}
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
