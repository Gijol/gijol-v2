import React, { useMemo, useState } from 'react';
import type { SectionOffering } from '@/lib/types/timetable';
import type { TimetablePlanAlternative, TimetablePreferredFreeTime } from '@/lib/types/timetable-plan';
import { useRecommendedCourses } from '@/lib/hooks/useRecommendedCourses';
import { useTimetablePlanStore } from '@/lib/stores/timetable-plan.store';
import { normalizeCourseCode } from '@/features/course-catalog/normalize';
import { createSectionKey } from '@/features/timetable/plan-model';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';

interface PlanCandidatePanelProps {
  plan: TimetablePlanAlternative;
  sections: SectionOffering[];
  sectionsAvailable: boolean;
  className?: string;
}

const DAY_OPTIONS = [
  { value: 'MON', label: '월' },
  { value: 'TUE', label: '화' },
  { value: 'WED', label: '수' },
  { value: 'THU', label: '목' },
  { value: 'FRI', label: '금' },
  { value: 'SAT', label: '토' },
  { value: 'SUN', label: '일' },
];

function reasonLabel(kind: string): string {
  if (kind === 'graduation') return '졸업요건';
  if (kind === 'roadmap') return '로드맵';
  return '직접 추가';
}

function formatSelectedSection(sectionKey: string): string {
  const [courseCode, section] = sectionKey.split('-');
  return `${courseCode}-${section}`;
}

