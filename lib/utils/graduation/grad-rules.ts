import {
  GradCategoriesType,
  SingleCategoryType,
  TakenCourseType,
  UserTakenCourseListType,
  GradStatusResponseType,
} from '@lib/types/grad';
import { ex } from '@fullcalendar/core/internal-common';
import exp from 'node:constants';

export type CategoryKey = keyof GradCategoriesType;

export interface CategoryRule {
  key: CategoryKey;
  minCredits: number;
  // minor, 자유학점 등 "필수는 아니지만 보여주기용"은 true로 세팅할 수 있음
  optional?: boolean;
}

export interface YearRuleSet {
  name: string;
  minTotalCredits: number;
  minGpaForGraduation: number; // 실제 계산은 별도 파라미터 필요
  categories: CategoryRule[];
}

export const ruleSet2021Plus: YearRuleSet = {
  name: '2021학번 이후',
  minTotalCredits: 130,
  minGpaForGraduation: 2.0, // 학사편람 기준
  categories: [
    { key: 'languageBasic', minCredits: 7 }, // 언어의 기초
    { key: 'humanities', minCredits: 24 }, // 인문사회
    { key: 'scienceBasic', minCredits: 17 }, // 기초과학(17~18 중 최소 기준)
    // 전공필수 36 + 학사논문연구 6 등을 합치면 42 이상이지만,
    // 여기서는 "전공 카테고리"만 36으로, 논문/공통과목은 etcMandatory로 분리
    { key: 'major', minCredits: 36 },
    // 부전공은 선택이므로 일단 optional + 0학점 기준으로 두고,
    // 추후 부전공 선언 정보 기반으로 minCredits 세팅 가능
    { key: 'minor', minCredits: 0, optional: true },
    // etcMandatory: 학사논문연구(6) + GIST 새내기(1) + GIST 전공탐색(1) + 과학기술과 경제(1) 등
    // 정확하게는 더 쪼갤 수 있지만, 최소 8~9학점 정도 필요.
    // 학사편람에서 명시된 필수학점의 총합을 보수적으로 8로 잡음 (논문연구 6 + 새내기 1 + 전공탐색 1).
    // 과학기술과 경제(1)은 대학공통 필수지만, 이수여부를 courseName 기반으로 더 엄격히 체크해도 됨.
    { key: 'etcMandatory', minCredits: 8 },
    // 자유학점은 min = 0
    { key: 'otherUncheckedClass', minCredits: 0, optional: true },
  ],
};

// 2018~2020 규칙 (기초/인문/소프트웨어/기초과학 구조는 거의 동일)
export const ruleSet2018to2020: YearRuleSet = {
  name: '2018~2020학번',
  minTotalCredits: 130,
  minGpaForGraduation: 2.0,
  categories: [
    { key: 'languageBasic', minCredits: 7 },
    { key: 'humanities', minCredits: 24 },
    { key: 'scienceBasic', minCredits: 17 },
    { key: 'major', minCredits: 36 },
    { key: 'minor', minCredits: 0, optional: true },
    // 이쪽도 학사논문연구 필수 구조는 동일하다고 보고 8학점 기준 유지
    { key: 'etcMandatory', minCredits: 8 },
    { key: 'otherUncheckedClass', minCredits: 0, optional: true },
  ],
};

export function pickRuleSet(entryYear: number): YearRuleSet {
  if (entryYear >= 2021) return ruleSet2021Plus;
  if (entryYear >= 2018 && entryYear <= 2020) return ruleSet2018to2020;

  // 그 이전 학번은 일단 2015~2017 규칙과 유사하게 취급하거나
  // 별도의 RuleSet을 추가하는 것이 안전하지만,
  // 여기서는 2018~2020 규칙을 default로 사용
  return ruleSet2018to2020;
}
