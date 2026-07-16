import React, { useState } from 'react';
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
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = courseCode.trim().toUpperCase();
    const normalizedTitle = title.trim();
    const creditValue = Number(credits);
    if (!normalizedCode || !normalizedTitle || !Number.isFinite(creditValue) || creditValue < 0) return;
    if ((start || end) && (!start || !end || start >= end)) return;

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
        <Button variant="outline" className="h-9 border-slate-200 bg-white font-bold text-slate-700">
          <Plus size={16} className="mr-1.5" />
          직접 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <WandSparkles size={18} />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight">원천에 없는 과목 추가</DialogTitle>
          <DialogDescription>
            공식 강의 목록에 아직 없거나 수정 대기 중인 과목을 이 시간표에만 저장합니다.
          </DialogDescription>
        </DialogHeader>
        <form id="manual-course-form" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="manual-code">과목 코드</Label>
            <Input
              id="manual-code"
              required
              value={courseCode}
              onChange={(event) => setCourseCode(event.target.value)}
              placeholder="예: AI5003"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-section">분반</Label>
            <Input
              id="manual-section"
              value={section}
              onChange={(event) => setSection(event.target.value)}
              placeholder="예: 01"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="manual-title">과목명</Label>
            <Input
              id="manual-title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="과목명을 입력하세요"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-credits">학점</Label>
            <Input
              id="manual-credits"
              min="0"
              step="0.5"
              type="number"
              required
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-instructor">담당교수 (선택)</Label>
            <Input
              id="manual-instructor"
              value={instructor}
              onChange={(event) => setInstructor(event.target.value)}
              placeholder="미정이면 비워두세요"
            />
          </div>
          <div className="space-y-1.5">
            <Label>요일 (선택)</Label>
            <Select value={day} onValueChange={(value) => setDay(value as Meeting['day'])}>
              <SelectTrigger>
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
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              placeholder="예: A동 101호"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-start">시작 시간 (선택)</Label>
            <Input id="manual-start" type="time" value={start} onChange={(event) => setStart(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-end">종료 시간 (선택)</Label>
            <Input id="manual-end" type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
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
          <Button type="submit" form="manual-course-form" className="bg-blue-600 font-bold hover:bg-blue-700">
            시간표에 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
