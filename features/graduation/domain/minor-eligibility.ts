import { isPreReformAiCompletion } from './rule-catalog/historical-courses';
import { compareAcademicTerms } from './rule-catalog/schema';
import { getAliases } from './constants/alias-mappings';
import type { AcademicTerm, TakenCourseType } from './types';
import { MANUAL_PROGRAM_COURSES } from './rule-catalog/manual-program-courses';
import { getMinorMandatoryRulesForContext } from './rule-catalog/major-minor-requirements';

/** 2026 학사편람 p.27–29. This filters eligibility, not earned total credits. */
export function minorExclusionReason(
  course: TakenCourseType,
  minor: string,
  entryYear: number,
  declarationTerm?: AcademicTerm,
): string | undefined {
  const code = course.courseCode.toUpperCase();
  const codes = [code, ...getAliases(code)];
  if (minor === 'EC' && entryYear >= 2023 && !/^[ABCD][+0-]?$/.test(course.grade.trim().toUpperCase())) {
    return '2023학번부터 EC 부전공 최소 이수학점은 성적부가 방식(A+~D0)만 인정합니다.';
  }
  if (minor === 'BS' && codes.includes('BS2101')) return '생명 부전공은 유기화학 I(BS2101)을 인정하지 않습니다.';
  if (
    minor === 'AI' &&
    code === 'AI2002' &&
    isPreReformAiCompletion(course) &&
    declarationTerm &&
    compareAcademicTerms(declarationTerm, { year: 2024, semester: '2' }) <= 0
  )
    return undefined;
  if (!/^[A-Z]+2\d{3}$/.test(code)) return undefined;
  if (['EC', 'PS', 'CH', 'MM'].includes(minor) || minor.startsWith('LH_')) return undefined;
  if (
    ['CT', 'IR', 'MD', 'FE'].includes(minor) &&
    codes.some((candidate) => MANUAL_PROGRAM_COURSES[minor]?.includes(candidate))
  )
    return undefined;
  if (minor === 'BS' || (minor === 'MD' && code === 'MD2101')) return undefined;
  if (minor === 'MA' || minor === 'MC') {
    if (getMinorMandatoryRulesForContext(minor, { entryYear }).some((rule) => rule.courses.includes(code)))
      return undefined;
  }
  return '편람 p.27–29: 별도 인정 규정이 없는 2천번대 교과목은 부전공 학점에서 제외합니다.';
}
