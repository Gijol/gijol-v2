'use client';

import { useState } from 'react';
import { AlertTriangle, CircleCheck, Library, ChevronDown, ChevronUp, PanelLeftOpen, Search, X } from 'lucide-react';
import { Progress } from '@components/ui/progress';
import { Badge } from '@components/ui/badge';
import { ScrollArea } from '@components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@components/ui/sheet';
import { Button } from '@components/ui/button';
import { cn } from '@/lib/utils';
import type { RecommendedCourse } from '@/lib/types/recommended-course';
import type { CatalogNeedsContextSummary } from '@features/graduation/domain/types';
import type {
  FineGrainedRequirement,
  RequirementEvaluationStatus,
  RequirementSource,
} from '@lib/types/grad-requirements';
import type {
  RecommendationDisplayPolicy,
  RecommendationSuppression,
} from '@features/graduation/data';

interface Requirement {
  domain: string;
  required: number;
  earned: number;
  percentage: number;
  satisfied: boolean;
  messages: string[];
  courses: any[];
  hasNeedsReview?: boolean;
  appliedRequirements?: FineGrainedRequirement[];
  catalogNeedsContext?: CatalogNeedsContextSummary[];
  excludedCourses?: Array<{
    courseCode: string;
    courseName: string;
    credit: number;
    year: number;
    semester: string;
    reason: string;
    requirementLabel?: string;
  }>;
  recommendedCourses?: RecommendedCourse[];
  allRecommendedCourses?: RecommendedCourse[];
  recommendationSuppressions?: RecommendationSuppression[];
  recommendationPolicy?: Required<RecommendationDisplayPolicy>;
}

interface RequirementsListProps {
  requirements: Requirement[];
  className?: string;
  onResolveNeedsReview?: () => void;
}

// 추천 과목 섹션 (더보기 기능 포함)
const INITIAL_SHOW_COUNT = 3;
const SEARCH_THRESHOLD = 12;
const MAX_EVIDENCE_ROWS = 6;

function getRecommendationCountLabel(visibleCount: number, totalCount: number): string | null {
  if (totalCount > 0) return `대표 ${visibleCount} / 전체 ${totalCount}`;
  if (visibleCount > 0) return `대표 ${visibleCount}`;
  return null;
}

function groupRecommendedCoursesByReason(courses: RecommendedCourse[]): Array<{
  reason: string;
  courses: RecommendedCourse[];
}> {
  const groups = new Map<string, RecommendedCourse[]>();

  courses.forEach((course) => {
    const reason = course.category?.trim() || '추천 과목';
    groups.set(reason, [...(groups.get(reason) ?? []), course]);
  });

  return Array.from(groups.entries()).map(([reason, groupedCourses]) => ({
    reason,
    courses: groupedCourses,
  }));
}

function getRequirementStatus(requirement: FineGrainedRequirement): RequirementEvaluationStatus {
  return requirement.status ?? (requirement.satisfied ? 'satisfied' : 'unsatisfied');
}

function getEvidenceStatusLabel(status: RequirementEvaluationStatus): string {
  if (status === 'satisfied') return '충족';
  if (status === 'needs_review') return '검토 필요';
  return '미충족';
}

function getEvidenceStatusClassName(status: RequirementEvaluationStatus): string {
  if (status === 'satisfied') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'needs_review') return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-slate-200 bg-slate-100 text-slate-700';
}

function sourceRefKey(sourceRef: RequirementSource): string {
  return [sourceRef.manualYear, sourceRef.page, sourceRef.path, sourceRef.note ?? ''].join('|');
}

function formatSourceRef(sourceRef: RequirementSource): string {
  return `${sourceRef.manualYear} p.${sourceRef.page}`;
}

function uniqueSourceRefs(sourceRefs: readonly RequirementSource[] | undefined): RequirementSource[] {
  const byKey = new Map<string, RequirementSource>();
  sourceRefs?.forEach((sourceRef) => {
    byKey.set(sourceRefKey(sourceRef), sourceRef);
  });
  return Array.from(byKey.values()).sort((a, b) => {
    if (a.manualYear !== b.manualYear) return a.manualYear - b.manualYear;
    return a.page - b.page;
  });
}

