import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  formatCourseTerm,
  type CourseOfferingGroup,
  type CourseOfferingMeetingBadge,
} from '../offering-view';

export type OfferingGroupTone = 'emerald' | 'slate' | 'sky';

type MeetingBadgeInfo = Pick<CourseOfferingMeetingBadge, 'key' | 'label' | 'detail' | 'room' | 'title'>;

const toneClasses: Record<OfferingGroupTone, {
  card: string;
  term: string;
  text: string;
  code: string;
  meeting: string;
  meetingDetail: string;
}> = {
  emerald: {
    card: 'bg-green-50 text-green-800',
    term: 'border-green-200 bg-white/80 text-green-800',
    text: 'text-green-700',
    code: 'bg-white/80 text-green-800',
    meeting: 'border-green-200 bg-white/80 text-green-800',
    meetingDetail: 'text-green-700',
  },
  slate: {
    card: 'bg-slate-50 text-slate-800',
    term: 'border-slate-200 bg-white text-slate-800',
    text: 'text-slate-500',
    code: 'bg-white text-slate-700',
    meeting: 'border-slate-200 bg-white text-slate-700',
    meetingDetail: 'text-slate-500',
  },
  sky: {
    card: 'bg-sky-50 text-sky-800',
    term: 'border-sky-200 bg-white/80 text-sky-800',
    text: 'text-sky-700',
    code: 'bg-white/80 text-sky-800',
    meeting: 'border-sky-200 bg-sky-50 text-sky-800',
    meetingDetail: 'rounded bg-white/80 px-1 text-[10px] leading-4 text-sky-700',
  },
};

interface MeetingBadgeProps {
  badge: MeetingBadgeInfo;
  tone?: OfferingGroupTone;
  className?: string;
}

export function MeetingBadge({ badge, tone = 'slate', className }: MeetingBadgeProps) {
  const classes = toneClasses[tone];

  return (
    <span
      title={badge.title}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded border px-2 text-xs font-medium',
        classes.meeting,
        className,
      )}
    >
      <span>{badge.label}</span>
      {badge.detail && <span className={classes.meetingDetail}>{badge.detail}</span>}
      {badge.room && <span className={classes.meetingDetail}>{badge.room}</span>}
    </span>
  );
}

interface OfferingGroupCardProps {
  offeringGroup: CourseOfferingGroup;
  tone?: OfferingGroupTone;
  getDepartmentLabel?: (department: string) => string;
  showDepartment?: boolean;
  className?: string;
}

export function OfferingGroupCard({
  offeringGroup,
  tone = 'slate',
  getDepartmentLabel,
  showDepartment = false,
  className,
}: OfferingGroupCardProps) {
  const classes = toneClasses[tone];
  const departmentLabel = offeringGroup.department && getDepartmentLabel
    ? getDepartmentLabel(offeringGroup.department)
    : offeringGroup.department;

  return (
    <div className={cn('space-y-2 rounded-md px-3 py-2 text-sm', classes.card, className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={cn('text-[11px]', classes.term)}>
          {formatCourseTerm(offeringGroup.term)}
        </Badge>
        <span className={cn('text-xs', classes.text)}>{offeringGroup.section}분반</span>
        {offeringGroup.courseCodes.map((courseCode) => (
          <Badge key={courseCode} variant="secondary" className={cn('font-mono text-[11px]', classes.code)}>
            {courseCode}
          </Badge>
        ))}
        {showDepartment && departmentLabel && (
          <span className={cn('text-xs', classes.text)}>{departmentLabel}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {offeringGroup.meetingBadges.length > 0 ? (
          offeringGroup.meetingBadges.map((badge) => (
            <MeetingBadge key={badge.key} badge={badge} tone={tone} />
          ))
        ) : (
          <span className={cn('text-xs', classes.text)}>시간 미확인</span>
        )}
      </div>
    </div>
  );
}
