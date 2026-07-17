export type CourseCatalogSourceKind =
  | 'course-db'
  | 'graduation-recommendation'
  | 'graduation-rule-catalog'
  | 'minor-catalog'
  | 'timetable-offering'
  | 'roadmap-preset'
  | 'manual';

export interface CourseCatalogSourceRef {
  kind: CourseCatalogSourceKind;
  sourceId: string;
  path?: string;
  manualYear?: number;
  page?: number;
  note?: string;
}

export interface CourseCodeAlias {
  code: string;
  relation: 'primary' | 'cross_listed' | 'renumbered' | 'legacy_equivalent' | 'same_course' | 'substitute';
  sourceRefs?: readonly CourseCatalogSourceRef[];
}

export interface CourseCatalogCourse {
  courseId: string;
  primaryCode: string;
  aliases: readonly CourseCodeAlias[];
  titleKo: string;
  titleEn?: string;
  credits: number;
  lectureHours?: number;
  labHours?: number;
  level?: number;
  departments: readonly string[];
  tags: readonly string[];
  description?: string;
  lifecycle?: {
    status: 'active' | 'inactive' | 'planned' | 'unknown';
    effectiveFrom?: string;
    effectiveTo?: string;
  };
  sourceRefs: readonly CourseCatalogSourceRef[];
}

export interface CourseCatalogMeeting {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start: string;
  end: string;
  room?: string | null;
}

export interface CourseCatalogInstructor {
  name: string;
  staffId?: string;
}

export interface CourseCatalogOffering {
  offeringId: string;
  courseId: string;
  courseCode: string;
  term: string;
  section: string;
  title: string;
  department?: string;
  category?: string;
  subcategory?: string | null;
  program?: 'undergraduate' | 'graduate' | 'unknown';
  credits?: number;
  lectureHours?: number;
  labHours?: number;
  capacity?: number;
  capacityStatus?: 'confirmed' | 'pending';
  language?: string | null;
  meetings: readonly CourseCatalogMeeting[];
  instructors: readonly CourseCatalogInstructor[];
  sourceRefs: readonly CourseCatalogSourceRef[];
}

export interface CourseCatalogHistoricalOffering {
  id: string;
  courseId: string;
  courseCode: string;
  academicYear: number;
  semester: string;
  term: string;
  sourceLabel: string;
  sourceRefs: readonly CourseCatalogSourceRef[];
}

export interface CourseCatalogManualListing {
  id: string;
  courseId: string;
  courseCode: string;
  academicYear: number;
  titleKo?: string;
  titleEn?: string;
  credits?: number;
  lectureHours?: number;
  labHours?: number;
  departments: readonly string[];
  page?: number;
  sourceRefs: readonly CourseCatalogSourceRef[];
}

export interface CourseCatalogRequirementFacet {
  id: string;
  courseId: string;
  courseCode: string;
  feature: 'graduation' | 'minor' | 'roadmap' | 'recommendation';
  category: string;
  classification?: string;
  programCode?: string;
  requirementId?: string;
  sortOrder?: number;
  sourceRefs: readonly CourseCatalogSourceRef[];
}

export interface CourseCatalogCourseRelationship {
  id: string;
  relation: 'cross_listed' | 'renumbered' | 'legacy_equivalent' | 'same_course' | 'substitute';
  courseIds: readonly string[];
  courseCodes: readonly string[];
  sourceRefs: readonly CourseCatalogSourceRef[];
  note?: string;
}

export interface CourseCatalogSnapshot {
  schemaVersion: 2;
  generatedAt?: string;
  courses: readonly CourseCatalogCourse[];
  offerings: readonly CourseCatalogOffering[];
  historicalOfferings: readonly CourseCatalogHistoricalOffering[];
  manualListings: readonly CourseCatalogManualListing[];
  requirementFacets: readonly CourseCatalogRequirementFacet[];
  relationships: readonly CourseCatalogCourseRelationship[];
}
