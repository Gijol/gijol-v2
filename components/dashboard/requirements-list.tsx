'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CircleCheck,
  Library,
  ChevronDown,
  ChevronUp,
  PanelLeftOpen,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Progress } from '@components/ui/progress';
import { Badge } from '@components/ui/badge';
import { ScrollArea } from '@components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@components/ui/sheet';
import { Button } from '@components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { cn } from '@/lib/utils';
import type { RecommendedCourse } from '@/lib/types/recommended-course';
import type { CatalogNeedsContextSummary } from '@features/graduation/domain/types';
import type {
  FineGrainedRequirement,
  RequirementEvaluationStatus,
  RequirementSource,
} from '@lib/types/grad-requirements';
import type { RecommendationDisplayPolicy, RecommendationSuppression } from '@features/graduation/data';

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

function normalizeRequirementMessage(message: string): string {
  return message.trim().replace(/\s*-\s*확인 필요\s*$/, '');
}

function getRequirementDisplayLabel(requirement: FineGrainedRequirement): string {
  return requirement.label.replace(
    /\s*\(\s*\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?학점(?:\s*,\s*\d+(?:\.\d+)?학점 부족)?\s*\)\s*$/,
    '',
  );
}

function getNonRedundantRequirementHint(requirement: FineGrainedRequirement): string | null {
  const hint = requirement.hint?.trim();
  if (!hint) return null;

  const repeatsMissingCredits =
    requirement.missingCredits > 0 &&
    hint.includes(`${requirement.missingCredits}학점`) &&
    /(부족|더 필요|필요합니다)/.test(hint);

  return repeatsMissingCredits ? null : hint;
}

function getSupplementalRequirementMessages(
  messages: readonly string[],
  requirements: readonly FineGrainedRequirement[],
  needsContext: readonly CatalogNeedsContextSummary[],
): string[] {
  const representedLabels = new Set(
    [
      ...requirements.map((requirement) => requirement.label),
      ...needsContext.map((item) => item.rule.label ?? item.rule.id),
    ].map(normalizeRequirementMessage),
  );

  return Array.from(
    new Set(
      messages
        .map((message) => message.trim())
        .filter(Boolean)
        .filter(
          (message) =>
            !message.startsWith('미충족 —') &&
            !message.startsWith('충족됨 —') &&
            !message.includes('필수 이수학점이 없는'),
        )
        .filter((message) => !representedLabels.has(normalizeRequirementMessage(message))),
    ),
  );
}

