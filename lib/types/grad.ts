export interface TakenCourseType {
  year: number;
  semester: string;
  courseType: string;
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
