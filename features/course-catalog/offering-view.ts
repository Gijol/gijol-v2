import type { CourseCatalogMeeting, CourseCatalogOffering } from './types';

export interface CourseOfferingGroupSection {
  offeringId: string;
  courseCode: string;
  section: string;
  department?: string;
}

export interface CourseOfferingMeetingBadge {
  key: string;
  label: string;
  detail?: string;
  room?: string | null;
  title: string;
  day: CourseCatalogMeeting['day'];
  start: string;
  end: string;
}

export interface CourseOfferingGroup {
  offeringGroupId: string;
  term: string;
  section: string;
  courseCodes: readonly string[];
  sections: readonly CourseOfferingGroupSection[];
  departments: readonly string[];
  department?: string;
  category?: string;
  program?: CourseCatalogOffering['program'];
  capacity?: number;
  capacityStatus?: CourseCatalogOffering['capacityStatus'];
  instructors: readonly string[];
  meetings: readonly CourseCatalogMeeting[];
  meetingBadges: readonly CourseOfferingMeetingBadge[];
}

const DAY_LABELS: Record<CourseCatalogMeeting['day'], string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

function uniqueSorted(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort();
}

function meetingKey(meeting: CourseCatalogMeeting): string {
  return [meeting.day, meeting.start, meeting.end, meeting.room ?? ''].join(':');
}

function minutesFromTime(time: string): number | null {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

export function formatCourseTerm(term: string): string {
  const numericSemesterMatch = term.match(/^(\d{4})-([12])$/);
  if (numericSemesterMatch) return `${numericSemesterMatch[1]} ${numericSemesterMatch[2]}학기`;

  const match = term.match(/^(\d{4})-(spring|summer|fall|winter)$/);
  if (!match) return term;

  const semesterLabels: Record<string, string> = {
    spring: '봄',
    summer: '여름',
    fall: '가을',
    winter: '겨울',
  };

  return `${match[1]} ${semesterLabels[match[2]]}`;
}

export function formatMeetingDuration(start: string, end: string): string | null {
  const startMinutes = minutesFromTime(start);
  const endMinutes = minutesFromTime(end);
  if (startMinutes === null || endMinutes === null) return null;

  const durationMinutes = endMinutes - startMinutes;
  if (durationMinutes <= 0 || durationMinutes === 90) return null;
  if (durationMinutes % 60 === 0) return `${durationMinutes / 60}h`;
  return `${durationMinutes / 60}h`;
}

export function formatMeetingFull(meeting: CourseCatalogMeeting): string {
  return `${DAY_LABELS[meeting.day]} ${meeting.start}~${meeting.end}${meeting.room ? ` ${meeting.room}` : ''}`;
}

function actualLectureGroupKey(offering: CourseCatalogOffering): string {
  const meetingsKey = offering.meetings.map(meetingKey).sort().join('|');
  if (!meetingsKey) {
    return [offering.term, 'meeting-unconfirmed', offering.courseCode, offering.section].join('::');
  }

  const instructorsKey = offering.instructors
    .map((instructor) => instructor.name)
    .sort()
    .join('|');
  return [offering.term, offering.title, meetingsKey, instructorsKey].join('::');
}

function buildMeetingBadges(groupId: string, meetings: readonly CourseCatalogMeeting[]): CourseOfferingMeetingBadge[] {
  return meetings.map((meeting, index) => ({
    key: `${groupId}:${index}:${meetingKey(meeting)}`,
    label: `${DAY_LABELS[meeting.day]} ${meeting.start}`,
    detail: formatMeetingDuration(meeting.start, meeting.end) ?? undefined,
    room: meeting.room,
    title: formatMeetingFull(meeting),
    day: meeting.day,
    start: meeting.start,
    end: meeting.end,
  }));
}

function toGroup(groupKey: string, offerings: readonly CourseCatalogOffering[]): CourseOfferingGroup {
  const sortedOfferings = [...offerings].sort((a, b) => a.offeringId.localeCompare(b.offeringId));
  const first = sortedOfferings[0];
  const sections = sortedOfferings.map((offering) => ({
    offeringId: offering.offeringId,
    courseCode: offering.courseCode,
    section: offering.section,
    department: offering.department,
  }));
  const sectionLabel = uniqueSorted(sections.map((section) => section.section)).join('/');

  return {
    offeringGroupId: `group:${first.offeringId}`,
    term: first.term,
    section: sectionLabel,
    courseCodes: uniqueSorted(sortedOfferings.map((offering) => offering.courseCode)),
    sections,
    departments: uniqueSorted(sortedOfferings.map((offering) => offering.department ?? '')),
    department: first.department,
    category: first.category,
    program: first.program,
    capacity: first.capacity,
    capacityStatus: first.capacityStatus,
    instructors: uniqueSorted(
      sortedOfferings.flatMap((offering) => offering.instructors.map((instructor) => instructor.name)),
    ),
    meetings: first.meetings,
    meetingBadges: buildMeetingBadges(groupKey, first.meetings),
  };
}

export function buildCourseOfferingGroups(offerings: readonly CourseCatalogOffering[]): CourseOfferingGroup[] {
  const byGroupKey = new Map<string, CourseCatalogOffering[]>();

  offerings.forEach((offering) => {
    const groupKey = actualLectureGroupKey(offering);
    byGroupKey.set(groupKey, [...(byGroupKey.get(groupKey) ?? []), offering]);
  });

  return Array.from(byGroupKey.entries())
    .map(([groupKey, groupedOfferings]) => toGroup(groupKey, groupedOfferings))
    .sort(
      (a, b) =>
        a.term.localeCompare(b.term) ||
        a.section.localeCompare(b.section) ||
        a.courseCodes.join(',').localeCompare(b.courseCodes.join(',')),
    );
}
