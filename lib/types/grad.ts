export interface TakenCourseType {
  year: number;
  semester: string; // e.g. '봄', '가을', '여름학기' 등
  courseType: string; // 학교 엑셀에서 내려오는 '이수구분' 텍스트
  courseName: string;
  courseCode: string;
  credit: number;
}

export interface UserTakenCourseListType {
  takenCourses: Array<TakenCourseType>;
}

export interface SingleCategoryType {
  messages: string[];
  minConditionCredits: number;
  satisfied: boolean;
  totalCredits: number;
  userTakenCoursesList: UserTakenCourseListType;
}

export interface GradCategoriesType {
  languageBasic: SingleCategoryType;
  scienceBasic: SingleCategoryType;
  major: SingleCategoryType;
  minor: SingleCategoryType;
  humanities: SingleCategoryType;
  etcMandatory: SingleCategoryType;
  otherUncheckedClass: SingleCategoryType;
}

export interface GradStatusResponseType {
  graduationCategory: GradCategoriesType;
  totalCredits: number;
  totalSatisfied: boolean;
}

// 프론트에서 API로 보낼 때 쓸 Request Body
export interface GradStatusRequestBody {
  entryYear: number; // 2018, 2019, 2020, 2021, ...
  takenCourses: TakenCourseType[];
  // TODO: 필요하면 여기 GPA, 재학학기 수, 전공/부전공 정보 등을 추가
  userMajor?: string; // 전공 prefix, e.g. 'EC', 'MC' 등
  userMinors?: string[]; // 부전공 prefix 리스트
}

// extractOverallStatus에서 쓰는 타입
export interface GradOverallStatusType {
  categoriesArr: { domain: string; status: SingleCategoryType }[];
  totalCredits: number;
  totalPercentage: number;
  minDomain: string;
  minDomainPercentage: number;
  domains: { title: string; percentage: number; satisfied: boolean }[];
}

export interface GraduationPropType extends GradOverallStatusType {
  numbers: number;
}
