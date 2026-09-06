import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useGraduationStore } from '@/lib/stores/useGraduationStore';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { useTimetablePlanStore } from '@/lib/stores/timetable-plan.store';
import type { TimetableSourceManifestEntry } from '@/features/course-catalog/timetable-sources';
import { formatCourseTerm } from '@/features/course-catalog/offering-view';
import type { TimetablePlanAlternative, TimetableSectionInfoStatus } from '@/lib/types/timetable-plan';
import type { TakenCourseType } from '@/lib/types/grad';
import type { SectionOffering, SelectedSection } from '@/lib/types/timetable';
import { normalizeCourseCode } from '@/features/course-catalog/normalize';
import { createSectionKey } from '@/features/timetable/plan-model';
import { getNextColor } from '@/features/timetable/selectors';
import { fetchTimetableSectionsByCourseCodes } from '@/features/timetable/hooks/useTimetableSectionBrowser';
import { cn } from '@/lib/utils';
import { DashboardPageShell, PageHeader } from '@/components/dashboard/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  CopyPlus,
  FolderClock,
  History,
  Loader2,
  Monitor,
  Plus,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';

interface TimetableHomeProps {
  defaultTerm: string;
  timetableSources: readonly TimetableSourceManifestEntry[];
}

interface CompletedTermSummary {
  key: string;
  term: string | null;
  label: string;
  year: number;
  semester: string;
  count: number;
  credits: number;
  courses: TakenCourseType[];
  source?: TimetableSourceManifestEntry;
}

interface CompletedImportState {
  termKey: string;
  status: 'loading' | 'error';
  message?: string;
}

