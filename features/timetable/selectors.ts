import { SectionOffering, SelectedSection, TimetableSpan } from '@/lib/types/timetable';
import { meetingToSpan } from './transform';

/**
 * Converts a selected section into a list of TimetableSpans.
 */
export function sectionToSpans(selected: SelectedSection, type: TimetableSpan['type'] = 'scheduled'): TimetableSpan[] {
  return selected.section.meetings.map((meeting) =>
    meetingToSpan(meeting, selected.section.course_code, selected.id, type, selected.color, selected.section.title),
  );
}

// Predefined pastel color palette for courses (matching background and border tones)
// Backgrounds are very light (50/100), Borders are medium (300/400) from Tailwind palette
export const COURSE_COLORS = [
  { bg: '#eff6ff', border: '#60a5fa' }, // Blue: bg-blue-50, border-blue-400
  { bg: '#f0fdf4', border: '#4ade80' }, // Green: bg-green-50, border-green-400
  { bg: '#fefce8', border: '#facc15' }, // Yellow: bg-yellow-50, border-yellow-400
  { bg: '#eef2ff', border: '#818cf8' }, // Indigo: bg-indigo-50, border-indigo-400
  { bg: '#f0f9ff', border: '#38bdf8' }, // Sky: bg-sky-50, border-sky-400
  { bg: '#fff7ed', border: '#fb923c' }, // Orange: bg-orange-50, border-orange-400
  { bg: '#f5f3ff', border: '#a78bfa' }, // Violet: bg-violet-50, border-violet-400
  { bg: '#ecfeff', border: '#22d3ee' }, // Cyan: bg-cyan-50, border-cyan-400
  { bg: '#faf5ff', border: '#c084fc' }, // Purple: bg-purple-50, border-purple-400
  { bg: '#ecfdf5', border: '#34d399' }, // Emerald: bg-emerald-50, border-emerald-400
  { bg: '#fff1f2', border: '#fb7185' }, // Rose: bg-rose-50, border-rose-400
  { bg: '#fdf4ff', border: '#e879f9' }, // Fuchsia: bg-fuchsia-50, border-fuchsia-400
];

export function getNextColor(usedColors: string[]): string {
  // We store as "bg|border" string for easy usage
  const available = COURSE_COLORS.filter((c) => !usedColors.includes(`${c.bg}|${c.border}`));
  if (available.length > 0) return `${available[0].bg}|${available[0].border}`;
  // Fast fallback: random from palette if all used
  const random = COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];
  return `${random.bg}|${random.border}`;
}

// Helper to parse color string back to bg and border
export function parseColor(colorStr: string): { bg: string; border: string } {
  const [bg, border] = colorStr.split('|');
  return { bg: bg || '#DBEAFE', border: border || '#3B82F6' };
}
