import React, { useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TimetableSpan } from '@/lib/types/timetable';
import { timeToMinutes, DAY_TO_INT } from '@/features/timetable/transform';
import { parseColor } from '@/features/timetable/selectors';
import { CalendarPlus, X } from 'lucide-react';

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
  onSpanClick?: (sectionId: string) => void;
  hideWeekends?: boolean; // For mobile view
  showEmptyHint?: boolean;
}

const DEFAULT_START = '08:30';
const DEFAULT_END = '18:30';
const DEFAULT_INCREMENT = 30;
// Short Korean Day Names
const DEFAULT_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const DAY_MAP_SHORT: Record<string, string> = {
  일: 'SUN',
  월: 'MON',
  화: 'TUE',
  수: 'WED',
  목: 'THU',
  금: 'FRI',
  토: 'SAT',
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
  onSpanClick,
  hideWeekends = false,
  showEmptyHint = false,
}: AvailabilityWithPreviewProps) {
  // Filter out weekends on mobile if hideWeekends is true
  const displayDays = hideWeekends ? days.filter((day) => day !== '일' && day !== '토') : days;
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const totalMinutes = endMin - startMin;
  const rowCount = Math.ceil(totalMinutes / timeIncrements);

  const ROW_HEIGHT = hideWeekends ? 34 : 38;
  const HEADER_HEIGHT = hideWeekends ? 40 : 46;
  const TIME_COL_WIDTH = hideWeekends ? 44 : 58;

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
        'flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white select-none',
        className,
      )}
      role="region"
      aria-label="시간표 미리보기"
    >
      {/* Header */}
      <div className="flex border-b border-slate-200 bg-white" style={{ height: HEADER_HEIGHT }}>
        <div className="shrink-0 border-r border-slate-200 bg-slate-50/80" style={{ width: TIME_COL_WIDTH }} />
        <div className="flex flex-1 overflow-hidden">
          {displayDays.map((day) => (
            <div
              key={day}
              className="flex min-w-[52px] flex-1 items-center justify-center border-r border-slate-200 text-xs font-semibold text-slate-600 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="scrollbar-hide relative flex min-h-0 flex-1 overflow-auto">
        {/* Time Axis */}
        <div
          className="relative z-10 shrink-0 border-r border-slate-200 bg-slate-50/80"
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
                className="absolute w-full px-2 text-right text-[10px] font-bold text-slate-400 tabular-nums"
                style={{
                  top: i === 0 ? 4 : i * ROW_HEIGHT,
                  transform: i === 0 ? undefined : 'translateY(-50%)',
                }}
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
            {displayDays.map((day) => {
              const dayKey = DAY_MAP_SHORT[day];
              const dayInt = DAY_TO_INT[dayKey];

              // Thursday is now core. Only SUN and SAT are non-core.
              const isWeekend = dayKey === 'SUN' || dayKey === 'SAT';

              const dayScheduled = scheduledSpans.filter((s) => s.week_day === dayInt);
              const dayPreview = previewSpans.filter((s) => s.week_day === dayInt);

              return (
                <div key={day} className="group relative min-w-[52px] flex-1 border-r border-slate-100 last:border-r-0">
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

                    // Parse color string to get bg and border colors
                    const colors = parseColor(span.color || '');

                    // Check if the current span is being hovered (in parent scope) - strictly, this is local hover
                    // We rely on group/span and hover effects
                    return (
                      <div
                        key={span.nanoid}
                        className="group/span absolute inset-x-0.5 z-10 flex flex-col overflow-hidden rounded-md border p-1.5 shadow-sm transition-[box-shadow,transform] duration-150 ease-[var(--ease-ui-out)] hover:z-50 hover:-translate-y-px hover:shadow-lg hover:ring-2 hover:ring-offset-1 motion-reduce:transform-none"
                        style={{
                          ...style,
                          backgroundColor: colors.bg, // Use direct color from palette (already light)
                          borderColor: colors.border,
                          // Optional: define a custom property for ring color if needed, or use tailwind arbitrary value
                          // ringColor: colors.border -> handled via style if needed or just use border color for ring?
                          // Tailwind ring util defaults to blue-500. We can set the CSS var:
                          ['--tw-ring-color' as any]: colors.border,
                        }}
                      >
                        <button
                          type="button"
                          className="absolute inset-0 z-0 rounded-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 focus-visible:outline-none"
                          onClick={() => onSpanClick?.(span.sectionId)}
                          aria-label={`${span.title || span.courseCode} 분반 상세 보기`}
                        />
                        {/* Top: Course Code + Remove Button */}
                        <div className="pointer-events-none relative z-10 flex items-start justify-between">
                          <span className="font-mono text-xs font-semibold text-slate-700 uppercase">
                            {span.courseCode}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveSpan?.(span.sectionId);
                            }}
                            className="pointer-events-auto rounded p-0.5 opacity-100 transition-[background-color,opacity,transform] duration-150 ease-[var(--ease-ui-out)] hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:outline-none active:scale-[0.95] motion-reduce:transform-none sm:opacity-0 sm:group-focus-within/span:opacity-100 sm:group-hover/span:opacity-100"
                            style={{ color: colors.border }}
                            aria-label={`${span.title || span.courseCode} 시간표에서 삭제`}
                          >
                            <X aria-hidden="true" size={14} />
                          </button>
                        </div>

                        {/* Middle: Title */}
                        <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
                          <div className="line-clamp-3 overflow-hidden text-xs leading-tight font-semibold text-ellipsis text-slate-800">
                            {span.title || span.courseCode}
                          </div>
                        </div>

                        {/* Bottom: Time */}
                        <div className="pointer-events-none relative z-10 mt-auto">
                          <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                            {span.start_time}–{span.end_time}
                          </span>
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
                        <span className="text-lg font-bold text-slate-700/60 uppercase">{span.courseCode}</span>
                        {isConflict && (
                          <span className="text-[10px] font-semibold tracking-tight text-red-600 uppercase">
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

          {showEmptyHint && scheduledSpans.length === 0 && previewSpans.length === 0 && (
            <div
              className="pointer-events-none absolute top-16 left-1/2 z-20 w-full max-w-sm -translate-x-1/2 p-8"
              aria-hidden="true"
            >
              <div className="max-w-xs rounded-xl border border-slate-200 bg-white/95 px-5 py-4 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <CalendarPlus aria-hidden="true" className="mx-auto text-blue-600" size={20} />
                <p className="mt-2 text-sm font-semibold text-slate-800">왼쪽에서 첫 강의를 찾아보세요</p>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  분반에 마우스를 올리면 시간표에서 위치를 미리 확인할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Off-Grid Courses Section (no time or outside grid hours) */}
      {(() => {
        const offGridSpans = scheduledSpans.filter((span) => {
          // Check if span has no valid time or is outside grid range
          if (!span.start_time || !span.end_time) return true;
          const spanStartMin = timeToMinutes(span.start_time);
          const spanEndMin = timeToMinutes(span.end_time);
          // Outside grid range
          return spanEndMin <= startMin || spanStartMin >= endMin;
        });

        if (offGridSpans.length === 0) return null;

        return (
          <div className="shrink-0 border-t border-slate-200 bg-amber-50/50 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[10px] font-semibold tracking-wider text-amber-600 uppercase">
                시간 외 과목
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-1.5 overflow-hidden">
                {offGridSpans.map((span) => {
                  const colors = parseColor(span.color || '');
                  return (
                    <div
                      key={span.nanoid}
                      className="group flex items-center gap-1 rounded-md border px-2 py-0.5 transition-shadow duration-150 ease-[var(--ease-ui-out)] hover:shadow-sm"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      }}
                    >
                      <button
                        type="button"
                        className="flex min-w-0 items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                        onClick={() => onSpanClick?.(span.sectionId)}
                        aria-label={`${span.title || span.courseCode} 분반 상세 보기`}
                      >
                        <span className="text-[10px] font-bold text-slate-700">{span.courseCode}</span>
                        <span className="max-w-[80px] truncate text-[10px] text-slate-500">{span.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSpan?.(span.sectionId);
                        }}
                        className="ml-0.5 rounded p-0.5 opacity-100 transition-[background-color,opacity] duration-150 hover:bg-black/10 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                        aria-label={`${span.title || span.courseCode} 시간표에서 삭제`}
                      >
                        <X aria-hidden="true" size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legend Footer */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-2 px-4">
        <p className="text-[10px] font-bold text-slate-500">
          색상 블록은 선택 분반, 점선 블록은 미리보기입니다. 시간표 밖 과목은 아래 별도 영역에 표시됩니다.
        </p>
      </div>
    </div>
  );
}
