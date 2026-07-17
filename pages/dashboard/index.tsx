import { useMemo, useState } from 'react';
import { graduationLayout } from '@/components/layouts/graduation-runtime';
import { NextSeo } from 'next-seo';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';
import { extractOverallStatus, getPercentage } from '@utils/graduation/grad-formatter';
import { buildCourseListWithPeriod, calcAverageGrade, calcAverageGradeForCourseCodes } from '@utils/course/analytics';
import { WelcomeHeader } from '@components/dashboard/welcome-header';
import { EmptyState } from '@components/dashboard/empty-state';
import { RequirementsList } from '@components/dashboard/requirements-list';
import { UserInfoEditDialog } from '@components/dashboard/user-info-edit-dialog';
import { useRecommendedCourses } from '@/lib/hooks/useRecommendedCourses';
import { BentoGrid, BentoGridItem } from '@components/ui/bento-grid';
import { Progress } from '@components/ui/progress';
import { Badge } from '@components/ui/badge';
import { User, School, Book, Calendar, TrendingUp, AlertTriangle, BarChart, Eye, EyeOff } from 'lucide-react';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';
import type { FineGrainedRequirement } from '@lib/types/grad-requirements';
import type { CatalogNeedsContextSummary } from '@features/graduation/domain/types';

const TOTAL_REQUIRED_CREDITS = 130;
const DOMAIN_TO_CATEGORY_KEY: Record<string, FineGrainedRequirement['categoryKey']> = {
  '언어와 기초': 'languageBasic',
  기초과학: 'scienceBasic',
  전공: 'major',
  부전공: 'minor',
  인문사회: 'humanities',
  '연구 및 기타': 'etcMandatory',
  자유학점: 'otherUncheckedClass',
};

function getRequirementStatus(requirement: FineGrainedRequirement) {
  return requirement.status ?? (requirement.satisfied ? 'satisfied' : 'unsatisfied');
}

HomePage.getLayout = graduationLayout;

function getCreditPercentage(earned: number, required: number, fallback: number): number {
  if (required <= 0) return fallback;
  return Math.min(100, Math.round((earned * 100) / required));
}

function getCatalogNeedsContextForCategory(
  needsContext: readonly CatalogNeedsContextSummary[] | undefined,
  categoryKey: FineGrainedRequirement['categoryKey'] | undefined,
): CatalogNeedsContextSummary[] {
  if (!needsContext || !categoryKey) return [];
  if (categoryKey !== 'major' && categoryKey !== 'minor') return [];

  return needsContext.filter((item) => {
    const scope = item.rule.scope;
    return scope?.type !== 'global' && scope?.programKind === categoryKey;
  });
}

// 전공 라벨 헬퍼
function getMajorLabel(value: string): string {
  return MAJOR_OPTIONS.find((opt) => opt.value === value)?.label || value || '미선택';
}

function getMinorLabel(value: string): string {
  return MINOR_OPTIONS.find((opt) => opt.value === value)?.label || value;
}

