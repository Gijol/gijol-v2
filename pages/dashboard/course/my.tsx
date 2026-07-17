import { useState } from 'react';
import { NextSeo } from 'next-seo';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { useMyCourseOverview } from '@hooks/useMyCourseOverview';
import UploadEmptyState from '@/features/graduation/components/upload-empty-state';
import { MAJOR_OPTIONS } from '@const/major-minor-options';

import dynamic from 'next/dynamic';

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
import { DashboardPageShell, PageHeader, SectionHeader } from '@/components/dashboard/page-shell';

export default function My() {
  const [gradesVisible, setGradesVisible] = useState(false);
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
  const majorDisplayName = MAJOR_OPTIONS.find((option) => option.value === majorName)?.label ?? majorName;

  // 아직 업로드된 데이터가 없을 때
  if (!parsed || !parsed.userTakenCourseList?.length) {
    return (
      <DashboardPageShell>
        <NextSeo title="수강 현황" description="내 수강 현황을 확인하세요" noindex />
        <PageHeader title="수강 현황" description="성적표를 업로드하면 학업 현황을 분석합니다." />
        <UploadEmptyState />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell>
      <NextSeo title="수강 현황" description="내 수강 현황을 확인하세요" noindex />
      <PageHeader title="수강 현황" description="학기별 이수학점과 성적 흐름을 확인하세요." />

      {/* Stats Cards */}
      <section aria-label="학업 요약" className="mb-8 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <OverallAcademicCard
            totalCredit={totalCredit}
            totalRequired={TOTAL_REQUIRED_CREDITS}
            averageGrade={overallAverageGrade}
            majorAverageGrade={majorAverageGrade}
            progress={progress}
            studentId={studentId}
            majorName={majorDisplayName}
            entryYear={entryYear}
            gradesVisible={gradesVisible}
            onGradesVisibleChange={setGradesVisible}
          />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <OverallSemesterCard
            start_y={start_y}
            start_s={start_s}
            end_y={end_y}
            end_s={end_s}
            semesterCount={semesterCount}
            avgCreditPerSemester={avgCreditPerSemester}
            bestSemester={bestSemester}
            gradesVisible={gradesVisible}
          />
        </div>
      </section>

      {/* Charts Section */}
      <section aria-labelledby="semester-trends-title" className="mb-8">
        <SectionHeader title="학기별 변화" description="학점과 평점의 흐름을 나란히 비교하세요." />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
          <CourseMyCreditChart data={courseListWithPeriod} />
          <CourseMyGradeChart data={courseListWithPeriod} gradesVisible={gradesVisible} />
        </div>
      </section>

      {/* Table Section */}
      <section aria-labelledby="course-list-title" className="mb-8">
        <h2 id="course-list-title" className="sr-only">
          수강 과목 상세
        </h2>
        <CourseMyTableChart data={courseListWithPeriod} gradesVisible={gradesVisible} />
      </section>
    </DashboardPageShell>
  );
}

My.getLayout = dashboardLayout;
