import type { Hours, Instructor, Meeting } from './timetable';

export type TimetableSectionInfoStatus = 'available' | 'unpublished';

export type TimetablePlanStatus = 'preparing' | 'section_selectable';

export type TimetableCandidateReasonKind = 'roadmap' | 'graduation' | 'direct';

export interface TimetableCandidateReason {
  kind: TimetableCandidateReasonKind;
  label: string;
  sourceId?: string;
}

export interface TimetableSectionSnapshot {
  sectionKey: string;
  department: string;
  course_code: string;
  section: string;
  title: string;
  category: string;
  subcategory?: string | null;
  research_area?: string;
  program: string;
  hours: Hours;
  meetings: Meeting[];
  capacity: number;
  syllabus?: string;
  video?: string | null;
  language?: string | null;
  instructors: Instructor[];
}

export interface TimetableSelectedSectionRef {
  sectionKey: string;
  snapshot: TimetableSectionSnapshot;
  selectedAt: number;
}

export interface TimetableCourseCandidate {
  id: string;
  courseCode: string;
  normalizedCourseCode: string;
  title?: string;
  credits?: number;
  reasons: TimetableCandidateReason[];
  selectedSection?: TimetableSelectedSectionRef;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TimetablePreferredFreeTime {
  id: string;
  day: Meeting['day'];
  start: string;
  end: string;
  label?: string;
}

export interface TimetablePlanAlternative {
  id: string;
  term: string;
  name: string;
  status: TimetablePlanStatus;
  candidates: TimetableCourseCandidate[];
  preferredFreeTimes: TimetablePreferredFreeTime[];
  createdAt: number;
  updatedAt: number;
}

export interface TimetableTermPlanGroup {
  term: string;
  sectionInfoStatus: TimetableSectionInfoStatus;
  representativePlanId?: string;
  planIds: string[];
  createdAt: number;
  updatedAt: number;
}
