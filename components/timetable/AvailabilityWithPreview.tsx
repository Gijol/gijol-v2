import React, { useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TimetableSpan } from '@/lib/types/timetable';
import { timeToMinutes, DAY_TO_INT } from '@/features/timetable/transform';
import { X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AvailabilityWithPreviewProps {
  scheduledSpans: TimetableSpan[];
  previewSpans: TimetableSpan[];
  startTime?: string;
  endTime?: string;
  timeIncrements?: number;
  days?: string[];
  className?: string;
  onRemoveSpan?: (sectionId: string) => void;
}

const DEFAULT_START = '08:30';
const DEFAULT_END = '18:30';
const DEFAULT_INCREMENT = 30;
// Full Korean Day Names
const DEFAULT_DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const DAY_MAP_SHORT: Record<string, string> = {
  일요일: 'SUN',
  월요일: 'MON',
  화요일: 'TUE',
  수요일: 'WED',
  목요일: 'THU',
  금요일: 'FRI',
  토요일: 'SAT',
};

export function AvailabilityWithPreview({
  scheduledSpans,
  previewSpans,
  startTime = DEFAULT_START,
  endTime = DEFAULT_END,
  timeIncrements = DEFAULT_INCREMENT,
  days = DEFAULT_DAYS,
  className,
  onRemoveSpan,
}: AvailabilityWithPreviewProps) {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const totalMinutes = endMin - startMin;
  const rowCount = Math.ceil(totalMinutes / timeIncrements);

  const ROW_HEIGHT = 28;
  const HEADER_HEIGHT = 48;
  const TIME_COL_WIDTH = 64;

  const getSpanStyle = (span: TimetableSpan) => {
    const spanStartMin = timeToMinutes(span.start_time);
    const spanEndMin = timeToMinutes(span.end_time);

    if (spanEndMin <= startMin || spanStartMin >= endMin) return null;

    const effectiveStart = Math.max(spanStartMin, startMin);
    const effectiveEnd = Math.min(spanEndMin, endMin);

    const minutesFromTop = effectiveStart - startMin;
    const duration = effectiveEnd - effectiveStart;

    const topPx = (minutesFromTop / timeIncrements) * ROW_HEIGHT;
    const heightPx = (duration / timeIncrements) * ROW_HEIGHT;

    return {
      top: `${topPx}px`,
      height: `${heightPx}px`,
    };
  };

  const calculateDurationHours = (start: string, end: string) => {
    const diff = timeToMinutes(end) - timeToMinutes(start);
    const hours = diff / 60;
    return hours % 1 === 0 ? `${hours}시간` : `${hours.toFixed(1)}시간`;
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border border-slate-300 bg-white select-none',
        className,
      )}
    >
      {/* Header */}
      <div className="flex border-b border-slate-300" style={{ height: HEADER_HEIGHT }}>
        <div className="shrink-0 border-r border-slate-300 bg-slate-50/50" style={{ width: TIME_COL_WIDTH }} />
        <div className="flex flex-1 overflow-hidden">
          {days.map((day) => (
            <div
              key={day}
              className="flex flex-1 items-center justify-center border-r border-slate-300 text-sm font-bold text-slate-900 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Time Axis */}
        <div
          className="relative z-10 shrink-0 border-r border-slate-300 bg-slate-50/50"
          style={{ width: TIME_COL_WIDTH, height: rowCount * ROW_HEIGHT }}
        >
          {Array.from({ length: rowCount + 1 }).map((_, i) => {
            const mins = startMin + i * timeIncrements;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            if (m !== 0) return null;

            return (
              <div
                key={i}
                className="absolute w-full -translate-y-1/2 transform px-4 text-right text-[11px] font-extrabold text-slate-400"
                style={{ top: i * ROW_HEIGHT }}
              >
                {`${h}:00`}
              </div>
            );
          })}
        </div>

        {/* Grid Body */}
        <div className="relative flex-1" style={{ height: rowCount * ROW_HEIGHT }}>
          {/* Horizontal Grid Lines */}
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: rowCount }).map((_, i) => {
              const isHour = (startMin + i * timeIncrements) % 60 === 0;
              return (
                <div
                  key={i}
                  className={cn(
                    'border-b border-slate-100',
                    isHour ? 'border-slate-200' : 'border-dashed border-slate-100',
                  )}
                  style={{ height: ROW_HEIGHT, boxSizing: 'border-box' }}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 flex">
            {days.map((day) => {
              const dayKey = DAY_MAP_SHORT[day];
              const dayInt = DAY_TO_INT[dayKey];

              // Thursday is now core. Only SUN and SAT are non-core.
              const isWeekend = dayKey === 'SUN' || dayKey === 'SAT';

              const dayScheduled = scheduledSpans.filter((s) => s.week_day === dayInt);
              const dayPreview = previewSpans.filter((s) => s.week_day === dayInt);

              return (
                <div key={day} className="group relative flex-1 border-r border-slate-200 last:border-r-0">
                  {isWeekend && (
                    <div
                      className="absolute inset-0 z-0 opacity-[0.03]"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)`,
                      }}
                    />
                  )}

                  {/* Scheduled Spans */}
                  {dayScheduled.map((span) => {
                    const style = getSpanStyle(span);
                    if (!style) return null;
                    return (
                      <div
                        key={span.nanoid}
                        className="group/span absolute inset-x-1 z-10 flex flex-col overflow-hidden rounded-sm border-2 p-2 shadow-sm transition-all"
                        style={{
                          ...style,
                          backgroundColor: '#D1FAE5',
                          borderColor: '#10B981',
                          color: '#064E3B',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[12px] leading-tight font-bold opacity-80">{span.start_time}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveSpan?.(span.sectionId);
                            }}
                            className="rounded p-0.5 opacity-0 transition-opacity group-hover/span:opacity-100 hover:bg-black/5"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col justify-center">
                          <div className="flex items-center gap-1 text-[10px] font-bold opacity-70">
                            <span>⏰</span> {calculateDurationHours(span.start_time, span.end_time)}
                          </div>
                          <div className="mt-1 truncate text-[13px] leading-tight font-black">{span.courseCode}</div>
                          {span.room && (
                            <div className="mt-0.5 truncate text-[9px] font-black uppercase opacity-70">
                              {span.room}
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <span className="text-[12px] leading-tight font-bold opacity-80">{span.end_time}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Preview Spans */}
                  {dayPreview.map((span) => {
                    const style = getSpanStyle(span);
                    if (!style) return null;
                    const isConflict = span.color?.includes('rgba(239, 68, 68');
                    return (
                      <div
                        key={span.nanoid}
                        className={cn(
                          'pointer-events-none absolute inset-x-1 z-20 flex flex-col items-center justify-center rounded-sm border-2 border-dashed p-2 text-center',
                          isConflict ? 'border-red-500 bg-red-200/50' : 'border-emerald-500 bg-emerald-200/50',
                        )}
                        style={{ ...style }}
                      >
                        <span className="text-lg font-black text-slate-700/60 uppercase">{span.courseCode}</span>
                        {isConflict && (
                          <span className="text-[10px] font-black tracking-tighter text-red-600 uppercase">
                            시간 중복
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-2 px-4">
        <p className="text-[10px] font-bold text-slate-400 italic">
          * 빗금으로 표시된 영역은 비활성화된 시간이거나 이미 예약된 블록입니다.
        </p>
      </div>
    </div>
  );
}
