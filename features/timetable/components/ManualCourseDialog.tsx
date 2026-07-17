import React, { useRef, useState } from 'react';
import { Plus, WandSparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimetablePlanStore } from '@/lib/stores/timetable-plan.store';
import type { Meeting, SectionOffering } from '@/lib/types/timetable';

const DAYS: Array<{ value: Meeting['day']; label: string }> = [
  { value: 'MON', label: '월요일' },
  { value: 'TUE', label: '화요일' },
  { value: 'WED', label: '수요일' },
  { value: 'THU', label: '목요일' },
  { value: 'FRI', label: '금요일' },
  { value: 'SAT', label: '토요일' },
  { value: 'SUN', label: '일요일' },
];

interface ManualCourseDialogProps {
  planId: string;
}

type ManualCourseErrorField = 'courseCode' | 'title' | 'credits' | 'time';
type ManualCourseError = { field: ManualCourseErrorField; message: string };

export function ManualCourseDialog({ planId }: ManualCourseDialogProps) {
  const addSectionDirect = useTimetablePlanStore((state) => state.addSectionDirect);
  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('직접');
  const [credits, setCredits] = useState('3');
  const [instructor, setInstructor] = useState('');
  const [day, setDay] = useState<Meeting['day']>('MON');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [room, setRoom] = useState('');
  const [formError, setFormError] = useState<ManualCourseError | null>(null);
  const courseCodeRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const creditsRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCourseCode('');
    setTitle('');
    setSection('직접');
    setCredits('3');
    setInstructor('');
    setDay('MON');
    setStart('');
    setEnd('');
    setRoom('');
    setFormError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = courseCode.trim().toUpperCase();
    const normalizedTitle = title.trim();
    const creditValue = Number(credits);
    if (!normalizedCode) {
      setFormError({ field: 'courseCode', message: '과목 코드를 입력해 주세요. 예: AI5003' });
      courseCodeRef.current?.focus();
      return;
    }
    if (!normalizedTitle) {
      setFormError({ field: 'title', message: '과목명을 입력해 주세요.' });
      titleRef.current?.focus();
      return;
    }
    if (!Number.isFinite(creditValue) || creditValue < 0) {
      setFormError({ field: 'credits', message: '학점은 0 이상의 숫자로 입력해 주세요.' });
      creditsRef.current?.focus();
      return;
    }
    if ((start || end) && (!start || !end || start >= end)) {
      setFormError({ field: 'time', message: '시작 시간보다 늦은 종료 시간을 입력해 주세요.' });
      startRef.current?.focus();
      return;
    }

    const meetings: Meeting[] = start && end ? [{ day, start, end, room: room.trim() || null }] : [];
    const manualSection: SectionOffering = {
      no: -1,
      department: '사용자 추가',
      course_code: normalizedCode,
      section: section.trim() || '직접',
      title: normalizedTitle,
      category: '직접 추가',
      subcategory: null,
      program: '사용자 추가',
      hours: { lecture_hours: 0, lab_hours: 0, credits: creditValue },
      meetings,
      capacity: 0,
      capacity_status: 'pending',
      language: null,
      instructors: instructor.trim() ? [{ name: instructor.trim(), staff_id: '' }] : [],
    };

    addSectionDirect(planId, manualSection);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 border-slate-200 bg-white font-semibold text-slate-700">
          <Plus aria-hidden="true" size={16} />
          직접 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto overscroll-contain">
        <DialogHeader>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <WandSparkles aria-hidden="true" size={18} />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">원천에 없는 과목 추가</DialogTitle>
          <DialogDescription>
            공식 강의 목록에 아직 없거나 수정 대기 중인 과목을 이 시간표에만 저장합니다.
          </DialogDescription>
        </DialogHeader>
        <form id="manual-course-form" className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="manual-code">과목 코드</Label>
            <Input
              id="manual-code"
              ref={courseCodeRef}
              name="manual-course-code"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={formError?.field === 'courseCode'}
              aria-describedby={formError?.field === 'courseCode' ? 'manual-code-error' : undefined}
              required
              value={courseCode}
              onChange={(event) => {
                setCourseCode(event.target.value);
                if (formError?.field === 'courseCode') setFormError(null);
              }}
              placeholder="예: AI5003…"
            />
            {formError?.field === 'courseCode' && (
              <p id="manual-code-error" className="text-xs font-bold text-red-700" role="alert">
                {formError.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-section">분반</Label>
            <Input
              id="manual-section"
              name="manual-section"
              autoComplete="off"
              aria-invalid={formError?.field === 'title'}
              aria-describedby={formError?.field === 'title' ? 'manual-title-error' : undefined}
              spellCheck={false}
              value={section}
              onChange={(event) => setSection(event.target.value)}
              placeholder="예: 01…"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="manual-title">과목명</Label>
            <Input
              id="manual-title"
              ref={titleRef}
              name="manual-title"
              autoComplete="off"
              required
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (formError?.field === 'title') setFormError(null);
              }}
              placeholder="예: 인공지능 원론…"
            />
            {formError?.field === 'title' && (
              <p id="manual-title-error" className="text-xs font-bold text-red-700" role="alert">
                {formError.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-credits">학점</Label>
            <Input
              id="manual-credits"
              ref={creditsRef}
              name="manual-credits"
              autoComplete="off"
              inputMode="decimal"
              aria-invalid={formError?.field === 'credits'}
              aria-describedby={formError?.field === 'credits' ? 'manual-credits-error' : undefined}
              min="0"
              step="0.5"
              type="number"
              required
              value={credits}
              onChange={(event) => {
                setCredits(event.target.value);
                if (formError?.field === 'credits') setFormError(null);
              }}
            />
            {formError?.field === 'credits' && (
              <p id="manual-credits-error" className="text-xs font-bold text-red-700" role="alert">
                {formError.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-instructor">담당교수 (선택)</Label>
            <Input
              id="manual-instructor"
              name="manual-instructor"
              autoComplete="off"
              value={instructor}
              onChange={(event) => setInstructor(event.target.value)}
              placeholder="예: 홍길동…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>요일 (선택)</Label>
            <Select name="manual-day" value={day} onValueChange={(value) => setDay(value as Meeting['day'])}>
              <SelectTrigger aria-label="요일">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-room">강의실 (선택)</Label>
            <Input
              id="manual-room"
              name="manual-room"
              autoComplete="off"
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              placeholder="예: A동 101호…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-start">시작 시간 (선택)</Label>
            <Input
              id="manual-start"
              ref={startRef}
              name="manual-start"
              autoComplete="off"
              type="time"
              aria-invalid={formError?.field === 'time'}
              aria-describedby={formError?.field === 'time' ? 'manual-time-error' : undefined}
              value={start}
              onChange={(event) => {
                setStart(event.target.value);
                if (formError?.field === 'time') setFormError(null);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-end">종료 시간 (선택)</Label>
            <Input
              id="manual-end"
              name="manual-end"
              autoComplete="off"
              type="time"
              aria-invalid={formError?.field === 'time'}
              aria-describedby={formError?.field === 'time' ? 'manual-time-error' : undefined}
              value={end}
              onChange={(event) => {
                setEnd(event.target.value);
                if (formError?.field === 'time') setFormError(null);
              }}
            />
            {formError?.field === 'time' && (
              <p id="manual-time-error" className="text-xs font-bold text-red-700" role="alert">
                {formError.message}
              </p>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 sm:col-span-2">
            시간 정보가 없으면 ‘시간 미정’ 과목으로 별도 표시됩니다. 공식 원천이 갱신되어도 직접 추가한 스냅샷은
            유지됩니다.
          </p>
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button type="submit" form="manual-course-form" className="bg-blue-600 font-semibold hover:bg-blue-700">
            시간표에 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
