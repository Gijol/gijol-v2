import React from 'react';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { X, BookOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SelectedSectionList() {
  const selectedSections = useTimetableStore((state) => state.selectedSections);
  const removeSection = useTimetableStore((state) => state.removeSection);
  const reset = useTimetableStore((state) => state.reset);
  const setPreview = useTimetableStore((state) => state.setPreview);
  const clearPreview = useTimetableStore((state) => state.clearPreview);

  const totalCredits = selectedSections.reduce((sum, s) => sum + s.section.hours.credits, 0);

  if (selectedSections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-black tracking-tight text-slate-400 uppercase">선택된 강의가 없습니다</p>
        <p className="mt-1 text-xs font-bold text-slate-300 uppercase">강의 목록에서 추가해 보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between px-1">
        <div>
          <Badge
            variant="secondary"
            className="border-none bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-600 uppercase hover:bg-blue-50"
          >
            {selectedSections.length}개 과목 선택됨
          </Badge>
          <h3 className="mt-2 text-base font-extrabold tracking-tight text-slate-900 uppercase">선택된 강의</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] leading-none font-black text-slate-400 uppercase">총 이수 학점</span>
          <span className="text-3xl leading-tight font-black text-blue-600">
            {totalCredits}
            <span className="ml-0.5 text-sm">학점</span>
          </span>
        </div>
      </div>

      <ScrollArea className="-mx-4 h-auto max-h-[350px] px-4">
        <div className="space-y-3 pb-2">
          {selectedSections.map(({ id, section, color }) => (
            <div
              key={id}
              className="group flex cursor-default items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-blue-400"
              onMouseEnter={() => setPreview(section)}
              onMouseLeave={clearPreview}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="h-8 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold tracking-tight text-slate-900">{section.title}</div>
                  <div className="mt-0.5 font-mono text-[11px] font-bold text-slate-400 uppercase">
                    {section.course_code}-{section.section}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSection(id)}
                className="h-8 w-8 rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Remove section"
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Button
        variant="outline"
        size="sm"
        className="h-10 w-full border-red-200 text-xs font-black tracking-widest text-red-500 uppercase transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white"
        onClick={reset}
      >
        <Trash2 size={14} className="mr-2" /> 시간표 초기화
      </Button>
    </div>
  );
}
