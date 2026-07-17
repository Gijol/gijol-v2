import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { SectionOffering } from '@/lib/types/timetable';
import { useTimetablePlanStore } from '@/lib/stores/timetable-plan.store';
import type { TimetableSourceManifestEntry } from '@/features/course-catalog/timetable-sources';
import { formatCourseTerm } from '@/features/course-catalog/offering-view';
import {
  getScheduledSpansFromPlan,
  getSelectedSectionKeysFromPlan,
  getSelectedSectionsFromPlan,
} from '@/features/timetable/plan-model';
import { checkConflict } from '@/features/timetable/conflict';
import { sectionToSpans } from '@/features/timetable/selectors';
import { AvailabilityWithPreview } from './AvailabilityWithPreview';
import { PlanCourseSidebar } from './PlanCourseSidebar';
import { ManualCourseDialog } from './ManualCourseDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, CalendarDays, Menu, Search, Sparkles, Star, Trash2 } from 'lucide-react';

interface TimetablePlanEditorProps {
  planId: string;
  timetableSources: readonly TimetableSourceManifestEntry[];
}

function getSectionInfoStatus(term: string, timetableSources: readonly TimetableSourceManifestEntry[]) {
  const source = timetableSources.find((entry) => entry.term === term);
  return source && source.count > 0 ? 'available' : 'unpublished';
}

function formatMeetings(section: SectionOffering): string {
  if (section.meetings.length === 0) return '시간 미정';
  const dayLabels: Record<string, string> = {
    MON: '월',
    TUE: '화',
    WED: '수',
    THU: '목',
    FRI: '금',
    SAT: '토',
    SUN: '일',
  };
  return section.meetings
    .map(
      (meeting) =>
        `${dayLabels[meeting.day] ?? meeting.day} ${meeting.start}-${meeting.end}${meeting.room ? ` ${meeting.room}` : ''}`,
    )
    .join(' / ');
}

