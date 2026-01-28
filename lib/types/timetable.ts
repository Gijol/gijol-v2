export interface Meeting {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  room?: string | null;
}

export interface Instructor {
  name: string;
  staff_id: string;
}

export interface Hours {
  lecture_hours: number;
  lab_hours: number;
  credits: number;
}

export interface SectionOffering {
  no: number;
  department: string;
  course_code: string;
  section: string;
  title: string;
  category: string; // e.g., "선택", "필수"
  subcategory?: string | null;
  research_area?: string;
  program: string; // "학사", "대학원"
  hours: Hours;
  meetings: Meeting[];
  capacity: number;
  syllabus?: string;
  video?: string | null;
  language?: string | null;
  instructors: Instructor[];
}

export interface TimeSpan {
  nanoid: string;
  week_day: number; // 0=SUN, 1=MON, ...
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  active?: boolean;
}

// Extended span for our timetable usage
export interface TimetableSpan extends TimeSpan {
  type: 'scheduled' | 'preview' | 'disabled';
  courseCode: string;
  sectionId: string; // Composite key usually: `${course_code}-${section}`
  color?: string; // For coloring different courses distinctively
  room?: string | null;
  title?: string; // Course title
}

export interface SelectedSection {
  id: string; // `${course_code}-${section}`
  section: SectionOffering;
  color: string;
}