function RequirementEvidenceSection({
  requirements,
  needsContext,
  messages,
  onResolveNeedsReview,
}: {
  requirements?: FineGrainedRequirement[];
  needsContext?: CatalogNeedsContextSummary[];
  messages?: string[];
  onResolveNeedsReview?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const requirementRows = (requirements ?? []).filter(
    (requirement) => (requirement.sourceRefs?.length ?? 0) > 0 || getRequirementStatus(requirement) !== 'satisfied',
  );
  const contextRows = needsContext ?? [];
  const supplementalMessages = getSupplementalRequirementMessages(messages ?? [], requirements ?? [], contextRows);
  const hasEvidence = requirementRows.length > 0 || contextRows.length > 0 || supplementalMessages.length > 0;

  if (!hasEvidence) return null;

  const visibleRequirements = expanded ? requirementRows : requirementRows.slice(0, MAX_EVIDENCE_ROWS);
  const hiddenRequirementCount = Math.max(0, requirementRows.length - MAX_EVIDENCE_ROWS);

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Library size={16} />
          요건 판정
        </h4>
        <p className="mt-1 text-xs text-slate-500">미충족 사항과 적용 근거를 한 표에서 확인할 수 있습니다.</p>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="요건 판정 및 적용 근거" className="min-w-[620px] table-fixed">
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[92px] px-3">상태</TableHead>
              <TableHead className="w-[230px] px-3">요건</TableHead>
              <TableHead className="w-[130px] px-3">이수 현황</TableHead>
              <TableHead className="px-3">적용 근거</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contextRows.map((item) => {
              const sourceRefs = uniqueSourceRefs(item.rule.sourceRefs);
              const label = item.rule.label ?? item.rule.id;

              return (
                <TableRow key={`needs-context-${item.rule.id}`} className="bg-amber-50/40 align-top">
                  <TableCell className="px-3 py-3">
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-xs text-amber-800">
                      검토 필요
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                      {formatMissingContext(item.missingContext)}
                    </p>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-xs text-slate-600">정보 입력 필요</TableCell>
                  <TableCell className="px-3 py-3">
                    <SourceReferenceBadges sourceRefs={sourceRefs} />
                  </TableCell>
                </TableRow>
              );
            })}

            {visibleRequirements.map((requirement) => {
              const status = getRequirementStatus(requirement);
              const sourceRefs = uniqueSourceRefs(requirement.sourceRefs);
              const displayLabel = getRequirementDisplayLabel(requirement);
              const displayHint = getNonRedundantRequirementHint(requirement);

              return (
                <TableRow key={requirement.id} className="align-top">
                  <TableCell className="px-3 py-3">
                    <Badge variant="outline" className={cn('text-xs', getEvidenceStatusClassName(status))}>
                      {getEvidenceStatusLabel(status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <p className="text-sm leading-snug font-medium text-slate-900">{displayLabel}</p>
                    {displayHint && <p className="mt-1 text-xs leading-relaxed text-slate-500">{displayHint}</p>}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-xs text-slate-600">
                    <p className={cn('font-medium text-slate-800', requirement.missingCredits > 0 && 'text-amber-700')}>
                      {requirement.acquiredCredits}/{requirement.requiredCredits}학점
                      {requirement.missingCredits > 0 ? `, ${requirement.missingCredits}학점 부족` : ''}
                    </p>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <SourceReferenceBadges sourceRefs={sourceRefs} />
                  </TableCell>
                </TableRow>
              );
            })}

            {supplementalMessages.map((message) => (
              <TableRow key={`supplemental-${message}`} className="bg-amber-50/40 align-top">
                <TableCell className="px-3 py-3">
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-xs text-amber-800">
                    안내
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 text-sm font-medium text-slate-900">추가 확인 사항</TableCell>
                <TableCell className="px-3 py-3 text-xs leading-relaxed text-amber-800" colSpan={2}>
                  {message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hiddenRequirementCount > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? (
              <>
                <ChevronUp size={14} className="mr-1" />
                세부 요건 접기
              </>
            ) : (
              <>
                <ChevronDown size={14} className="mr-1" />
                세부 요건 {hiddenRequirementCount}개 더 보기
              </>
            )}
          </Button>
        </div>
      )}

      {contextRows.length > 0 && onResolveNeedsReview && (
        <div className="border-t border-amber-100 bg-amber-50 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-200 bg-white text-amber-800 hover:bg-amber-100"
            onClick={onResolveNeedsReview}
          >
            선언 학기 입력하기
          </Button>
        </div>
      )}
    </section>
  );
}

function SourceReferenceBadges({ sourceRefs }: { sourceRefs: readonly RequirementSource[] }) {
  if (sourceRefs.length === 0) return <span className="text-xs text-slate-400">별도 근거 없음</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
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
    <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200">
            <Sparkles aria-hidden="true" size={17} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-sm font-semibold text-slate-950">추천 과목</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">남은 요건을 채우는 데 도움이 되는 과목입니다.</p>
            {recommendationCountLabel && (
              <p className="mt-1.5 text-xs font-medium text-blue-700">{recommendationCountLabel}</p>
            )}
          </div>
        </div>

        {allRecommendationCourses.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-controls="all-recommendations-panel"
            aria-expanded={allPanelOpen}
            className="h-10 shrink-0 touch-manipulation border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
            onClick={() => {
              setAllPanelQuery('');
              setAllPanelOpen(true);
            }}
          >
            <PanelLeftOpen aria-hidden="true" size={14} className="mr-1" />
            전체 보기
            <span className="ml-1 text-blue-500 tabular-nums">{allRecommendationCourses.length}</span>
          </Button>
        )}
      </div>

      {allPanelOpen && (
        <aside
          id="all-recommendations-panel"
          data-testid="all-recommendations-panel"
          role="dialog"
          aria-labelledby="all-recommendations-panel-title"
          className="animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 w-full overflow-y-auto overscroll-contain border-l border-slate-200 bg-white p-4 shadow-xl duration-200 motion-reduce:animate-none sm:max-w-xl sm:p-6 lg:right-full lg:z-[-1] lg:w-[min(36rem,calc(100vw-100%))] lg:max-w-none"
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="border-b border-gray-50 pr-9 pb-4">
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
            className="absolute top-3 right-3 h-10 w-10 touch-manipulation p-0 text-gray-500 hover:bg-slate-100 hover:text-gray-900 sm:top-4 sm:right-4"
            onClick={() => setAllPanelOpen(false)}
          >
            <X aria-hidden="true" size={16} />
          </Button>

          {shouldShowSearch && (
            <div className="relative mt-4">
              <Search
                aria-hidden="true"
                size={15}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                aria-label="전체 추천 과목 검색"
                name="recommendation-search"
                autoComplete="off"
                value={allPanelQuery}
                onChange={(event) => setAllPanelQuery(event.target.value)}
                placeholder="과목명 또는 코드 검색…"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              />
              <p aria-live="polite" className="mt-2 text-xs text-gray-500">
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
                    <h4 className="min-w-0 truncate text-sm font-semibold text-gray-800">{group.reason}</h4>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {group.courses.length}개
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {group.courses.map((course) => (
                      <div
                        key={`${group.reason}-${course.courseCode}`}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">{course.courseName}</p>
                            <p className="mt-0.5 font-mono text-xs text-gray-500">{course.courseCode}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-blue-100 text-xs font-semibold text-blue-700"
                          >
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

      <div className="p-4">
        {displayedCourses.length > 0 && (
          <ul id="recommended-course-list" className="space-y-2">
            {displayedCourses.map((course) => (
              <li
                key={course.courseCode}
                className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold break-words text-slate-900">{course.courseName}</p>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span className="font-mono">{course.courseCode}</span>
                    {course.category && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="min-w-0 break-words">{course.category}</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 bg-blue-100 text-xs font-semibold text-blue-700">
                  {course.credit}학점
                </Badge>
              </li>
            ))}
          </ul>
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
            type="button"
            variant="ghost"
            size="sm"
            aria-controls="recommended-course-list"
            aria-expanded={expanded}
            className="mt-3 h-10 w-full touch-manipulation text-blue-700 hover:bg-blue-50 hover:text-blue-900"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp aria-hidden="true" size={16} className="mr-1" />
                접기
              </>
            ) : (
              <>
                <ChevronDown aria-hidden="true" size={16} className="mr-1" />
                더보기 ({courses.length - INITIAL_SHOW_COUNT}개)
              </>
            )}
          </Button>
        )}
      </div>
    </section>
  );
}

export function RequirementsList({ requirements, className, onResolveNeedsReview }: RequirementsListProps) {
  return (
    <section className={className} aria-labelledby="requirements-list-title">
      <div className="mb-5">
        <h2 id="requirements-list-title" className="text-lg font-semibold text-slate-950 dark:text-slate-50">
          영역별 이수 현황
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          각 영역을 선택하면 인정 과목과 남은 요건을 확인할 수 있습니다.
        </p>
      </div>

      {/* Grid Card Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requirements.map((req) => {
          return (
            <Sheet key={req.domain}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={`${req.domain}: ${req.earned}/${req.required}학점, ${req.percentage}%`}
                  className={cn(
                    'group relative min-w-0 touch-manipulation rounded-xl border border-slate-200 bg-white p-4 text-left',
                    'transition-[transform,background-color,border-color] duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]',
                    'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-colors motion-reduce:active:scale-100',
                    'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900',
                  )}
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {req.satisfied ? (
                        <CircleCheck aria-hidden="true" size={20} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle aria-hidden="true" size={20} className="text-amber-600 dark:text-amber-400" />
                      )}
                      <span className="font-semibold text-slate-950 dark:text-slate-50">{req.domain}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full border-none px-2 py-0.5 text-xs font-semibold',
                        req.satisfied
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-300',
                      )}
                    >
                      {req.satisfied ? '충족' : '확인 필요'}
                    </Badge>
                  </div>

                  <div className="flex items-end justify-between gap-3 py-2">
                    <div className="flex items-end gap-1.5">
                      <span className="text-3xl leading-none font-bold text-slate-950 tabular-nums dark:text-slate-50">
                        {req.earned}
                      </span>
                      <span className="mb-0.5 text-sm font-medium text-slate-500 tabular-nums dark:text-slate-400">
                        / {req.required} 학점
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 tabular-nums dark:text-slate-300">
                      {req.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={req.percentage}
                    className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-600 dark:[&>div]:bg-blue-500"
                  />
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl">
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
                  <RequirementEvidenceSection
                    requirements={req.appliedRequirements}
                    needsContext={req.catalogNeedsContext}
                    messages={req.messages}
                    onResolveNeedsReview={req.hasNeedsReview ? onResolveNeedsReview : undefined}
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
                              <Badge
                                variant="outline"
                                className="shrink-0 border-orange-200 bg-orange-100 text-orange-800"
                              >
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
    </section>
  );
}
