import { Node, Edge } from 'reactflow';

export type CourseStatus = 'COMPLETED' | 'AVAILABLE' | 'LOCKED';

export interface RoadmapCourseMeeting {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start: string;
  end: string;
  room?: string | null;
}

export interface RoadmapCourseManualListing {
  id: string;
  courseCode: string;
  academicYear: number;
  credits?: number;
  lectureHours?: number;
  labHours?: number;
  departments: readonly string[];
  page?: number;
}

export interface RoadmapCourseOffering {
  offeringId: string;
  courseCode: string;
  term: string;
  section: string;
  meetings: readonly RoadmapCourseMeeting[];
  equivalentCourseCodes: readonly string[];
}

export interface RoadmapCourseOfferingGroupSection {
  offeringId: string;
  courseCode: string;
  section: string;
  department?: string;
}

export interface RoadmapCourseMeetingBadge {
  key: string;
  label: string;
  detail?: string;
  room?: string | null;
  title: string;
  day: RoadmapCourseMeeting['day'];
  start: string;
  end: string;
}

export interface RoadmapCourseOfferingGroup {
  offeringGroupId: string;
  term: string;
  section: string;
  courseCodes: readonly string[];
  sections: readonly RoadmapCourseOfferingGroupSection[];
  departments: readonly string[];
  department?: string;
  category?: string;
  program?: 'undergraduate' | 'graduate' | 'unknown';
  meetings: readonly RoadmapCourseMeeting[];
  meetingBadges: readonly RoadmapCourseMeetingBadge[];
}

export interface RoadmapCourseCatalogInfo {
  courseId: string;
  primaryCourseCode: string;
  displayTitleKo: string;
  displayTitleEn?: string;
  aliasCodes: readonly string[];
  departments: readonly string[];
  tags: readonly string[];
  creditHours: number;
  lectureHours: number;
  labHours: number;
  description?: string;
  manualListings: readonly RoadmapCourseManualListing[];
  offerings: readonly RoadmapCourseOffering[];
  offeringGroups: readonly RoadmapCourseOfferingGroup[];
}

export interface RoadmapCatalogSummary {
  enrichedNodeCount: number;
  missingCourseCodeNodeCount: number;
  unresolvedCourseCodes: readonly string[];
}

export interface CourseNodeData {
  label: string;
  credits: number; // displayed as "3학점"
  category: string; // e.g. "전공필수"
  courseCode?: string; // Optional based on usage in CourseDetailSheet and JSON data
  semester?: string;
  status: CourseStatus;
  catalog?: RoadmapCourseCatalogInfo;
}

// React Flow Node with our custom data
export type CourseNodeType = Node<CourseNodeData>;

export interface RoadmapData {
  meta: {
    major: string;
    track?: string;
    catalog?: RoadmapCatalogSummary;
  };
  nodes: CourseNodeType[];
  edges: Edge[];
}
