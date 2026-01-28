import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { Trash2, Clock, MapPin, User, BookOpen, GraduationCap } from 'lucide-react';
import { parseColor } from '@/features/timetable/selectors';

interface CourseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string | null;
}

const DAY_LABELS: Record<string, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
};

export function CourseDetailDialog({ open, onOpenChange, sectionId }: CourseDetailDialogProps) {
  const selectedSections = useTimetableStore((state) => state.selectedSections);
  const removeSection = useTimetableStore((state) => state.removeSection);

  const selectedSection = sectionId ? selectedSections.find((s) => s.id === sectionId) : null;

  if (!selectedSection) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">강의 정보</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-sm text-slate-500">강의 정보를 찾을 수 없습니다.</div>
        </DialogContent>
      </Dialog>
    );
  }

  const { section, color } = selectedSection;
  const colors = parseColor(color);

  const handleRemove = () => {
    removeSection(sectionId!);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        {/* Header with color stripe */}
        <div className="border-b-4 px-6 pt-6 pb-4" style={{ borderBottomColor: colors.border }}>
          <DialogHeader>
            <DialogDescription className="flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 font-mono text-xs font-black uppercase"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.border,
                }}
              >
                {section.course_code}
              </span>
              <span className="text-xs font-bold text-slate-400">{section.section}</span>
            </DialogDescription>
            <DialogTitle className="text-xl font-black tracking-tight text-slate-900">{section.title}</DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Category & Credits */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              <BookOpen size={14} />
              {section.category}
              {section.subcategory && ` · ${section.subcategory}`}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              <GraduationCap size={14} />
              {section.hours.credits}학점
            </span>
            {section.language && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                {section.language}
              </span>
            )}
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-400 uppercase">
              <Clock size={14} />
              수업 시간
            </h4>
            <div className="space-y-1">
              {section.meetings.map((meeting, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm"
                >
                  <span className="font-bold text-slate-700">{DAY_LABELS[meeting.day] || meeting.day}</span>
                  <span className="text-slate-500">
                    {meeting.start} ~ {meeting.end}
                  </span>
                  {meeting.room && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {meeting.room}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          {section.instructors.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-400 uppercase">
                <User size={14} />
                담당 교수
              </h4>
              <div className="flex flex-wrap gap-2">
                {section.instructors.map((instructor, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    {instructor.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Department */}
          <div className="text-xs text-slate-400">
            {section.department} · {section.program}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <Button
            variant="outline"
            onClick={handleRemove}
            className="border-red-200 text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={16} className="mr-2" />
            시간표에서 삭제
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-slate-700 hover:bg-slate-800">
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
