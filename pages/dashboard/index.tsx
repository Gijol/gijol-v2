import { useMemo } from 'react';
import { NextSeo } from 'next-seo';
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
import { User, School, Book, Calendar, TrendingUp, AlertTriangle, BarChart } from 'lucide-react';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';

const TOTAL_REQUIRED_CREDITS = 130;

// 전공 라벨 헬퍼
function getMajorLabel(value: string): string {
  return MAJOR_OPTIONS.find((opt) => opt.value === value)?.label || value || '미선택';
}

function getMinorLabel(value: string): string {
  return MINOR_OPTIONS.find((opt) => opt.value === value)?.label || value;
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
        <NextSeo title="대시보드" description="졸업 현황을 한눈에 확인하세요" noindex />
        <WelcomeHeader studentId={parsed?.studentId} hasData={false} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
      <NextSeo title="대시보드" description="졸업 현황을 한눈에 확인하세요" noindex />
      {/* Header */}
      <WelcomeHeader studentId={parsed.studentId} remainingCredits={remainingCredits} hasData={true} />

      {/* BentoGrid Dashboard */}
      <BentoGrid className="mb-8 md:auto-rows-[11rem] lg:grid-cols-4">
        {/* 상단 Row: 내 정보 + 졸업 진행률 */}

        {/* 내 정보 - 학번, 전공, 부전공 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title="내 정보"
          description={
            <div className="mt-3">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="w-20 py-1 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500" />
                        <span>학번</span>
                      </div>
                    </td>
                    <td className="py-1 font-bold text-gray-900">{entryYear ? `${entryYear}학번` : '미입력'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Book size={14} className="text-gray-500" />
                        <span>전공</span>
                      </div>
                    </td>
                    <td className="py-1">
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                        {getMajorLabel(userMajor)}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 align-top text-gray-500">
                      <div className="flex items-center gap-2">
                        <Book size={14} className="mt-0.5 text-gray-500" />
                        <span>부전공</span>
                      </div>
                    </td>
                    <td className="py-1">
                      <div className="flex flex-wrap gap-1">
                        {userMinors && userMinors.length > 0 ? (
                          userMinors.map((m) => (
                            <Badge
                              key={m}
                              variant="outline"
                              className="border-orange-200 bg-orange-50 text-xs text-orange-700"
                            >
                              {getMinorLabel(m)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">미선택</span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
          icon={<User className="h-4 w-4 text-blue-500" />}
          disableHover={true}
        />

        {/* 총 이수학점 + 졸업 진행률 */}
        <BentoGridItem
          className="md:col-span-3 md:row-span-1"
          title={<div>이수 진행률</div>}
          description={
            <div className="mt-3">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-blue-600">{totalCreditsEarned}</span>
                <span className="text-lg font-medium text-gray-500">/ {TOTAL_REQUIRED_CREDITS}학점</span>
                <span className="ml-auto text-2xl font-bold text-gray-900">{totalPercentage}%</span>
              </div>
              <Progress value={totalPercentage} className="mt-3 h-3" />
            </div>
          }
          icon={<School className="h-4 w-4 text-blue-500" />}
          disableHover={true}
        />

        {/* 하단 Row: GPA, 수강 과목 수, 남은 학점, 미충족 영역 */}

        {/* 학점 평균 */}
        <BentoGridItem
          className="text-gray-900 md:col-span-1 md:row-span-1"
          title={<div>학점 평균</div>}
          description={
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{(overallAverageGrade ?? 0).toFixed(2)}</span>
                <span className="text-sm text-gray-500">/ 4.5</span>
              </div>
              <div>
                {gradeDelta !== null ? (
                  <div
                    className={`flex items-center gap-1 text-xs ${gradeDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}
                  >
                    <TrendingUp size={12} />
                    <span>
                      {gradeDelta >= 0 ? '+' : ''}
                      {gradeDelta.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">누적 학점 평균</span>
                )}
              </div>
            </div>
          }
          icon={<BarChart className="h-4 w-4 text-blue-500" />}
          disableHover={true}
        />

        {/* 수강 과목 수 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title={<div>수강 과목 수</div>}
          description={
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{completedCourses}</span>
                <span className="text-xs text-gray-500">과목</span>
              </div>
            </div>
          }
          icon={<Book className="h-4 w-4 text-gray-500" />}
          disableHover={true}
        />

        {/* 남은 학점 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title={<div>남은 학점</div>}
          description={
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">{remainingCredits}</span>
              <span className="text-xs text-gray-500">학점</span>
            </div>
          }
          icon={<Book className="h-4 w-4 text-gray-500" />}
          disableHover={true}
        />

        {/* 미충족 영역 + 화살표 */}
        <BentoGridItem
          className={`md:col-span-1 md:row-span-1 ${unsatisfiedRequirements > 0 ? 'border-amber-500' : 'border-green-500'}`}
          title={<div>미충족 영역</div>}
          description={
            <div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl font-bold ${unsatisfiedRequirements > 0 ? 'text-amber-500' : 'text-green-500'}`}
                >
                  {unsatisfiedRequirements}
                </span>
                <span className="text-sm text-gray-500">개</span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                {unsatisfiedRequirements > 0 ? (
                  <span className="text-amber-600">아래에서 확인하세요!</span>
                ) : (
                  <span className="text-green-600">모두 충족 🎉</span>
                )}
              </div>
            </div>
          }
          icon={
            <AlertTriangle className={`h-4 w-4 ${unsatisfiedRequirements > 0 ? 'text-amber-500' : 'text-green-500'}`} />
          }
          disableHover={true}
        />
      </BentoGrid>

      {/* Detailed Requirements List */}
      <div className="mb-8">
        <RequirementsList requirements={requirements} />
      </div>
    </div>
  );
}
