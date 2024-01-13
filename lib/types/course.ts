export interface CourseType {
  id: number;
  courseCode: string;
  courseCredit: number;
  courseName: string;
  courseTags: string[];
  prerequisite: string;
  description: string;
}

const CourseTypes = [
  'BS',
  'CH',
  'CT',
  'EB',
  'EC',
  'EV',
  'FE',
  'IR',
  'LH',
  'MA',
  'MB',
  'MC',
  'MD',
  'MM',
  'NONE',
  'PP',
  'PS',
  'SS',
  'HUS',
  'PPE',
];

export type CourseSearchCodeType = typeof CourseTypes[number];

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}
export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: Sort;
  unpaged: boolean;
}

export interface CourseResponse {
  content: CourseType[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

export interface CourseHistory {
  year: number;
  semester: string;
  courseProfessor: string;
  courseTime: string;
  courseRoom: string;
}