export function PlanCandidatePanel({ plan, sections, sectionsAvailable, className }: PlanCandidatePanelProps) {
  const addOrMergeCandidate = useTimetablePlanStore((state) => state.addOrMergeCandidate);
  const removeCandidate = useTimetablePlanStore((state) => state.removeCandidate);
  const addPreferredFreeTime = useTimetablePlanStore((state) => state.addPreferredFreeTime);
  const removePreferredFreeTime = useTimetablePlanStore((state) => state.removePreferredFreeTime);
  const { allRecommendations } = useRecommendedCourses();

  const [freeDay, setFreeDay] = useState('FRI');
  const [freeStart, setFreeStart] = useState('09:00');
  const [freeEnd, setFreeEnd] = useState('12:00');

  const sectionsByCourseCode = useMemo(() => {
    const map = new Map<string, SectionOffering[]>();
    sections.forEach((section) => {
      const key = normalizeCourseCode(section.course_code);
      map.set(key, [...(map.get(key) ?? []), section]);
    });
    return map;
  }, [sections]);

  const existingCandidateCodes = useMemo(
    () => new Set(plan.candidates.map((candidate) => candidate.normalizedCourseCode)),
    [plan.candidates],
  );

  const recommendationItems = useMemo(
    () =>
      allRecommendations
        .filter((course) => !existingCandidateCodes.has(normalizeCourseCode(course.courseCode)))
        .slice(0, 10),
    [allRecommendations, existingCandidateCodes],
  );

  const addRecommendation = (courseCode: string, title: string, credits?: number, category?: string) => {
    addOrMergeCandidate(plan.id, {
      courseCode,
      title,
      credits,
      reasons: [
        {
          kind: 'graduation',
          label: category ? `졸업요건: ${category}` : '졸업요건 추천',
          sourceId: category,
        },
      ],
    });
  };

  const addFreeTime = () => {
    if (!freeStart || !freeEnd || freeStart >= freeEnd) return;
    addPreferredFreeTime(plan.id, {
      day: freeDay as TimetablePreferredFreeTime['day'],
      start: freeStart,
      end: freeEnd,
    });
  };

  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-4 overflow-hidden', className)}>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900">들을 과목 찾기</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">졸업요건 추천을 후보로 담아두세요.</p>
          </div>
          <BookOpen size={18} className="shrink-0 text-blue-500" />
        </div>

        {recommendationItems.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-400">
            표시할 추천 과목이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {recommendationItems.map((course) => (
              <div
                key={`${course.courseCode}-${course.category ?? ''}`}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50/60 p-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-extrabold text-slate-900">{course.courseName}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{course.courseCode}</span>
                    {course.category && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-bold">
                        {course.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 px-2 text-[11px] font-bold"
                  onClick={() =>
                    addRecommendation(course.courseCode, course.courseName, course.credit, course.category)
                  }
                >
                  <Plus size={14} className="mr-1" />
                  후보
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900">빈 시간대 참고</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">대안별로 비워두고 싶은 시간을 남겨둡니다.</p>
          </div>
          <Clock size={18} className="shrink-0 text-emerald-500" />
        </div>

        <div className="grid grid-cols-[76px_1fr_1fr_auto] gap-2">
          <Select value={freeDay} onValueChange={setFreeDay}>
            <SelectTrigger className="h-9 text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            aria-label="빈 시간 시작"
            className="h-9 text-xs font-bold"
            type="time"
            value={freeStart}
            onChange={(event) => setFreeStart(event.target.value)}
          />
          <Input
            aria-label="빈 시간 종료"
            className="h-9 text-xs font-bold"
            type="time"
            value={freeEnd}
            onChange={(event) => setFreeEnd(event.target.value)}
          />
          <Button size="sm" className="h-9 px-2" onClick={addFreeTime} aria-label="빈 시간대 추가">
            <Plus size={14} />
          </Button>
        </div>

        {plan.preferredFreeTimes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {plan.preferredFreeTimes.map((freeTime) => (
              <Badge key={freeTime.id} variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700">
                {DAY_OPTIONS.find((day) => day.value === freeTime.day)?.label ?? freeTime.day} {freeTime.start}-
                {freeTime.end}
                <button
                  type="button"
                  onClick={() => removePreferredFreeTime(plan.id, freeTime.id)}
                  className="ml-0.5 rounded-sm p-0.5 hover:bg-emerald-100"
                  aria-label={`${freeTime.start}-${freeTime.end} 빈 시간대 삭제`}
                >
                  <Trash2 size={11} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-black tracking-tight text-slate-900">과목 후보</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {plan.candidates.length}개 후보 · {plan.candidates.filter((candidate) => candidate.selectedSection).length}
            개 분반 선택
          </p>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2 p-3">
            {plan.candidates.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold text-slate-400">
                후보가 없습니다. 추천 과목이나 강의 목록에서 추가해 보세요.
              </div>
            ) : (
              plan.candidates.map((candidate) => {
                const matchingSections = sectionsByCourseCode.get(candidate.normalizedCourseCode) ?? [];
                const selectedKey = candidate.selectedSection?.sectionKey;

                return (
                  <div key={candidate.id} className="rounded-md border border-slate-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-900">
                          {candidate.title ?? candidate.courseCode}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] font-bold text-slate-400">
                          {candidate.courseCode}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-slate-300 hover:bg-red-50 hover:text-red-500"
                        onClick={() => removeCandidate(plan.id, candidate.id)}
                        aria-label={`${candidate.title ?? candidate.courseCode} 후보에서 제거`}
                      >
                        <Trash2 aria-hidden="true" size={14} />
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {candidate.reasons.map((reason) => (
                        <Badge
                          key={`${candidate.id}-${reason.kind}-${reason.label}`}
                          variant="outline"
                          className="h-5 px-1.5 text-[10px] font-bold"
                        >
                          {reasonLabel(reason.kind)}
                        </Badge>
                      ))}
                      {selectedKey ? (
                        <Badge className="h-5 gap-1 bg-blue-600 px-1.5 text-[10px] font-bold">
                          <CheckCircle2 size={11} />
                          {formatSelectedSection(selectedKey)}
                        </Badge>
                      ) : sectionsAvailable ? (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                          {matchingSections.length > 0
                            ? `${matchingSections.length}개 분반 선택 가능`
                            : '이번 학기 미개설'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                          분반 미공개
                        </Badge>
                      )}
                      {selectedKey &&
                        !matchingSections.some((section) => createSectionKey(section) === selectedKey) && (
                          <Badge
                            variant="outline"
                            className="h-5 border-amber-200 bg-amber-50 px-1.5 text-[10px] font-bold text-amber-700"
                          >
                            스냅샷 사용
                          </Badge>
                        )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </section>
    </div>
  );
}