function formatMissingContext(missingContext: readonly string[]): string {
  const labels: Record<string, string> = {
    program: '전공/부전공 선택 정보가 필요합니다.',
    declarationTerm: '선언 학기 정보가 필요합니다.',
    evaluationTerm: '판정 기준 학기 정보가 필요합니다.',
  };

  return missingContext.map((context) => labels[context] ?? `${context} 정보가 필요합니다.`).join(' ');
}

function RequirementEvidenceSection({
  requirements,
  needsContext,
}: {
  requirements?: FineGrainedRequirement[];
  needsContext?: CatalogNeedsContextSummary[];
}) {
  const evidenceRequirements = (requirements ?? []).filter(
    (requirement) => (requirement.sourceRefs?.length ?? 0) > 0 || getRequirementStatus(requirement) === 'needs_review',
  );
  const contextRows = needsContext ?? [];
  const hasEvidence = evidenceRequirements.length > 0 || contextRows.length > 0;

  if (!hasEvidence) return null;

  const visibleRequirements = evidenceRequirements.slice(0, MAX_EVIDENCE_ROWS);
  const hiddenRequirementCount = Math.max(0, evidenceRequirements.length - visibleRequirements.length);

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Library size={16} />
        적용 근거
      </h4>

      <div className="space-y-2">
        {contextRows.map((item) => {
          const sourceRefs = uniqueSourceRefs(item.rule.sourceRefs);
          const label = item.rule.label ?? item.rule.id;

          return (
            <div key={`needs-context-${item.rule.id}`} className="rounded-md border border-amber-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0 border-amber-200 bg-amber-50 text-xs text-amber-800">
                  검토 필요
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    {formatMissingContext(item.missingContext)}
                  </p>
                  {sourceRefs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sourceRefs.map((sourceRef) => (
                        <Badge
                          key={sourceRefKey(sourceRef)}
                          variant="outline"
                          title={sourceRef.note}
                          className="border-slate-200 bg-slate-50 font-mono text-[11px] text-slate-600"
                        >
                          {formatSourceRef(sourceRef)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {visibleRequirements.map((requirement) => {
          const status = getRequirementStatus(requirement);
          const sourceRefs = uniqueSourceRefs(requirement.sourceRefs);

          return (
            <div key={requirement.id} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className={cn('shrink-0 text-xs', getEvidenceStatusClassName(status))}>
                  {getEvidenceStatusLabel(status)}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{requirement.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {requirement.acquiredCredits}/{requirement.requiredCredits}학점
                    {requirement.missingCredits > 0 ? `, ${requirement.missingCredits}학점 부족` : ''}
                  </p>
                  {sourceRefs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sourceRefs.map((sourceRef) => (
                        <Badge
                          key={sourceRefKey(sourceRef)}
                          variant="outline"
                          title={sourceRef.note}
                          className="border-slate-200 bg-slate-50 font-mono text-[11px] text-slate-600"
                        >
                          {formatSourceRef(sourceRef)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hiddenRequirementCount > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          세부 근거 {hiddenRequirementCount}개는 같은 영역의 추가 요건으로 접어두었습니다.
        </p>
      )}
    </div>
  );
}

function buildSuppressionRows(
  suppressions: RecommendationSuppression[],
  policy?: Required<RecommendationDisplayPolicy>,
) {
  const rows: Array<{ key: string; badge: string; title: string; body: string }> = [];

  if (suppressions.some((suppression) => suppression.reason === 'missing_major_context')) {
    rows.push({
      key: 'missing-major-context',
      badge: '전공 필요',
      title: '전공 추천 보류',
      body: '전공을 선택하면 전공 요건에 맞는 추천을 볼 수 있습니다.',
    });
  }

  if (suppressions.some((suppression) => suppression.reason === 'missing_minor_context')) {
    rows.push({
      key: 'missing-minor-context',
      badge: '부전공 필요',
      title: '부전공 추천 보류',
      body: '부전공을 선택하면 부전공 요건에 맞는 추천을 볼 수 있습니다.',
    });
  }

  const hiddenCount = suppressions
    .filter((suppression) => suppression.reason === 'display_cap')
    .reduce((sum, suppression) => sum + (suppression.suppressedCount ?? 1), 0);

  if (hiddenCount > 0) {
    const capText = policy
      ? `현재 영역별 최대 ${policy.maxPerCategory}개, 넓은 요건은 최대 ${policy.maxPerBroadRequirement}개만 보여줍니다.`
      : '현재 대표 후보만 보여줍니다.';

    rows.push({
      key: 'display-cap',
      badge: '정리됨',
      title: '대표 후보만 표시',
      body: `후보가 많아 ${hiddenCount}개는 숨겼습니다. ${capText}`,
    });
  }

  return rows;
}

function RecommendedCoursesSection({
  courses,
  allCourses,
  suppressions,
  policy,
}: {
  courses: RecommendedCourse[];
  allCourses?: RecommendedCourse[];
  suppressions?: RecommendationSuppression[];
  policy?: Required<RecommendationDisplayPolicy>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [allPanelOpen, setAllPanelOpen] = useState(false);
  const [allPanelQuery, setAllPanelQuery] = useState('');
  const rows = buildSuppressionRows(suppressions ?? [], policy);
  const hasMore = courses.length > INITIAL_SHOW_COUNT;
  const displayedCourses = expanded ? courses : courses.slice(0, INITIAL_SHOW_COUNT);
  const allRecommendationCourses = allCourses && allCourses.length > 0 ? allCourses : courses;
  const normalizedQuery = allPanelQuery.trim().toLowerCase();
  const filteredRecommendationCourses = normalizedQuery
    ? allRecommendationCourses.filter((course) =>
        [course.courseCode, course.courseName, course.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      )
    : allRecommendationCourses;
  const allRecommendationGroups = groupRecommendedCoursesByReason(filteredRecommendationCourses);
  const recommendationCountLabel = getRecommendationCountLabel(courses.length, allRecommendationCourses.length);
  const shouldShowSearch = allRecommendationCourses.length >= SEARCH_THRESHOLD;

  return (
    <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm font-semibold text-blue-800">
          <Library size={16} className="shrink-0" />
          <span className="shrink-0">추천 과목</span>
          {recommendationCountLabel && (
            <span className="text-xs font-normal text-blue-600">({recommendationCountLabel})</span>
          )}
        </h4>

        {allRecommendationCourses.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-controls="all-recommendations-panel"
            aria-expanded={allPanelOpen}
            className="h-8 shrink-0 border-blue-200 bg-white px-2.5 text-xs text-blue-700 hover:bg-blue-100 hover:text-blue-900"
            onClick={() => {
              setAllPanelQuery('');
              setAllPanelOpen(true);
            }}
          >
            <PanelLeftOpen size={14} className="mr-1" />
            전체 보기
            <span className="ml-1 text-blue-500">{allRecommendationCourses.length}</span>
          </Button>
        )}
      </div>

      {allPanelOpen && (
        <aside
          id="all-recommendations-panel"
          data-testid="all-recommendations-panel"
          role="dialog"
          aria-labelledby="all-recommendations-panel-title"
          className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-xl animate-in slide-in-from-right duration-300 overscroll-contain sm:max-w-xl lg:right-[32rem] lg:z-[-1] lg:w-[min(36rem,calc(100vw-32rem))] lg:max-w-none"
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="border-b border-gray-50 pb-4 pr-9">
            <h3 id="all-recommendations-panel-title" className="text-xl font-semibold text-gray-900">
              전체 추천 과목
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {`대표 ${courses.length}개를 먼저 보여주고, 전체 후보 ${allRecommendationCourses.length}개를 아래에 모았습니다.`}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="전체 추천 과목 닫기"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-500 hover:bg-slate-100 hover:text-gray-900"
            onClick={() => setAllPanelOpen(false)}
          >
            <X size={16} />
          </Button>

          {shouldShowSearch && (
            <div className="relative mt-4">
              <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                aria-label="전체 추천 과목 검색"
                value={allPanelQuery}
                onChange={(event) => setAllPanelQuery(event.target.value)}
                placeholder="과목명 또는 코드 검색"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                {normalizedQuery
                  ? `${filteredRecommendationCourses.length}개가 검색 조건에 맞습니다.`
                  : `${allRecommendationCourses.length}개 후보를 요건별로 묶어 표시합니다.`}
              </p>
            </div>
          )}

          <div className="mt-4 space-y-5 pb-6">
            {allRecommendationGroups.length > 0 ? (
              allRecommendationGroups.map((group) => (
                <section key={group.reason}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h5 className="min-w-0 truncate text-sm font-semibold text-gray-800">{group.reason}</h5>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {group.courses.length}개
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {group.courses.map((course) => (
                      <div key={`${group.reason}-${course.courseCode}`} className="rounded-md border border-slate-200 bg-white px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">{course.courseName}</p>
                            <p className="mt-0.5 font-mono text-xs text-gray-500">{course.courseCode}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0 bg-blue-100 text-xs font-semibold text-blue-700">
                            {course.credit}학점
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-gray-700">검색 결과가 없습니다.</p>
                <p className="mt-1 text-xs text-gray-500">다른 과목명이나 코드로 다시 검색해보세요.</p>
              </div>
            )}
          </div>
        </aside>
      )}

      {displayedCourses.length > 0 && (
        <div className="space-y-2">
          {displayedCourses.map((course) => (
            <div
              key={course.courseCode}
              className="flex items-center justify-between rounded-md border border-slate-300 bg-white p-3 transition-colors hover:bg-gray-100/50"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{course.courseName}</span>
                <div className="mt-0.5 font-mono text-xs text-gray-500">{course.courseCode}</div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-xs font-semibold text-blue-700">
                {course.credit}학점
              </Badge>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className={cn('space-y-2', displayedCourses.length > 0 && 'mt-3 border-t border-blue-100 pt-3')}>
          {rows.map((row) => (
            <div key={row.key} className="rounded-md border border-blue-100 bg-white p-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 border-blue-200 bg-blue-100 text-xs text-blue-700">
                  {row.badge}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-950">{row.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-700">{row.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-blue-600 hover:bg-blue-100 hover:text-blue-800"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp size={16} className="mr-1" />
              접기
            </>
          ) : (
            <>
              <ChevronDown size={16} className="mr-1" />
              더보기 ({courses.length - INITIAL_SHOW_COUNT}개)
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function RequirementsList({ requirements, className, onResolveNeedsReview }: RequirementsListProps) {
  return (
    <>
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
        <span className="text-xl">📋</span> 영역별 이수 현황
      </h2>

      {/* Grid Card Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requirements.map((req) => {
          return (
            <Sheet key={req.domain}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    'group relative rounded-xl border p-4 text-left transition-all duration-200',
                    'bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md',
                    'focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none',
                    'border-slate-300',
                  )}
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {req.satisfied ? (
                        <CircleCheck size={20} className="text-emerald-600" />
                      ) : (
                        <AlertTriangle size={20} className="text-amber-500" />
                      )}
                      <span className="font-bold text-gray-900">{req.domain}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full border-none px-2 py-0.5 text-xs font-bold',
                        req.satisfied
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200',
                      )}
                    >
                      {req.percentage}%
                    </Badge>
                  </div>

                  {/* Credit Stats (Replacing Progress Bar) */}
                  <div className="flex items-end gap-1.5 py-2">
                    <span className="text-3xl leading-none font-extrabold text-gray-900">{req.earned}</span>
                    <span className="mb-0.5 text-sm font-medium text-gray-500">/ {req.required} 학점</span>
                  </div>
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader className="border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2">
                    {req.satisfied ? (
                      <CircleCheck size={24} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={24} className="text-amber-500" />
                    )}
                    <SheetTitle className="text-xl">{req.domain}</SheetTitle>
                  </div>

                  <SheetDescription asChild>
                    <div className="mt-2">
                      <div className="flex items-end justify-between">
                        {/* Credit Stats */}
                        <div className="flex items-end gap-1.5">
                          <span className="text-4xl leading-none font-extrabold text-gray-900">{req.earned}</span>
                          <span className="mb-1 text-sm font-medium text-gray-500">/ {req.required} 학점</span>
                        </div>

                        {/* Badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            'mb-1 rounded-full border-none px-2 py-0.5 text-xs font-bold',
                            req.satisfied ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600',
                          )}
                        >
                          {req.percentage}%
                        </Badge>
                      </div>
                      {/* Progress Bar (Restored for Sheet View) */}
                      <Progress value={req.percentage} className="mt-4 h-2 bg-gray-100" />
                    </div>
                  </SheetDescription>
                </SheetHeader>

                <ScrollArea className="-mx-6 mt-4 h-[calc(100vh-200px)] px-6">
                  {/* Warning Messages - 중복 필터링 (미충족/충족됨 메시지 제외) */}
                  {!req.satisfied &&
                    req.messages.length > 0 &&
                    (() => {
                      // 중복되는 "미충족 —" 또는 "충족됨 —" 메시지 필터링
                      const filteredMessages = req.messages.filter(
                        (msg) =>
                          !msg.startsWith('미충족 —') &&
                          !msg.startsWith('충족됨 —') &&
                          !msg.includes('필수 이수학점이 없는'),
                      );
                      if (filteredMessages.length === 0) return null;
                      return (
                        <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4">
                          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                            <AlertTriangle size={16} />
                            미충족 사항
                          </h4>
                          <ul className="space-y-1.5">
                            {filteredMessages.map((msg) => (
                              <li key={msg} className="flex items-start gap-2 text-sm text-amber-700">
                                <span className="mt-1 text-amber-400">•</span>
                                {msg}
                              </li>
                            ))}
                          </ul>
                          {req.hasNeedsReview && onResolveNeedsReview ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-3 border-amber-200 bg-white text-amber-800 hover:bg-amber-100"
                              onClick={onResolveNeedsReview}
                            >
                              선언 학기 입력하기
                            </Button>
                          ) : null}
                        </div>
                      );
                    })()}

                  <RequirementEvidenceSection
                    requirements={req.appliedRequirements}
                    needsContext={req.catalogNeedsContext}
                  />

                  {/* Recommended Courses Section with Show More */}
                  {!req.satisfied &&
                    ((req.recommendedCourses?.length ?? 0) > 0 ||
                      (req.recommendationSuppressions?.length ?? 0) > 0) && (
                      <RecommendedCoursesSection
                        courses={req.recommendedCourses ?? []}
                        allCourses={req.allRecommendedCourses}
                        suppressions={req.recommendationSuppressions}
                        policy={req.recommendationPolicy}
                      />
                    )}

                  {req.excludedCourses && req.excludedCourses.length > 0 && (
                    <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-900">
                        <AlertTriangle size={16} />
                        인정 제외 과목
                        <span className="text-xs font-normal text-orange-700">({req.excludedCourses.length}개)</span>
                      </h4>
                      <div className="space-y-2">
                        {req.excludedCourses.map((course, idx) => (
                          <div
                            key={`${course.courseCode}-${course.year}-${course.semester}-${idx}`}
                            className="rounded-md border border-orange-200 bg-white p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-gray-900">
                                  {course.courseName ?? '-'}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  <span className="font-mono">{course.courseCode ?? '-'}</span>
                                  <span>
                                    {course.year?.toString().slice(2) ?? '-'}-
                                    {course.semester?.toString().replace('학기', '') ?? '-'}
                                  </span>
                                  <span>{course.credit ?? 0}학점</span>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-orange-800">{course.reason}</p>
                              </div>
                              <Badge variant="outline" className="shrink-0 border-orange-200 bg-orange-100 text-orange-800">
                                제외
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course List */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-700">이수 과목</h4>
                      <Badge variant="secondary" className="text-xs">
                        {req.courses.length}
                      </Badge>
                    </div>

                    {req.courses.length > 0 ? (
                      <div className="space-y-2">
                        {req.courses.map((course, idx) => (
                          <div
                            key={`${course.courseCode}-${idx}`}
                            className="rounded-lg border border-slate-300 bg-white p-3 transition-colors hover:bg-gray-100"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{course.courseName ?? '-'}</span>
                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                  <span className="font-mono">{course.courseCode ?? '-'}</span>
                                  <span>
                                    {course.year?.toString().slice(2) ?? '-'}-
                                    {course.semester?.toString().replace('학기', '') ?? '-'}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-xs font-semibold text-blue-700">
                                {course.credit ?? 0}학점
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                        <p className="text-sm text-gray-500">아직 이수한 과목이 없습니다.</p>
                        <p className="mt-1 text-xs text-gray-400">성적표를 업로드하면 자동으로 반영됩니다.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          );
        })}
      </div>
    </>
  );
}
