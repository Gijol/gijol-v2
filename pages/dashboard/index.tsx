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
import { OverallProgressCard } from '@components/dashboard/overall-progress-card';
import { GPACard } from '@components/dashboard/gpa-card';
import { UserInfoCard } from '@components/dashboard/user-info-card';
import { useRecommendedCourses } from '@/lib/hooks/useRecommendedCourses';
import { AlertTriangle, ArrowDown, CircleCheck } from 'lucide-react';
import type { FineGrainedRequirement } from '@lib/types/grad-requirements';
import type { CatalogNeedsContextSummary } from '@features/graduation/domain/types';
import { DashboardPageShell, SectionHeader } from '@components/dashboard/page-shell';

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
  const needsReviewCount = requirements.filter((requirement) => requirement.hasNeedsReview).length;
  const hasData = !!(parsed && gradStatus);

  // Empty State
  if (!hasData) {
    return (
      <DashboardPageShell>
        <NextSeo title="대시보드" description="졸업 현황을 한눈에 확인하세요" noindex />
        <WelcomeHeader studentId={parsed?.studentId} hasData={false} />
        <EmptyState />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell>
      <NextSeo title="대시보드" description="졸업 현황을 한눈에 확인하세요" noindex />
      <WelcomeHeader
        studentId={parsed.studentId}
        remainingCredits={remainingCredits}
        hasData={true}
        actions={<UserInfoEditDialog open={userInfoDialogOpen} onOpenChange={setUserInfoDialogOpen} />}
      />

      <section aria-labelledby="graduation-summary-title" className="mb-10">
        <SectionHeader title="졸업 요약" description="지금 가장 중요한 진행 상황과 확인 항목을 먼저 보여드립니다." />

        <div className="grid gap-5 lg:grid-cols-12">
          <OverallProgressCard
            className="lg:col-span-8"
            totalPercentage={totalPercentage}
            totalCreditsEarned={totalCreditsEarned}
            totalRequiredCredits={TOTAL_REQUIRED_CREDITS}
            remainingCredits={remainingCredits}
            completedCourses={completedCourses}
          />

          <section
            aria-labelledby="attention-title"
            className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  unsatisfiedRequirements > 0
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                }`}
              >
                {unsatisfiedRequirements > 0 ? (
                  <AlertTriangle aria-hidden="true" size={17} />
                ) : (
                  <CircleCheck aria-hidden="true" size={17} />
                )}
              </div>
              <div>
                <h3 id="attention-title" className="text-base font-semibold text-slate-950 dark:text-slate-50">
                  확인할 항목
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">영역별 졸업요건 기준</p>
              </div>
            </div>

            <div className="mt-7">
              <p className="text-4xl font-bold tracking-tight text-slate-950 tabular-nums dark:text-slate-50">
                {unsatisfiedRequirements}
                <span className="ml-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">개 미충족</span>
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {unsatisfiedRequirements > 0
                  ? '학점과 필수 과목을 영역별로 확인해 주세요.'
                  : '현재 계산된 졸업요건을 모두 충족했습니다.'}
              </p>
              {needsReviewCount > 0 && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  학적 정보 확인이 필요한 영역이 {needsReviewCount}개 있습니다.
                </p>
              )}
            </div>

            <a
              href="#requirements"
              className="mt-auto inline-flex touch-manipulation items-center gap-1.5 pt-6 text-sm font-semibold text-blue-700 transition-[transform,color] duration-150 ease-out hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] motion-reduce:transition-none dark:text-blue-400 dark:hover:text-blue-300"
            >
              영역별 현황 보기
              <ArrowDown aria-hidden="true" size={15} />
            </a>
          </section>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <GPACard
            overallAverageGrade={overallAverageGrade}
            majorAverageGrade={majorAverageGrade}
            gradeDelta={gradeDelta}
            gradesVisible={showGradeSummary}
            onGradesVisibleChange={setShowGradeSummary}
          />
          <UserInfoCard
            studentId={parsed.studentId}
            entryYear={entryYear ?? null}
            userMajor={userMajor}
            userMinors={userMinors}
          />
        </div>
      </section>

      <section id="requirements" className="scroll-mt-6 pb-8">
        <RequirementsList requirements={requirements} onResolveNeedsReview={() => setUserInfoDialogOpen(true)} />
      </section>
    </DashboardPageShell>
  );
}
