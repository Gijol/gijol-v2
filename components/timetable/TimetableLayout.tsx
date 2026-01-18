import React from 'react';
import { SectionOffering } from '@/lib/types/timetable';
import { AvailabilityWithPreview } from './AvailabilityWithPreview';
import { CourseSidebar } from './CourseSidebar';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { TooltipProvider } from '@/components/ui/tooltip';

interface TimetableLayoutProps {
  sections: SectionOffering[];
}

export function TimetableLayout({ sections }: TimetableLayoutProps) {
  const scheduledSpans = useTimetableStore((state) => state.scheduledSpans);
  const previewSpans = useTimetableStore((state) => state.previewSpans);
  const removeSection = useTimetableStore((state) => state.removeSection);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-full gap-6 overflow-hidden bg-slate-100 p-4 lg:p-6">
        {/* Left: Timetable Grid Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4 flex shrink-0 items-center justify-between px-2">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
                ⏰ 시간표 빌더 <span className="text-lg font-normal text-slate-300">TIMETABLE BUILDER</span>
              </h1>
              <p className="text-xs font-bold text-slate-500">
                시간 중복을 확인하며 나만의 완벽한 학기 시간표를 짜보세요
              </p>
            </div>
            <div className="self-center rounded-full border border-slate-300 bg-white px-4 py-1.5 align-middle">
              <span className="text-[10px] font-black tracking-tight text-blue-600 uppercase">
                브라우저에 자동 저장됨
              </span>
            </div>
          </div>

          <AvailabilityWithPreview
            scheduledSpans={scheduledSpans}
            previewSpans={previewSpans}
            startTime="07:00"
            endTime="22:00"
            timeIncrements={30}
            days={['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']}
            onRemoveSpan={removeSection}
          />
        </div>

        {/* Right: Sidebar Panel */}
        <div className="flex w-[400px] shrink-0 flex-col">
          <CourseSidebar sections={sections} />
        </div>
      </div>
    </TooltipProvider>
  );
}
