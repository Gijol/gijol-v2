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
  FilePlus2,
  FolderClock,
  History,
  Loader2,
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
    <DashboardPageShell className="flex min-h-full flex-col gap-6">
      <PageHeader
        eyebrow="시간표"
        title="이번 학기, 더 좋은 시간표를 만드세요"
        description="여러 계획을 비교하고 대표 시간표를 정해 두세요. 성적표가 있다면 지난 학기 시간표도 다시 만들 수 있습니다."
        actions={
          <Button onClick={createNewPlan} className="h-10 px-4 font-semibold">
            <Plus aria-hidden="true" />새 시간표 만들기
          </Button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CalendarDays aria-hidden="true" size={17} />
              </span>
              <h2 className="truncate text-lg font-bold tracking-[-0.02em] text-slate-950">
                {formatCourseTerm(currentTerm)} 계획
              </h2>
            </div>
            <p className="mt-2 pl-10 text-sm text-slate-500">
              계획을 여러 개 만든 뒤 가장 마음에 드는 안을 대표로 지정하세요.
            </p>
          </div>
          {currentStatus === 'unpublished' && (
            <Badge className="w-fit bg-amber-50 text-amber-700 shadow-none hover:bg-amber-50">강의 정보 미공개</Badge>
          )}
        </div>

        <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={createNewPlan}
            className="group flex min-h-[204px] flex-col justify-between rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-5 text-left transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-ui-out)] hover:border-blue-400 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] motion-reduce:transition-colors motion-reduce:active:scale-100"
            aria-label={`${formatCourseTerm(currentTerm)} 새 시간표 만들기`}
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-sm transition-[border-color,transform] duration-150 ease-[var(--ease-ui-out)] group-hover:translate-x-0.5 group-hover:border-blue-200 motion-reduce:transform-none">
                <FilePlus2 aria-hidden="true" size={20} />
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight text-slate-950">새 계획 시작하기</h3>
              <p className="mt-2 text-sm leading-5 text-slate-500">빈 시간표에서 강의를 검색하고 바로 배치합니다.</p>
            </div>
            <span className="inline-flex items-center text-xs font-semibold text-blue-600">
              시간표 만들기
              <ChevronRight aria-hidden="true" size={14} className="ml-1" />
            </span>
          </button>

          {currentPlans.map((plan) => {
            const selectedCount = getSelectedSectionCount(plan);
            const creditCount = getPlanCredits(plan);
            const isRepresentativeCard = currentGroup?.representativePlanId === plan.id;

            return (
              <article
                key={plan.id}
                className="group relative flex min-h-[204px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 ease-[var(--ease-ui-out)] hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] motion-reduce:transform-none"
              >
                <div
                  className={cn('absolute inset-x-0 top-0 h-0.5 bg-slate-200', isRepresentativeCard && 'bg-amber-400')}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <CalendarDays aria-hidden="true" size={20} />
                  </div>
                  {isRepresentativeCard && (
                    <Badge className="shrink-0 gap-1 bg-blue-600">
                      <Star aria-hidden="true" size={12} fill="currentColor" />
                      대표
                    </Badge>
                  )}
                </div>

                <div className="mt-4 min-w-0">
                  <h3 className="truncate text-base font-semibold tracking-tight text-slate-950" title={plan.name}>
                    {plan.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-slate-400">{formatDate(plan.updatedAt)}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-slate-50 px-3 py-2">
                    <div className="font-semibold text-slate-950">{selectedCount}개</div>
                    <div className="mt-0.5 font-medium text-slate-500">선택 분반</div>
                  </div>
                  <div className="rounded-md bg-slate-50 px-3 py-2">
                    <div className="font-semibold text-slate-950">{creditCount}학점</div>
                    <div className="mt-0.5 font-medium text-slate-500">계획 학점</div>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <Button
                    size="sm"
                    className="h-9 flex-1 bg-blue-600 text-xs font-bold hover:bg-blue-700"
                    onClick={() => openPlan(plan.id)}
                  >
                    열기
                    <ChevronRight aria-hidden="true" size={14} className="ml-1" />
                  </Button>
                  {!isRepresentativeCard && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setRepresentativePlan(currentTerm, plan.id)}
                      aria-label={`${plan.name} 대표 시간표로 지정`}
                    >
                      <Star aria-hidden="true" size={15} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-slate-300 hover:bg-red-50 hover:text-red-500"
                    onClick={() => confirmDeletePlan(plan)}
                    aria-label={`${plan.name} 삭제`}
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </Button>
                </div>
              </article>
            );
          })}

          {currentPlans.length === 0 && (
            <div className="flex min-h-[204px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center md:col-span-1 xl:col-span-2">
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-slate-700">아직 만든 계획이 없습니다</p>
                <p className="mt-1 text-xs leading-5 font-medium text-slate-500">
                  첫 계획을 만들면 이곳에서 학점과 선택 분반을 한눈에 비교할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <History aria-hidden="true" size={19} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-950">지난 학기 돌아보기</h2>
              <p className="mt-2 max-w-2xl text-sm leading-5 text-pretty text-slate-500">
                성적표의 연도와 학기를 기준으로 당시 개설 분반을 찾아 과거 시간표를 생성합니다.
              </p>
            </div>
          </div>
          <Button variant="outline" className="h-9 shrink-0 font-bold" asChild>
            <Link href="/dashboard/graduation/upload">
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
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-semibold text-slate-600">업로드된 성적표 과목이 없습니다.</p>
              <p className="mt-1 text-xs font-bold text-slate-400">
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
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
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