function timeToMinutesValue(time: string): number | null {
  const [hour, minute] = time.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getTimetableRange(scheduledSpans: readonly { start_time: string; end_time: string }[]) {
  const startTimes: number[] = [];
  const endTimes: number[] = [];

  scheduledSpans.forEach((span) => {
    const start = timeToMinutesValue(span.start_time);
    const end = timeToMinutesValue(span.end_time);
    if (start !== null) startTimes.push(start);
    if (end !== null) endTimes.push(end);
  });

  const fallbackStart = 9 * 60;
  const fallbackEnd = 22 * 60 + 30;
  const earliest = Math.min(fallbackStart, ...startTimes);
  const latest = Math.max(fallbackEnd, ...endTimes);
  const roundedStart = Math.floor(earliest / 30) * 30;
  const roundedEnd = Math.ceil(latest / 30) * 30;

  return {
    startTime: minutesToTime(Math.max(0, roundedStart)),
    endTime: minutesToTime(Math.min(24 * 60, roundedEnd)),
  };
}

export function TimetablePlanEditor({ planId, timetableSources }: TimetablePlanEditorProps) {
  const router = useRouter();
  const plan = useTimetablePlanStore((state) => state.plans[planId]);
  const termGroup = useTimetablePlanStore((state) => (plan ? state.termGroups[plan.term] : undefined));
  const ensureTermGroup = useTimetablePlanStore((state) => state.ensureTermGroup);
  const renamePlan = useTimetablePlanStore((state) => state.renamePlan);
  const deletePlan = useTimetablePlanStore((state) => state.deletePlan);
  const setRepresentativePlan = useTimetablePlanStore((state) => state.setRepresentativePlan);
  const clearSelectedSectionByKey = useTimetablePlanStore((state) => state.clearSelectedSectionByKey);

  const [previewSection, setPreviewSection] = useState<SectionOffering | null>(null);
  const [isCourseSheetOpen, setIsCourseSheetOpen] = useState(false);
  const [detailSectionKey, setDetailSectionKey] = useState<string | null>(null);

  const sectionStatus = plan ? getSectionInfoStatus(plan.term, timetableSources) : 'unpublished';
  const sectionsAvailable = sectionStatus === 'available';

  useEffect(() => {
    if (plan) {
      ensureTermGroup(plan.term, sectionStatus);
    }
  }, [ensureTermGroup, plan, sectionStatus]);

  const selectedSections = useMemo(() => (plan ? getSelectedSectionsFromPlan(plan) : []), [plan]);
  const scheduledSpans = useMemo(() => (plan ? getScheduledSpansFromPlan(plan) : []), [plan]);
  const selectedSectionKeys = useMemo(() => (plan ? getSelectedSectionKeysFromPlan(plan) : new Set<string>()), [plan]);
  const previewSpans = useMemo(() => {
    if (!previewSection) return [];
    const isConflict = checkConflict(previewSection, scheduledSpans);
    const tempSelected = {
      id: 'preview',
      section: previewSection,
      color: isConflict ? 'rgba(239, 68, 68, 0.5)' : 'rgba(100, 116, 139, 0.5)',
    };
    const spans = sectionToSpans(tempSelected, 'preview');
    spans.forEach((span) => {
      span.color = tempSelected.color;
    });
    return spans;
  }, [previewSection, scheduledSpans]);

  const selectedDetail = useMemo(
    () => selectedSections.find((selected) => selected.id === detailSectionKey)?.section,
    [detailSectionKey, selectedSections],
  );

  const totalCredits = selectedSections.reduce((sum, selected) => sum + (selected.section.hours?.credits ?? 0), 0);
  const selectedSectionCount = selectedSections.length;
  const isRepresentative = !!plan && termGroup?.representativePlanId === plan.id;
  const timetableRange = useMemo(
    () => getTimetableRange([...scheduledSpans, ...previewSpans]),
    [previewSpans, scheduledSpans],
  );

  if (!plan) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f6f8fb] p-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-slate-950">시간표 계획을 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">삭제되었거나 다른 저장소의 계획일 수 있습니다.</p>
          <Button className="mt-5 bg-blue-600 font-bold hover:bg-blue-700" asChild>
            <Link href="/dashboard/timetable">시간표 홈으로</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDeletePlan = () => {
    const confirmed = window.confirm(`"${plan.name}" 시간표를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) return;
    deletePlan(plan.id);
    void router.push('/dashboard/timetable');
  };

  const handleRepresentativeClick = () => {
    if (isRepresentative) return;
    setRepresentativePlan(plan.term, plan.id);
  };

  const courseSidebar = (
    <PlanCourseSidebar
      planId={plan.id}
      term={plan.term}
      scheduledSpans={scheduledSpans}
      selectedSectionKeys={selectedSectionKeys}
      className="rounded-none border-0 shadow-none"
      onPreview={setPreviewSection}
    />
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-full flex-col overflow-hidden bg-[#f6f8fb] p-4 lg:p-5">
        <header className="mb-4 flex shrink-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="시간표 홈으로 돌아가기"
              asChild
            >
              <Link href="/dashboard/timetable">
                <ArrowLeft aria-hidden="true" size={18} />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <label htmlFor="timetable-plan-name" className="sr-only">
                  시간표 계획 이름
                </label>
                <Input
                  id="timetable-plan-name"
                  name="timetable-plan-name"
                  autoComplete="off"
                  value={plan.name}
                  onChange={(event) => renamePlan(plan.id, event.target.value)}
                  className="h-9 w-full min-w-0 border-transparent bg-transparent px-1 text-lg font-bold tracking-[-0.025em] text-slate-950 shadow-none hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-blue-500 sm:w-[260px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-9 w-9 shrink-0 border-slate-200 bg-white text-slate-400 hover:bg-amber-50 hover:text-amber-500 focus-visible:ring-amber-500',
                    isRepresentative && 'border-amber-300 bg-amber-50 text-amber-500 hover:bg-amber-50',
                  )}
                  onClick={handleRepresentativeClick}
                  aria-label={isRepresentative ? '대표 시간표' : '대표 시간표로 지정'}
                  aria-pressed={isRepresentative}
                  title={isRepresentative ? '대표 시간표' : '대표 시간표로 지정'}
                >
                  <Star aria-hidden="true" size={16} fill={isRepresentative ? 'currentColor' : 'none'} />
                </Button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" size={13} />
                  {formatCourseTerm(plan.term)}
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>{selectedSectionCount}개 분반</span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="tabular-nums">{totalCredits}학점</span>
                {isRepresentative && <span className="text-amber-700">대표 계획</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ManualCourseDialog planId={plan.id} />
            {sectionsAvailable && (
              <Button
                className="h-9 bg-blue-600 font-semibold hover:bg-blue-700 lg:hidden"
                onClick={() => setIsCourseSheetOpen(true)}
                aria-label="강의 목록 열기"
              >
                <Menu aria-hidden="true" size={16} />
                강의 추가
              </Button>
            )}
            <Button
              variant="outline"
              className="h-9 border-red-200 font-semibold text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-600"
              onClick={handleDeletePlan}
            >
              <Trash2 aria-hidden="true" size={16} />
              삭제
            </Button>
          </div>
        </header>

        <div className="hidden min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:grid lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
            <div className="shrink-0 border-b border-slate-100 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Search aria-hidden="true" size={15} />
                </span>
                <h2 className="text-sm font-semibold tracking-tight text-slate-950">강의 찾아 담기</h2>
              </div>
              <p className="mt-1.5 pl-9 text-xs leading-5 text-slate-500">
                과목명·코드·교수로 검색한 뒤 분반을 선택하세요.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {sectionsAvailable ? (
                courseSidebar
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <div>
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <CalendarDays aria-hidden="true" size={20} />
                    </div>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-950">분반 정보 미공개</h3>
                    <p className="mt-2 text-xs text-slate-500">
                      강의 검색과 분반 추가는 공식 분반 정보가 공개된 뒤 사용할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col bg-slate-50/70 p-3" aria-labelledby="schedule-preview-title">
            <div className="flex h-10 shrink-0 items-center gap-2 px-1">
              <Sparkles aria-hidden="true" size={14} className="text-blue-600" />
              <h2 id="schedule-preview-title" className="text-xs font-semibold text-slate-700">
                실시간 시간표
              </h2>
            </div>
            <AvailabilityWithPreview
              scheduledSpans={scheduledSpans}
              previewSpans={previewSpans}
              startTime={timetableRange.startTime}
              endTime={timetableRange.endTime}
              timeIncrements={30}
              days={['일', '월', '화', '수', '목', '금', '토']}
              onRemoveSpan={clearSelectedSectionByKey.bind(null, plan.id)}
              onSpanClick={setDetailSectionKey}
              hideWeekends={false}
              showEmptyHint
              className="min-h-0 flex-1"
            />
          </section>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4 lg:hidden">
          <div className="h-[430px] shrink-0 overflow-hidden sm:h-[500px]">
            <AvailabilityWithPreview
              scheduledSpans={scheduledSpans}
              previewSpans={previewSpans}
              startTime={timetableRange.startTime}
              endTime={timetableRange.endTime}
              timeIncrements={30}
              days={['일', '월', '화', '수', '목', '금', '토']}
              onRemoveSpan={clearSelectedSectionByKey.bind(null, plan.id)}
              onSpanClick={setDetailSectionKey}
              hideWeekends
            />
          </div>
          {!sectionsAvailable && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <CalendarDays aria-hidden="true" size={20} />
              </div>
              <h2 className="text-base font-semibold tracking-tight text-slate-950">분반 정보가 아직 없습니다</h2>
              <p className="mt-2 text-sm text-slate-500">
                현재는 저장된 시간표만 확인할 수 있습니다. 분반 정보가 공개되면 강의 검색과 추가가 열립니다.
              </p>
            </div>
          )}
          {sectionsAvailable && (
            <Sheet open={isCourseSheetOpen} onOpenChange={setIsCourseSheetOpen}>
              <SheetContent side="bottom" className="h-[86vh] overflow-hidden p-0">
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="shrink-0 border-b border-slate-200 px-4 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                      <Search aria-hidden="true" size={18} className="text-blue-500" />
                      <SheetTitle className="text-base font-semibold tracking-tight text-slate-950">
                        강의 검색
                      </SheetTitle>
                    </div>
                    <SheetDescription className="mt-1.5 text-xs text-slate-500">
                      과목명·코드·교수로 검색하고 학부·대학원 과정을 전환하세요.
                    </SheetDescription>
                  </div>
                  <div className="min-h-0 flex-1 px-4 pt-3 pb-4">
                    <PlanCourseSidebar
                      planId={plan.id}
                      term={plan.term}
                      scheduledSpans={scheduledSpans}
                      selectedSectionKeys={selectedSectionKeys}
                      onPreview={setPreviewSection}
                      isMobile
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setDetailSectionKey(null)}>
          <DialogContent className="max-w-md">
            {selectedDetail && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold tracking-tight">{selectedDetail.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="font-mono text-xs font-bold text-slate-400">
                    {selectedDetail.course_code}-{selectedDetail.section}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 font-bold text-slate-600">
                    {formatMeetings(selectedDetail)}
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    {selectedDetail.instructors.map((instructor) => instructor.name).join(', ') || '담당교원 미정'}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
