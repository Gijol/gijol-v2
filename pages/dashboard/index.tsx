import { useMemo } from 'react';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';
import { extractOverallStatus, getPercentage } from '@utils/graduation/grad-formatter';
import { buildCourseListWithPeriod, calcAverageGrade } from '@utils/course/analytics';
import { WelcomeHeader } from '@components/dashboard/welcome-header';
import { EmptyState } from '@components/dashboard/empty-state';
import { StatsRow } from '@components/dashboard/stats-row';
import { OverallProgressCard } from '@components/dashboard/overall-progress-card';
import { GPACard } from '@components/dashboard/gpa-card';
import { RequirementsList } from '@components/dashboard/requirements-list';

const TOTAL_REQUIRED_CREDITS = 130;

export default function HomePage() {
  const { parsed, gradStatus } = useGraduationStore();

  const courseListWithPeriod = useMemo(() => buildCourseListWithPeriod(parsed), [parsed]);

  const overallAverageGrade = useMemo(
    () => calcAverageGrade(courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? [])),
    [courseListWithPeriod],
  );

  // 1. Data Processing
  const overallProps = extractOverallStatus(gradStatus);
  const totalCreditsEarned = overallProps?.totalCredits ?? 0;
  const totalPercentage = overallProps?.totalPercentage ?? 0;

  const validTermGrades = courseListWithPeriod.filter((t) => t.grade && t.grade > 0);

  const gradeDelta =
    validTermGrades.length >= 2
      ? validTermGrades[validTermGrades.length - 1].grade - validTermGrades[validTermGrades.length - 2].grade
      : null;

  const remainingCredits = Math.max(0, TOTAL_REQUIRED_CREDITS - totalCreditsEarned);
  const completedCourses = courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? []).length;

  const requirements =
    overallProps?.categoriesArr.map(({ domain, status }) => {
      const required = status?.minConditionCredits ?? 0;
      const earned = status?.totalCredits ?? 0;
      return {
        domain,
        required,
        earned,
        percentage: getPercentage(status),
        satisfied: status?.satisfied ?? false,
        messages: status?.messages ?? [],
        courses: status?.userTakenCoursesList?.takenCourses ?? [],
      };
    }) ?? [];

  const unsatisfiedRequirements = requirements.filter((r) => !r.satisfied).length;
  const hasData = !!(parsed && gradStatus);

  // 2. Render
  if (!hasData) {
    return (
      <div className="w-full">
        <WelcomeHeader name="서동호" hasData={false} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
      {/* 1. Header & Greeting */}
      <WelcomeHeader name="서동호" remainingCredits={remainingCredits} hasData={true} />

      {/* 2. Key Stats Row */}
      <StatsRow
        totalCreditsEarned={totalCreditsEarned}
        totalRequiredCredits={TOTAL_REQUIRED_CREDITS}
        remainingCredits={remainingCredits}
        completedCourses={completedCourses}
        unsatisfiedRequirements={unsatisfiedRequirements}
      />

      {/* 3. Main Progress Section (2 Columns) */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OverallProgressCard
          className="lg:col-span-2"
          totalPercentage={totalPercentage}
          totalCreditsEarned={totalCreditsEarned}
          totalRequiredCredits={TOTAL_REQUIRED_CREDITS}
        />
        <GPACard overallAverageGrade={overallAverageGrade} gradeDelta={gradeDelta} />
      </div>

      {/* 4. Detailed Requirements List */}
      <div className="mb-8">
        <RequirementsList requirements={requirements} />
      </div>
    </div>
  );
}
