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

export interface GradStatusType {
  graduationCategory: GradCategoriesType;
  totalCredits: number;
  totalSatisfied: boolean;
}
