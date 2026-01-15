import { useMemo } from 'react';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';
import { extractOverallStatus, getPercentage } from '@utils/graduation/grad-formatter';
import { buildCourseListWithPeriod, calcAverageGrade } from '@utils/course/analytics';
import { WelcomeHeader } from '@components/dashboard/welcome-header';
import { EmptyState } from '@components/dashboard/empty-state';
import { RequirementsList } from '@components/dashboard/requirements-list';
import { useRecommendedCourses } from '@/lib/hooks/useRecommendedCourses';
import { BentoGrid, BentoGridItem } from '@components/ui/bento-grid';
import { Progress } from '@components/ui/progress';
import { Badge } from '@components/ui/badge';
import { IconUser, IconSchool, IconBook, IconCalendar, IconTrendingUp, IconAlertTriangle } from '@tabler/icons-react';
import { MAJOR_OPTIONS } from '@const/major-minor-options';

const TOTAL_REQUIRED_CREDITS = 130;

// 전공 라벨 헬퍼
function getMajorLabel(value: string): string {
  return MAJOR_OPTIONS.find((opt) => opt.value === value)?.label || value || '미선택';
}

export default function HomePage() {
  const { parsed, gradStatus, userMajor, userMinors, entryYear } = useGraduationStore();
  const { getRecommendationsForDomain } = useRecommendedCourses();

  const courseListWithPeriod = useMemo(() => buildCourseListWithPeriod(parsed), [parsed]);

  const overallAverageGrade = useMemo(
    () => calcAverageGrade(courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? [])),
    [courseListWithPeriod],
  );

  // Data Processing
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
    overallProps?.categoriesArr.map(({ domain, status }) => ({
      domain,
      required: status?.minConditionCredits ?? 0,
      earned: status?.totalCredits ?? 0,
      percentage: getPercentage(status),
      satisfied: status?.satisfied ?? false,
      messages: status?.messages ?? [],
      courses: status?.userTakenCoursesList?.takenCourses ?? [],
      recommendedCourses: getRecommendationsForDomain(domain),
    })) ?? [];

  const unsatisfiedRequirements = requirements.filter((r) => !r.satisfied).length;
  const hasData = !!(parsed && gradStatus);

  // Empty State
  if (!hasData) {
    return (
      <div className="w-full">
        <WelcomeHeader entryYear={entryYear} hasData={false} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
      {/* Header */}
      <WelcomeHeader entryYear={entryYear} remainingCredits={remainingCredits} hasData={true} />

      {/* BentoGrid Dashboard */}
      <BentoGrid className="mb-8 md:auto-rows-[11rem] lg:grid-cols-4">
        {/* 상단 Row: 내 정보 + 졸업 진행률 */}

        {/* 내 정보 - 학번, 전공, 부전공 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title="내 정보"
          description={
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <IconCalendar size={14} className="text-gray-400" />
                <span className="w-10 text-gray-500">학번</span>
                <span className="font-medium text-gray-800">{entryYear ? `${entryYear}학번` : '미입력'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconBook size={14} className="text-gray-400" />
                <span className="w-10 text-gray-500">전공</span>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                  {getMajorLabel(userMajor)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconSchool size={14} className="text-gray-400" />
                <span className="w-10 text-gray-500">부전공</span>
                {(userMinors ?? []).length > 0 ? (
                  <span className="text-xs text-gray-700">{(userMinors ?? []).join(', ')}</span>
                ) : (
                  <span className="text-xs text-gray-400">없음</span>
                )}
              </div>
            </div>
          }
          icon={<IconUser className="h-4 w-4 text-blue-500" />}
        />

        {/* 총 이수학점 + 졸업 진행률 */}
        <BentoGridItem
          className="md:col-span-3 md:row-span-1"
          title={
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-600">{totalCreditsEarned}</span>
              <span className="text-lg font-medium text-gray-400">/ {TOTAL_REQUIRED_CREDITS}학점</span>
              <span className="ml-auto text-2xl font-bold text-gray-700">{totalPercentage}%</span>
            </div>
          }
          description={
            <div className="mt-3">
              <Progress value={totalPercentage} className="h-3" />
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>총 이수 학점</span>
                <span>졸업 진행률</span>
              </div>
            </div>
          }
          icon={<IconSchool className="h-4 w-4 text-blue-500" />}
        />

        {/* 하단 Row: GPA, 수강 과목 수, 남은 학점, 미충족 영역 */}

        {/* 학점 평균 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title={
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-800">{(overallAverageGrade ?? 0).toFixed(2)}</span>
              <span className="text-sm text-gray-400">/ 4.5</span>
            </div>
          }
          description={
            gradeDelta !== null ? (
              <div className={`flex items-center gap-1 text-xs ${gradeDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                <IconTrendingUp size={12} />
                <span>
                  {gradeDelta >= 0 ? '+' : ''}
                  {gradeDelta.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">누적 학점 평균</span>
            )
          }
          icon={<span className="text-sm">📊</span>}
        />

        {/* 수강 과목 수 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title={
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-indigo-600">{completedCourses}</span>
              <span className="text-sm text-gray-400">과목</span>
            </div>
          }
          description={<span className="text-xs text-gray-500">수강 완료</span>}
          icon={<IconBook className="h-4 w-4 text-indigo-500" />}
        />

        {/* 남은 학점 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title={
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-700">{remainingCredits}</span>
              <span className="text-sm text-gray-400">학점</span>
            </div>
          }
          description={<span className="text-xs text-gray-500">졸업까지 남은 학점</span>}
          icon={<IconBook className="h-4 w-4 text-gray-500" />}
        />

        {/* 미충족 영역 + 화살표 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title={
            <div className="flex items-baseline gap-1">
              <span
                className={`text-3xl font-bold ${unsatisfiedRequirements > 0 ? 'text-amber-500' : 'text-green-500'}`}
              >
                {unsatisfiedRequirements}
              </span>
              <span className="text-sm text-gray-400">영역</span>
            </div>
          }
          description={
            <div className="flex items-center gap-1 text-xs">
              {unsatisfiedRequirements > 0 ? (
                <span className="text-amber-600">미충족 ↓</span>
              ) : (
                <span className="text-green-600">모두 충족 🎉</span>
              )}
            </div>
          }
          icon={
            <IconAlertTriangle
              className={`h-4 w-4 ${unsatisfiedRequirements > 0 ? 'text-amber-500' : 'text-green-500'}`}
            />
          }
        />
      </BentoGrid>

      {/* Detailed Requirements List */}
      <div className="mb-8">
        <RequirementsList requirements={requirements} />
      </div>
    </div>
  );
}