export default function HomePage() {
  const { parsed, gradStatus, userMajor, userMinors, entryYear } = useGraduationStore();
  const {
    getRecommendationsForDomain,
    getAllRecommendationsForDomain,
    getRecommendationSuppressionsForDomain,
    recommendationPolicy,
  } = useRecommendedCourses();
  const [showGradeSummary, setShowGradeSummary] = useState(false);
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);

  const courseListWithPeriod = useMemo(() => buildCourseListWithPeriod(parsed), [parsed]);

  const overallAverageGrade = useMemo(
    () => calcAverageGrade(courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? [])),
    [courseListWithPeriod],
  );

  const majorAverageGrade = useMemo(
    () =>
      calcAverageGradeForCourseCodes(
        courseListWithPeriod.flatMap((term) => term.userTakenCourseList ?? []),
        (gradStatus?.graduationCategory.major.userTakenCoursesList.takenCourses ?? []).map(
          (course) => course.courseCode,
        ),
      ),
    [courseListWithPeriod, gradStatus],
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

  const fineGrainedRequirements = gradStatus?.fineGrainedRequirements ?? [];
  const requirements =
    overallProps?.categoriesArr.map(({ domain, status }) => {
      const categoryKey = DOMAIN_TO_CATEGORY_KEY[domain];
      const domainFineRequirements = categoryKey
        ? fineGrainedRequirements.filter((requirement) => requirement.categoryKey === categoryKey)
        : [];
      const minorCreditRequirements =
        categoryKey === 'minor'
          ? domainFineRequirements.filter((requirement) => requirement.id.startsWith('minor-credits-'))
          : [];
      const shouldUseFineGrainedCredits = minorCreditRequirements.length > 0;
      const mustFineRequirements = domainFineRequirements.filter((requirement) => requirement.importance === 'must');
      const required = shouldUseFineGrainedCredits
        ? minorCreditRequirements.reduce((sum, requirement) => sum + requirement.requiredCredits, 0)
        : (status?.minConditionCredits ?? 0);
      const earned = shouldUseFineGrainedCredits
        ? minorCreditRequirements.reduce((sum, requirement) => sum + requirement.acquiredCredits, 0)
        : (status?.totalCredits ?? 0);
      const courses = shouldUseFineGrainedCredits
        ? minorCreditRequirements.flatMap((requirement) => requirement.matchedCourses ?? [])
        : (status?.userTakenCoursesList?.takenCourses ?? []);
      const excludedCourses = domainFineRequirements.flatMap((requirement) =>
        (requirement.excludedCourses ?? []).map((course) => ({
          ...course,
          requirementLabel: requirement.label,
        })),
      );
      const hasNeedsReview = domainFineRequirements.some(
        (requirement) => getRequirementStatus(requirement) === 'needs_review',
      );

      return {
        domain,
        required,
        earned,
        percentage: getCreditPercentage(earned, required, getPercentage(status)),
        satisfied: shouldUseFineGrainedCredits
          ? mustFineRequirements.every((requirement) => getRequirementStatus(requirement) === 'satisfied')
          : (status?.satisfied ?? false),
        messages: status?.messages ?? [],
        courses,
        hasNeedsReview,
        appliedRequirements: domainFineRequirements,
        catalogNeedsContext: getCatalogNeedsContextForCategory(gradStatus?.catalogSelection?.needsContext, categoryKey),
        excludedCourses,
        recommendedCourses: getRecommendationsForDomain(domain),
        allRecommendedCourses: getAllRecommendationsForDomain(domain),
        recommendationSuppressions: getRecommendationSuppressionsForDomain(domain),
        recommendationPolicy,
      };
    }) ?? [];

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
      <WelcomeHeader
        studentId={parsed.studentId}
        remainingCredits={remainingCredits}
        hasData={true}
        actions={<UserInfoEditDialog open={userInfoDialogOpen} onOpenChange={setUserInfoDialogOpen} />}
      />

      {/* BentoGrid Dashboard */}
      <BentoGrid className="mb-8 md:auto-rows-[11rem] lg:grid-cols-4">
        {/* 상단 Row: 내 정보 + 졸업 진행률 */}

        {/* 내 정보 - 학번, 전공, 부전공 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1"
          title="내 정보"
          description={
            <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent mt-3 flex h-[80px] flex-col gap-2 overflow-y-auto pr-1 text-sm">
              {/* 학번 */}
              <div className="flex items-center gap-2">
                <div className="flex w-16 items-center gap-2 text-gray-500">
                  <Calendar size={14} className="shrink-0 text-gray-500" />
                  <span className="shrink-0">학번</span>
                </div>
                <span className="font-bold text-gray-900">{entryYear ? `${entryYear}학번` : '미입력'}</span>
              </div>

              {/* 전공 */}
              <div className="flex items-start gap-2">
                <div className="flex w-16 items-center gap-2 text-gray-500">
                  <Book size={14} className="mt-0.5 shrink-0 text-gray-500" />
                  <span className="shrink-0">전공</span>
                </div>
                <Badge
                  variant="outline"
                  className="h-fit border-blue-200 bg-blue-50 text-xs break-all whitespace-normal text-blue-700"
                >
                  {getMajorLabel(userMajor)}
                </Badge>
              </div>

              {/* 부전공 */}
              <div className="flex items-start gap-2">
                <div className="flex w-16 items-center gap-2 text-gray-500">
                  <Book size={14} className="mt-0.5 shrink-0 text-gray-500" />
                  <span className="shrink-0">부전공</span>
                </div>
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
              </div>
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
          title={
            <div className="flex items-center justify-between gap-2">
              <span>학점 평균</span>
              <button
                type="button"
                aria-label={showGradeSummary ? '학점 평균 숨기기' : '학점 평균 보기'}
                aria-pressed={showGradeSummary}
                title={showGradeSummary ? '학점 평균 숨기기' : '학점 평균 보기'}
                onClick={() => setShowGradeSummary((prev) => !prev)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-gray-500 transition hover:bg-slate-50 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {showGradeSummary ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          }
          description={
            <div>
              {showGradeSummary ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {overallAverageGrade != null ? overallAverageGrade.toFixed(2) : '-'}
                        </span>
                        <span className="text-xs text-gray-500">/ 4.5</span>
                      </div>
                      <span className="text-xs text-gray-500">전체</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {majorAverageGrade != null ? majorAverageGrade.toFixed(2) : '-'}
                        </span>
                        <span className="text-xs text-gray-500">/ 4.5</span>
                      </div>
                      <span className="text-xs text-gray-500">전공</span>
                    </div>
                  </div>
                  <div>
                    {gradeDelta !== null ? (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          gradeDelta >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}
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
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">비공개</span>
                  </div>
                  <span className="text-xs text-gray-500">누적 GPA</span>
                </>
              )}
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
        <RequirementsList requirements={requirements} onResolveNeedsReview={() => setUserInfoDialogOpen(true)} />
      </div>
    </div>
  );
}
