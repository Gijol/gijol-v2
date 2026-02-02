import { TakenCourseType } from '@lib/types/grad';

export type Matcher =
  | { type: 'codePrefix'; value: string }
  | { type: 'codeIn'; value: string[] }
  | { type: 'codeRegex'; value: string }
  | { type: 'nameIncludes'; value: string }
  | { type: 'courseTypeIncludes'; value: string }
  | { type: 'dynamicMajorPrefix' } // request.userMajor로 대체
  | { type: 'dynamicMinorPrefixes' }; // request.userMinors로 대체

export interface CategoryRule {
  id:
    | 'languageBasic'
    | 'scienceBasic'
    | 'major'
    | 'minor'
    | 'humanities'
    | 'etcMandatory'
    | 'otherUncheckedClass';
  label: string;
  minCredits: number;
  capCredits?: number;
  matchers: Matcher[];
  consumes?: boolean; // true면 이 영역으로 분류된 과목은 다른 영역에서 제외(중복 방지)
  messageTemplate?: {
    satisfied: string;
    unsatisfied: string;
    noneRequired: string;
  };
}

export interface RuleSet {
  id: string; // "2018-2020", "2021+" 등
  cohort: { fromYear: number; toYear?: number };
  categories: CategoryRule[];
}

export interface RuleEvalContext {
  userMajor?: string;
  userMinors?: string[];
}

export type Course = TakenCourseType;
