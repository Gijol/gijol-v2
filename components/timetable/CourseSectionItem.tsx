import React from 'react';
import { SectionOffering } from '@/lib/types/timetable';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const DAY_TO_KOREAN: Record<string, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

interface CourseSectionItemProps {
  section: SectionOffering;
  isAdded: boolean;
  isConflict: boolean;
  onAdd: (section: SectionOffering) => void;
  onRemove: (section: SectionOffering) => void;
  onMouseEnter: (section: SectionOffering) => void;
  onMouseLeave: () => void;
  compact?: boolean; // For mobile view
}

export function CourseSectionItem({
  section,
  isAdded,
  isConflict,
  onAdd,
  onRemove,
  onMouseEnter,
  onMouseLeave,
  compact = false,
}: CourseSectionItemProps) {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) {
      onRemove(section);
    } else if (!isConflict) {
      onAdd(section);
    }
  };

  const instructors = section.instructors.map((i) => i.name).join(', ') || '미지정';

  // Format meeting times as a compact string
  const meetingInfo = section.meetings
    .map((m) => {
      const day = DAY_TO_KOREAN[m.day] || m.day;
      return `${day} ${m.start}-${m.end}`;
    })
    .join(' / ');

  // Compact mobile view
  if (compact) {
    return (
      <div
        className={cn(
          'group relative flex w-full min-w-0 cursor-default flex-col overflow-hidden border-b p-3 transition-all duration-200',
          isAdded ? 'bg-blue-50/40' : 'hover:bg-slate-50',
          isConflict && !isAdded && 'bg-red-50/30 opacity-80',
        )}
        onMouseEnter={() => onMouseEnter(section)}
        onMouseLeave={onMouseLeave}
      >
        {isAdded && <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500" />}

        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-mono text-[10px] font-bold text-slate-400 uppercase">
                {section.course_code}
              </span>
              <Badge
                variant="outline"
                className="h-4 shrink-0 border-slate-200 bg-white px-1.5 py-0 text-[9px] font-bold text-slate-500 uppercase"
              >
                {section.hours.credits}학점
              </Badge>
            </div>
            <h4 className="mt-0.5 truncate text-[13px] leading-tight font-bold text-slate-900">{section.title}</h4>
          </div>

          <Button
            size="sm"
            variant={isAdded ? 'destructive' : isConflict ? 'secondary' : 'default'}
            onClick={handleAction}
            disabled={isConflict && !isAdded}
            className={cn(
              'h-7 shrink-0 px-2 text-[10px] font-bold uppercase transition-all',
              !isAdded && !isConflict && 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            {isAdded ? (
              <>
                <Minus className="mr-1 h-3 w-3" /> 삭제
              </>
            ) : isConflict ? (
              <>
                <AlertCircle className="mr-1 h-3 w-3" /> 중복
              </>
            ) : (
              <>
                <Plus className="mr-1 h-3 w-3" /> 추가
              </>
            )}
          </Button>
        </div>

        {/* Meeting info as text (table-like) */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
          <span className="font-medium">{instructors}</span>
          {meetingInfo && (
            <>
              <span className="text-slate-300">|</span>
              <span className="font-mono font-medium">{meetingInfo}</span>
            </>
          )}
          {section.meetings.length === 0 && <span className="text-slate-400 italic">비대면/개별연구</span>}
        </div>
      </div>
    );
  }

  // Desktop view (original)
  return (
    <div
      className={cn(
        'group relative flex w-full min-w-0 cursor-default flex-col overflow-hidden border-b p-5 transition-all duration-200',
        isAdded ? 'bg-blue-50/40' : 'hover:bg-slate-50',
        isConflict && !isAdded && 'bg-red-50/30 opacity-80',
      )}
      onMouseEnter={() => onMouseEnter(section)}
      onMouseLeave={onMouseLeave}
    >
      {isAdded && <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-500" />}

      <div className="flex w-full min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <h4 className="block w-50 cursor-help truncate text-[15px] leading-snug font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
                {section.title}
              </h4>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-[300px] font-bold">
              {section.title}
            </TooltipContent>
          </Tooltip>

          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-mono text-[11px] font-black tracking-tight text-slate-400 uppercase">
              {section.course_code}-{section.section}
            </span>
            <Badge
              variant="outline"
              className="h-5 shrink-0 truncate border-slate-200 bg-white px-2 py-0 text-[10px] font-black text-slate-500 uppercase"
            >
              {section.category}
            </Badge>
          </div>
        </div>

        <Button
          size="sm"
          variant={isAdded ? 'destructive' : isConflict ? 'secondary' : 'default'}
          onClick={handleAction}
          disabled={isConflict && !isAdded}
          className={cn(
            'h-10 shrink-0 px-4 text-xs font-black tracking-wider uppercase transition-all',
            !isAdded && !isConflict && 'bg-blue-600 shadow-sm hover:bg-blue-700',
          )}
        >
          {isAdded ? (
            <>
              <Minus className="mr-1.5 h-4 w-4" /> 삭제
            </>
          ) : isConflict ? (
            <>
              <AlertCircle className="mr-1.5 h-4 w-4" /> 중복
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> 추가
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden text-slate-600">
          <span className="font-bold">{instructors}</span>
        </div>
        <div className="flex min-w-0 shrink-0 items-center gap-2 text-slate-600">
          <span className="shrink-0 font-bold">{section.hours.credits}학점</span>
        </div>
      </div>

      <div className="mt-3 w-full min-w-0 space-y-1.5">
        {section.meetings.map((m, idx) => (
          <div
            key={idx}
            className="flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-lg border border-slate-200/50 bg-slate-100/50 p-1.5 px-3 text-[11px] font-bold text-slate-500"
          >
            <span className="shrink-0 tracking-tight text-slate-800">{DAY_TO_KOREAN[m.day] || m.day}요일</span>
            <span className="shrink-0 font-mono text-[10px] opacity-80">
              {m.start} - {m.end}
            </span>
            {m.room && <span className="ml-auto truncate text-slate-400">{m.room}</span>}
          </div>
        ))}
        {section.meetings.length === 0 && (
          <div className="w-full truncate py-1.5 text-[11px] font-bold tracking-tight text-slate-300 uppercase italic">
            비대면 또는 개별 연구 과목
          </div>
        )}
      </div>
    </div>
  );
}
