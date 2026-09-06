import type { RequirementSource, TakenCourseType } from '../types';

export const HISTORICAL_MECHANICAL_LAB_SOURCES: readonly RequirementSource[] = [
  {
    manualYear: 2020,
    page: 69,
    path: 'docs/bachelor_manual/2020_manual.pdf',
    note: 'MC3212 기계공학실험 I: 전기전자·고체역학·동역학 실험',
  },
  {
    manualYear: 2021,
    page: 135,
    path: 'docs/bachelor_manual/2021_manual.pdf',
    note: '동일한 실험 I 내용이 MC3106으로 변경. MC3107 실험 II는 열역학·유체·CAD/CAM',
  },
];
export const HISTORICAL_MATH_SOURCE: RequirementSource = {
  manualYear: 2024,
  page: 25,
  path: 'docs/bachelor_manual/2024_manual.pdf',
  note: 'GS2003 기이수자는 미분방정식·선형대수 대신 선택과목 추가 이수. 기초교육 중복 제외 및 학번별 총 15/18학점 유지',
};
/** A temporal correspondence: never reinterpret later MC3212 observations as laboratory I. */
export function historicalRequirementCode(code: string, course: { year?: number }): string {
  return code === 'MC3212' && typeof course.year === 'number' && course.year > 0 && course.year <= 2020
    ? 'MC3106'
    : code;
}
export function isPreReformAiCompletion(course: Pick<TakenCourseType, 'year'>): boolean {
  return Number.isFinite(course.year) && course.year > 0 && course.year <= 2024;
}

export const ENERGY_DECLARATION_CLOSED_FROM_YEAR = 2025;
export const ENERGY_DECLARATION_SOURCE: RequirementSource = {
  manualYear: 2026,
  page: 15,
  path: 'docs/bachelor_manual/2026_manual.pdf',
  note: '에너지 부전공은 2025-1학기부터 취소만 가능. 기존 선언자의 이수 판정과 신규 선언 가능 여부를 구분',
};
