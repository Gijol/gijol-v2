/**
 * Domain Types for Graduation Feature
 * Self-contained type definitions, no external lib imports
 */

// ===== Core Course Types =====

export interface TakenCourseType {
  year: number;
  semester: string;
  courseType: string;
  courseName: string;
  courseCode: string;
  credit: number;
  grade: string;
}

export interface UserTakenCourseListType {
  takenCourses: Array<TakenCourseType>;
}

// ===== Category & Status Types =====

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

// ===== Fine-Grained Requirements =====

export type RequirementImportance = 'must' | 'should';

/** Simplified course info for display in requirements */
export interface MatchedCourseInfo {
  courseCode: string;
  courseName: string;
  credit: number;
  year: number;
  semester: string;
}

export interface FineGrainedRequirement {
  id: string;
  categoryKey: CategoryKey;
  label: string;
  requiredCredits: number;
  acquiredCredits: number;
  missingCredits: number;
  satisfied: boolean;
  importance: RequirementImportance;
  hint?: string;
  /** Courses that actually matched/contributed to this requirement */
  matchedCourses: MatchedCourseInfo[];
  relatedCoursePatterns?: {
    codePrefixes?: string[];
    nameKeywords?: string[];
  };
}

// ===== Science Field Types =====

export type ScienceField = 'math' | 'physics' | 'chemistry' | 'biology' | 'sw';

export interface FieldCompletionResult {
  field: ScienceField;
  isComplete: boolean;
  completionIndex: number; // 분야 완료 시점 (과목 index), 미완료 시 -1
  requiredCourses: TakenCourseType[]; // 분야 완료에 사용된 과목들
  hasLab: boolean; // 실험 이수 여부
  labVerified: boolean; // 실험-강의 선이수/동시수강 조건 충족 여부
}

export interface ScienceRebalanceResult {
  scienceBasic: TakenCourseType[]; // 기초과학으로 인정된 과목
  freeElective: TakenCourseType[]; // 자유선택으로 이동한 과목
  selectedFields: ScienceField[]; // 선택된 3분야
  fieldDetails: Map<ScienceField, FieldCompletionResult>;
}

// ===== Rule Types =====

export type CategoryKey = keyof GradCategoriesType;

export interface CategoryRule {
  key: CategoryKey;
  minCredits: number;
  optional?: boolean;
}

export interface YearRuleSet {
  name: string;
  minTotalCredits: number;
  minGpaForGraduation: number;
  categories: CategoryRule[];
}

// ===== Extended Response =====

export interface GradStatusResponseV2 extends GradStatusResponseType {
  fineGrainedRequirements: FineGrainedRequirement[];
}
