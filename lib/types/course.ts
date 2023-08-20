export interface CourseType {
  id: number;
  courseCode: string;
  courseCredit: number;
  courseName: string;
  courseTags: string[];
  prerequisite: string;
  description: string;
}

const CourseTypes = {
  BS: 'BS',
  CH: 'CH',
  CT: 'CT',
  EB: 'EB',
  EC: 'EC',
  EV: 'EV',
  FE: 'FE',
  IR: 'IR',
  LH: 'LH',
  MA: 'MA',
  MB: 'MB',
  MC: 'MC',
  MD: 'MD',
  MM: 'MM',
  NONE: 'NONE',
  PP: 'PP',
  PS: 'PS',
  SS: 'SS',
  HUS: 'HUS',
  PPE: 'PPE',
};

export type CourseSearchCodeType = keyof typeof CourseTypes;

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
