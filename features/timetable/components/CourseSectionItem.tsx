import React from 'react';
import type { SectionOffering } from '@/lib/types/timetable';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { isGraduateSection } from '@/features/timetable/section-browsing';

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
      return `${day} ${m.start}–${m.end}`;
    })
    .join(' / ');
  const isGraduate = isGraduateSection(section);
  const isCapacityPending = section.capacity_status === 'pending' || section.capacity === 0;

  return (
    <article
      className={cn(
        'group relative flex w-full min-w-0 cursor-default items-center gap-3 overflow-hidden transition-[background-color,opacity] [contain-intrinsic-size:auto_84px] [content-visibility:auto] focus-within:bg-slate-50',
        compact ? 'px-3 py-3' : 'px-4 py-4',
        !hideBorder && 'border-b border-slate-100',
        isAdded ? 'bg-blue-50/70 focus-within:bg-blue-50/90' : 'hover:bg-slate-50',
        isConflict && !isAdded && 'bg-red-50/30 opacity-70',
      )}
      onMouseEnter={() => onMouseEnter(section)}
      onMouseLeave={onMouseLeave}
      onFocus={() => onMouseEnter(section)}
      onBlur={onMouseLeave}
    >
      {isAdded && <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500" />}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">
          <h3
            className={cn(
              'min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.015em] text-slate-900 transition-colors group-focus-within:text-blue-700 group-hover:text-blue-700',
            )}
            title={section.title}
          >
            {section.title}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              'h-5 shrink-0 px-1.5 py-0 text-[10px] font-semibold shadow-none',
              isGraduate
                ? 'border-violet-200 bg-violet-50 text-violet-700'
                : 'border-blue-100 bg-blue-50 text-blue-700',
            )}
          >
            {isGraduate ? '대학원' : '학부'}
          </Badge>
        </div>

        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-400">
          <span className="shrink-0 font-mono tracking-tight uppercase" translate="no">
            {section.course_code}-{section.section}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="shrink-0 tabular-nums">{section.hours?.credits ?? 0}학점</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="min-w-0 truncate" title={section.department}>
            {section.department || '학과 미정'}
          </span>
        </div>

        <div className={cn('mt-1.5 flex min-w-0 items-center gap-2 text-slate-500', 'text-xs')}>
          <span className="max-w-[108px] shrink-0 truncate font-medium" title={instructors}>
            {instructors}
          </span>
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="min-w-0 flex-1 truncate font-medium tabular-nums" title={meetingInfo || '시간 미정'}>
            {meetingInfo || '시간 미정'}
          </span>
          {isCapacityPending && (
            <span
              className="shrink-0 font-bold text-amber-600"
              title="현재 정원 0명으로 게시되어 추후 변경될 수 있습니다."
            >
              정원 미정
            </span>
          )}
        </div>
      </div>

      <Button
        size="sm"
        variant={isAdded ? 'destructive' : isConflict ? 'secondary' : 'default'}
        onClick={handleAction}
        disabled={isConflict && !isAdded}
        aria-label={`${section.title} ${isAdded ? '제거' : isConflict ? '시간 중복' : '추가'}`}
        className={cn(
          'h-9 min-w-[68px] shrink-0 touch-manipulation px-2 text-xs font-semibold tracking-tight',
          !isAdded && !isConflict && 'bg-blue-600 shadow-sm hover:bg-blue-700',
        )}
      >
        {isAdded ? (
          <>
            <Minus aria-hidden="true" className="h-3.5 w-3.5" /> 제거
          </>
        ) : isConflict ? (
          <>
            <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" /> 중복
          </>
        ) : (
          <>
            <Plus aria-hidden="true" className="h-3.5 w-3.5" /> 추가
          </>
        )}
      </Button>
    </article>
  );
}
