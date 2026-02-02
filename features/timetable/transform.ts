import { Meeting, TimetableSpan } from '@/lib/types/timetable';
import { v4 as uuidv4 } from 'uuid'; // We can use uuid or nanoid. Assuming uuid is available or I'll implement a simple one if not.

// Map day string to integer 0-6 (SUN-SAT)
export const DAY_TO_INT: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export const INT_TO_DAY: Record<number, string> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

// Helper to convert "HH:MM" to minutes from midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function meetingToSpan(
  meeting: Meeting,
  courseCode: string,
  sectionId: string,
  type: TimetableSpan['type'] = 'scheduled',
  color?: string,
  title?: string,
): TimetableSpan {
  return {
    nanoid: uuidv4(), // Generate unique ID for the span
    week_day: DAY_TO_INT[meeting.day],
    start_time: meeting.start,
    end_time: meeting.end,
    active: true,
    type,
    courseCode,
    sectionId,
    room: meeting.room,
    color,
    title,
  };
}
