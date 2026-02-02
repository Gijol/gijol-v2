import { TimetableSpan, SectionOffering } from '@/lib/types/timetable';
import { timeToMinutes, DAY_TO_INT } from './transform';

/**
 * Checks if two time ranges overlap.
 * (StartA < EndB) && (StartB < EndA)
 */
export function isOverlapping(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

/**
 * Checks if a section conflicts with any existing scheduled spans.
 * Returns true if there is a conflict.
 */
export function checkConflict(section: SectionOffering, scheduledSpans: TimetableSpan[]): boolean {
  for (const meeting of section.meetings) {
    const meetingDay = DAY_TO_INT[meeting.day];
    const meetingStart = timeToMinutes(meeting.start);
    const meetingEnd = timeToMinutes(meeting.end);

    // Filter relevant spans on the same day
    const sameDaySpans = scheduledSpans.filter((s) => s.week_day === meetingDay);

    for (const span of sameDaySpans) {
      const spanStart = timeToMinutes(span.start_time);
      const spanEnd = timeToMinutes(span.end_time);

      if (isOverlapping(meetingStart, meetingEnd, spanStart, spanEnd)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks which specific meetings in a section are conflicting.
 * Returns an array of meeting indices that conflict.
 */
export function getConflictingMeetingIndices(section: SectionOffering, scheduledSpans: TimetableSpan[]): number[] {
  const indices: number[] = [];

  section.meetings.forEach((meeting, idx) => {
    const meetingDay = DAY_TO_INT[meeting.day];
    const meetingStart = timeToMinutes(meeting.start);
    const meetingEnd = timeToMinutes(meeting.end);

    const sameDaySpans = scheduledSpans.filter((s) => s.week_day === meetingDay);

    const hasConflict = sameDaySpans.some((span) => {
      const spanStart = timeToMinutes(span.start_time);
      const spanEnd = timeToMinutes(span.end_time);
      return isOverlapping(meetingStart, meetingEnd, spanStart, spanEnd);
    });

    if (hasConflict) {
      indices.push(idx);
    }
  });

  return indices;
}
