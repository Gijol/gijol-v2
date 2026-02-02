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
