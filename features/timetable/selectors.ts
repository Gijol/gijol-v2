import { SectionOffering, SelectedSection, TimetableSpan } from '@/lib/types/timetable';
import { meetingToSpan } from './transform';

/**
 * Converts a selected section into a list of TimetableSpans.
 */
export function sectionToSpans(selected: SelectedSection, type: TimetableSpan['type'] = 'scheduled'): TimetableSpan[] {
  return selected.section.meetings.map((meeting) =>
    meetingToSpan(meeting, selected.section.course_code, selected.id, type, selected.color),
  );
}

// Predefined palette for courses
export const COURSE_COLORS = [
  '#FFD700', // Gold
  '#FF6347', // Tomato
  '#87CEEB', // SkyBlue
  '#98FB98', // PaleGreen
  '#DDA0DD', // Plum
  '#F0E68C', // Khaki
  '#FFB6C1', // LightPink
  '#40E0D0', // Turquoise
  '#FFA07A', // LightSalmon
  '#87CEFA', // LightSkyBlue
];

export function getNextColor(usedColors: string[]): string {
  const available = COURSE_COLORS.filter((c) => !usedColors.includes(c));
  if (available.length > 0) return available[0];
  // fast fallback: random from palette if all used
  return COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];
}
