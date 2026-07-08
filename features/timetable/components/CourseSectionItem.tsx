import React from 'react';
import type { SectionOffering } from '@/lib/types/timetable';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle } from 'lucide-react';

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
  hideBorder?: boolean; // Hide bottom border for last item
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
  hideBorder = false,
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

  const meetingInfo = section.meetings
    .map((m) => {
      const day = DAY_TO_KOREAN[m.day] || m.day;
      return `${day} ${m.start}-${m.end}`;
    })
    .join(' / ');

  return (
    <div
      className={cn(
        'group relative flex w-full min-w-0 cursor-default items-center gap-3 overflow-hidden transition-colors',
        compact ? 'px-3 py-2.5' : 'px-3 py-3',
        !hideBorder && 'border-b border-slate-200',
        isAdded ? 'bg-blue-50/70' : 'hover:bg-slate-50',
        isConflict && !isAdded && 'bg-red-50/30 opacity-80',
      )}
      onMouseEnter={() => onMouseEnter(section)}
      onMouseLeave={onMouseLeave}
    >
      {isAdded && <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500" />}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] font-black tracking-tight text-slate-400 uppercase">
            {section.course_code}-{section.section}
          </span>
          <Badge
            variant="outline"
            className="h-5 shrink-0 border-slate-200 bg-white px-1.5 py-0 text-[10px] font-black text-slate-500"
          >
            {section.hours?.credits ?? 0}학점
          </Badge>
          <h4
            className={cn(
              'min-w-0 flex-1 truncate font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600',
              compact ? 'text-[13px]' : 'text-sm',
            )}
            title={section.title}
          >
            {section.title}
          </h4>
        </div>

        <div
          className={cn('mt-1 flex min-w-0 items-center gap-2 text-slate-500', compact ? 'text-[10px]' : 'text-[11px]')}
        >
          <span className="max-w-[108px] shrink-0 truncate font-medium" title={instructors}>
            {instructors}
          </span>
          <span className="shrink-0 text-slate-300">|</span>
          <span className="min-w-0 flex-1 truncate font-mono font-medium" title={meetingInfo || '시간 미정'}>
            {meetingInfo || '시간 미정'}
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant={isAdded ? 'destructive' : isConflict ? 'secondary' : 'default'}
        onClick={handleAction}
        disabled={isConflict && !isAdded}
        aria-label={`${section.title} ${isAdded ? '삭제' : isConflict ? '시간 중복' : '추가'}`}
        className={cn(
          'h-8 min-w-[64px] shrink-0 px-2 text-xs font-black tracking-tight transition-all',
          !isAdded && !isConflict && 'bg-blue-600 shadow-sm hover:bg-blue-700',
        )}
      >
        {isAdded ? (
          <>
            <Minus className="mr-1 h-3.5 w-3.5" /> 삭제
          </>
        ) : isConflict ? (
          <>
            <AlertCircle className="mr-1 h-3.5 w-3.5" /> 중복
          </>
        ) : (
          <>
            <Plus className="mr-1 h-3.5 w-3.5" /> 추가
          </>
        )}
      </Button>
    </div>
  );
}