function getSectionInfoStatus(
  term: string,
  timetableSources: readonly TimetableSourceManifestEntry[],
): TimetableSectionInfoStatus {
  const source = timetableSources.find((entry) => entry.term === term);
  return source && source.count > 0 ? 'available' : 'unpublished';
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function semesterRank(semester: string): number {
  if (semester.includes('봄') || semester === '1' || semester.includes('1학기')) return 1;
  if (semester.includes('여름')) return 2;
  if (semester.includes('가을') || semester === '2' || semester.includes('2학기')) return 3;
  if (semester.includes('겨울')) return 4;
  return 0;
}

function resolveTakenCourseTerm(course: TakenCourseType): string | null {
  const semester = String(course.semester ?? '');
  if (semester.includes('봄') || semester === '1' || semester.includes('1학기')) return `${course.year}-1`;
  if (semester.includes('가을') || semester === '2' || semester.includes('2학기')) return `${course.year}-2`;
  return null;
}

function getSelectedSectionCount(plan: TimetablePlanAlternative): number {
  return plan.candidates.filter((candidate) => candidate.selectedSection).length;
}

function getPlanCredits(plan: TimetablePlanAlternative): number {
  return plan.candidates.reduce((sum, candidate) => {
    const selectedCredits = candidate.selectedSection?.snapshot.hours?.credits;
    return sum + (selectedCredits ?? candidate.credits ?? 0);
  }, 0);
}

export function TimetableHome({ defaultTerm, timetableSources }: TimetableHomeProps) {
  const router = useRouter();
  const takenCourses = useGraduationStore((state) => state.takenCourses);
  const legacySavedTimetables = useTimetableStore((state) => state.savedTimetables);
  const termGroups = useTimetablePlanStore((state) => state.termGroups);
  const plans = useTimetablePlanStore((state) => state.plans);
  const ensureTermGroup = useTimetablePlanStore((state) => state.ensureTermGroup);
  const createPlan = useTimetablePlanStore((state) => state.createPlan);
  const deletePlan = useTimetablePlanStore((state) => state.deletePlan);
  const setRepresentativePlan = useTimetablePlanStore((state) => state.setRepresentativePlan);
  const importLegacyPlan = useTimetablePlanStore((state) => state.importLegacyPlan);

  const [legacyImportName, setLegacyImportName] = useState<string | null>(null);
  const [legacyImportTerm, setLegacyImportTerm] = useState(defaultTerm);
  const [completedImportState, setCompletedImportState] = useState<CompletedImportState | null>(null);

  const currentTerm = defaultTerm || timetableSources[0]?.term || '';
  const currentStatus = getSectionInfoStatus(currentTerm, timetableSources);

  useEffect(() => {
    if (currentTerm) {
      ensureTermGroup(currentTerm, currentStatus);
    }
  }, [currentStatus, currentTerm, ensureTermGroup]);

  const currentGroup = termGroups[currentTerm];
  const currentPlans = useMemo(
    () =>
      (currentGroup?.planIds ?? [])
        .map((planId) => plans[planId])
        .filter((plan): plan is TimetablePlanAlternative => Boolean(plan))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [currentGroup?.planIds, plans],
  );
  const previousPlans = useMemo(
    () =>
      Object.values(plans)
        .filter((plan): plan is TimetablePlanAlternative => Boolean(plan) && plan.term !== currentTerm)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [currentTerm, plans],
  );
  const legacyEntries = useMemo(
    () =>
      Object.entries(legacySavedTimetables)
        .map(([name, value]) => ({ name, ...value }))
        .sort((a, b) => b.savedAt - a.savedAt),
    [legacySavedTimetables],
  );

  const completedTermSummaries = useMemo(() => {
    const sourcesByTerm = new Map(timetableSources.map((source) => [source.term, source]));
    const byTerm = new Map<string, CompletedTermSummary>();

    takenCourses.forEach((course) => {
      const term = resolveTakenCourseTerm(course);
      const key = term ?? `${course.year}-${course.semester}`;
      const source = term ? sourcesByTerm.get(term) : undefined;
      const current = byTerm.get(key) ?? {
        key,
        term,
        source,
        label: source?.label ?? `${course.year} ${course.semester}`,
        year: course.year,
        semester: course.semester,
        count: 0,
        credits: 0,
        courses: [],
      };

      byTerm.set(key, {
        ...current,
        count: current.count + 1,
        credits: current.credits + (Number(course.credit) || 0),
        courses: [...current.courses, course],
      });
    });

    return Array.from(byTerm.values())
      .sort((a, b) => b.year - a.year || semesterRank(b.semester) - semesterRank(a.semester))
      .filter((summary) => summary.count > 0);
  }, [takenCourses, timetableSources]);

  const openPlan = (planId: string) => {
    void router.push(`/dashboard/timetable/${planId}`);
  };

  const createNewPlan = () => {
    const planId = createPlan(currentTerm, currentStatus);
    void router.push(`/dashboard/timetable/${planId}`);
  };

  const createCompletedPlanFromTranscript = async (summary: CompletedTermSummary) => {
    if (!summary.term || !summary.source) {
      setCompletedImportState({
        termKey: summary.key,
        status: 'error',
        message: '이 학기는 시간표 분반 데이터가 없어 생성할 수 없습니다.',
      });
      return;
    }

    setCompletedImportState({ termKey: summary.key, status: 'loading' });

    try {
      const sections = await fetchTimetableSectionsByCourseCodes(
        summary.term,
        summary.courses.map((course) => course.courseCode),
      );
      const sectionsByCode = new Map<string, SectionOffering>();

      sections.forEach((section) => {
        const code = normalizeCourseCode(section.course_code);
        if (code && !sectionsByCode.has(code)) {
          sectionsByCode.set(code, section);
        }
      });

      const usedCodes = new Set<string>();
      const selectedSections: SelectedSection[] = [];

      summary.courses.forEach((course) => {
        const code = normalizeCourseCode(course.courseCode);
        if (!code || usedCodes.has(code)) return;
        const section = sectionsByCode.get(code);
        if (!section) return;

        usedCodes.add(code);
        selectedSections.push({
          id: createSectionKey(section),
          section,
          color: getNextColor(selectedSections.map((selected) => selected.color)),
        });
      });

      if (selectedSections.length === 0) {
        throw new Error('No matching sections found');
      }

      const planId = importLegacyPlan({
        name: `${summary.label} 이전 시간표`,
        term: summary.term,
        selectedSections,
        sectionInfoStatus: 'available',
      });

      setCompletedImportState(null);

      if (selectedSections.length < summary.courses.length) {
        window.alert(
          `${summary.label} 성적표 ${summary.courses.length}과목 중 ${selectedSections.length}과목을 시간표 분반과 매칭했습니다. 분반 정보가 없거나 계절학기/개별연구 과목은 제외될 수 있습니다.`,
        );
      }

      openPlan(planId);
    } catch (error) {
      console.error('Failed to create completed timetable from transcript', error);
      setCompletedImportState({
        termKey: summary.key,
        status: 'error',
        message: '성적표 과목과 해당 학기 시간표 데이터를 매칭하지 못했습니다.',
      });
    }
  };

  const confirmDeletePlan = (plan: TimetablePlanAlternative) => {
    const confirmed = window.confirm(`"${plan.name}" 시간표를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) return;
    deletePlan(plan.id);
  };

  const confirmLegacyImport = () => {
    if (!legacyImportName) return;
    const legacy = legacySavedTimetables[legacyImportName];
    if (!legacy) return;
    const status = getSectionInfoStatus(legacyImportTerm, timetableSources);
    const planId = importLegacyPlan({
      name: legacyImportName,
      term: legacyImportTerm,
      selectedSections: legacy.selectedSections,
      sectionInfoStatus: status,
    });
    setLegacyImportName(null);
    void router.push(`/dashboard/timetable/${planId}`);
  };

  return (
    <DashboardPageShell className="flex min-h-full flex-col gap-10" width="reading">
      <PageHeader
        className="mb-0 border-0 pb-0"
        eyebrow={formatCourseTerm(currentTerm)}
        title="내 시간표"
        description="수업을 담고, 나에게 맞는 한 주를 계획하세요."
        actions={
          <Button onClick={createNewPlan} disabled={!currentTerm} className="h-10 rounded-lg px-4 font-semibold">
            <Plus aria-hidden="true" />새 시간표
          </Button>
        }
      />

      <section aria-labelledby="current-plans-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 id="current-plans-title" className="text-base font-semibold text-slate-900">
              이번 학기 계획
            </h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 tabular-nums">
              {currentPlans.length}
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Monitor aria-hidden="true" size={14} />이 브라우저에 자동 저장
          </p>
        </div>
        {currentStatus === 'unpublished' && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
            아직 강의 정보가 공개되지 않았습니다. 과목 후보를 먼저 담아 계획할 수 있습니다.
          </p>
        )}

        {currentPlans.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-slate-50 px-6 py-12 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <CalendarDays aria-hidden="true" size={23} />
            </span>
            <h3 className="text-base font-semibold text-slate-900">첫 시간표를 만들어 보세요</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              강의를 검색해 담으면 주간표에 바로 표시됩니다.
              <br className="hidden sm:block" /> 여러 계획을 만들어 비교할 수도 있어요.
            </p>
            <Button
              onClick={createNewPlan}
              disabled={!currentTerm}
              variant="outline"
              className="mt-5 rounded-lg border-slate-200 bg-white"
            >
              <Plus aria-hidden="true" size={16} />첫 시간표 만들기
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {currentPlans.map((plan) => {
              const selectedCount = getSelectedSectionCount(plan);
              const creditCount = getPlanCredits(plan);
              const isRepresentativeCard = currentGroup?.representativePlanId === plan.id;

              return (
                <article
                  key={plan.id}
                  className={cn(
                    'flex min-w-0 flex-col rounded-2xl border bg-white p-5 transition-colors',
                    isRepresentativeCard ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200/80',
                  )}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">{formatCourseTerm(plan.term)}</span>
                    {isRepresentativeCard && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <Star aria-hidden="true" size={12} fill="currentColor" />
                        대표 시간표
                      </span>
                    )}
                  </div>
                  <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950" title={plan.name}>
                    <Link
                      href={`/dashboard/timetable/${plan.id}`}
                      className="rounded-sm hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                    >
                      {plan.name}
                    </Link>
                  </h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                    <span>
                      <strong className="font-semibold text-slate-900">{selectedCount}</strong>개 분반 선택
                    </span>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <span>
                      <strong className="font-semibold text-slate-900">{creditCount}</strong>학점 계획
                    </span>
                  </p>
                  <div className="mt-4 flex min-h-14 flex-wrap content-start gap-1.5">
                    {plan.candidates.slice(0, 3).map((candidate) => (
                      <span
                        key={candidate.id}
                        className="max-w-full truncate rounded-md bg-slate-100/80 px-2 py-1 text-xs text-slate-600"
                      >
                        {candidate.selectedSection?.snapshot.title || candidate.title || candidate.courseCode}
                      </span>
                    ))}
                    {plan.candidates.length > 3 && (
                      <span className="px-1 py-1 text-xs text-slate-500">+{plan.candidates.length - 3}과목</span>
                    )}
                    {plan.candidates.length === 0 && (
                      <p className="text-sm text-slate-400">아직 담은 과목이 없습니다.</p>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatDate(plan.updatedAt)} 수정</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant={isRepresentativeCard ? 'default' : 'outline'}
                      className="h-9 flex-1 rounded-lg border-slate-200 shadow-none"
                    >
                      <Link href={`/dashboard/timetable/${plan.id}`} passHref>
                        이어서 편집
                        <ChevronRight aria-hidden="true" size={14} />
                      </Link>
                    </Button>
                    {!isRepresentativeCard && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-slate-500"
                        onClick={() => setRepresentativePlan(currentTerm, plan.id)}
                        aria-label={`${plan.name} 대표 시간표로 지정`}
                      >
                        <Star aria-hidden="true" size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => confirmDeletePlan(plan)}
                      aria-label={`${plan.name} 삭제`}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-slate-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
              <History aria-hidden="true" size={19} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-950">지난 시간표</h2>
              <p className="mt-2 max-w-2xl text-sm leading-5 text-pretty text-slate-500">
                저장된 이전 계획을 열거나, 성적표 과목으로 지난 학기 계획을 시작하세요. 분반은 직접 확인해야 합니다.
              </p>
            </div>
          </div>
          <Button variant="outline" className="h-9 shrink-0 font-bold" asChild>
            <Link href="/dashboard/graduation/upload" passHref>
              <Upload aria-hidden="true" size={15} />
              성적표 업로드
            </Link>
          </Button>
        </div>

        {previousPlans.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">생성된 이전 시간표</h3>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {previousPlans.map((plan) => (
                <div key={plan.id} className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <CalendarDays aria-hidden="true" size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">{plan.name}</div>
                    <div className="mt-0.5 text-xs font-medium text-slate-400">
                      {formatCourseTerm(plan.term)} · {getSelectedSectionCount(plan)}개 분반
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 text-xs font-bold"
                    onClick={() => openPlan(plan.id)}
                  >
                    열기
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-slate-300 hover:bg-red-50 hover:text-red-500"
                    onClick={() => confirmDeletePlan(plan)}
                    aria-label={`${plan.name} 삭제`}
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">성적표에서 생성</h3>
          {completedTermSummaries.length === 0 ? (
            <div className="rounded-xl bg-white/80 p-5">
              <p className="text-sm font-semibold text-slate-600">업로드된 성적표 과목이 없습니다.</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                성적표를 업로드하면 학기별 이전 시간표를 만들 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {completedTermSummaries.map((summary) => {
                const isLoading =
                  completedImportState?.termKey === summary.key && completedImportState.status === 'loading';
                const errorMessage =
                  completedImportState?.termKey === summary.key && completedImportState.status === 'error'
                    ? completedImportState.message
                    : null;

                return (
                  <div key={summary.key} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{summary.label}</div>
                        <div className="mt-0.5 text-xs font-medium text-slate-500">
                          {summary.count}과목 · {summary.credits}학점
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 bg-white text-slate-500">
                        {summary.source ? '분반 데이터 있음' : '분반 데이터 없음'}
                      </Badge>
                    </div>
                    {errorMessage && (
                      <div
                        className="mt-2 flex items-start gap-1.5 text-xs font-medium text-red-600"
                        role="status"
                        aria-live="polite"
                      >
                        <AlertCircle aria-hidden="true" size={13} className="mt-0.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8 w-full text-xs font-bold"
                      disabled={!summary.source || isLoading}
                      onClick={() => {
                        void createCompletedPlanFromTranscript(summary);
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 aria-hidden="true" size={14} className="animate-spin motion-reduce:animate-none" />
                          생성 중…
                        </>
                      ) : (
                        <>
                          <CopyPlus aria-hidden="true" size={14} />
                          이전 시간표 생성
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {legacyEntries.length > 0 && (
        <section className="rounded-2xl bg-slate-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <FolderClock aria-hidden="true" size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold tracking-tight text-slate-950">학기 미상 기존 계획</h2>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            기존 저장 시간표는 학기 정보가 없어 열 때 계획 대상 학기를 지정합니다.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {legacyEntries.map((entry) => (
              <div
                key={entry.name}
                className="flex flex-col gap-3 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{entry.name}</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-400">
                    {entry.selectedSections.length}개 분반 · {formatDate(entry.savedAt)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 text-xs font-bold"
                  onClick={() => {
                    setLegacyImportName(entry.name);
                    setLegacyImportTerm(currentTerm);
                  }}
                >
                  <CopyPlus aria-hidden="true" size={14} />
                  가져오기
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
      <Dialog open={legacyImportName !== null} onOpenChange={(open) => !open && setLegacyImportName(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">계획 대상 학기 지정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-500">
              기존 저장 시간표를 새 계획 대안으로 가져오려면 먼저 학기를 지정해야 합니다.
            </p>
            <Select value={legacyImportTerm} onValueChange={setLegacyImportTerm}>
              <SelectTrigger className="h-10 font-bold" aria-label="기존 시간표 가져오기 대상 학기">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timetableSources.map((source) => (
                  <SelectItem key={source.term} value={source.term}>
                    {source.label || formatCourseTerm(source.term)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="font-bold" onClick={() => setLegacyImportName(null)}>
                취소
              </Button>
              <Button className="bg-blue-600 font-bold hover:bg-blue-700" onClick={confirmLegacyImport}>
                가져오기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}
