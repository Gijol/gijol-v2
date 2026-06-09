/**
 * Course Classifier - Embedded from legacy grad-classifier.ts
 * Classifies courses into graduation categories
 */

import type { TakenCourseType, CategoryKey } from './types';
import {
  LANGUAGE_BASIC_CODES,
  LANGUAGE_KEYWORDS,
  SCIENCE_BASIC_CODES,
  SCIENCE_KEYWORDS,
  ETC_MANDATORY_CODES,
  THESIS_SUFFIXES,
  HUMANITY_KEYWORDS,
  ZERO_CREDIT_PE_PREFIX,
  COMMON_MAJOR_PREFIXES,
  ALL_HUMANITIES_COURSES,
  GSC_COURSES,
} from './constants';
import { getAliases } from './constants/alias-mappings';
import { resolveMajorCode } from './academic-context';
import { findMinorProgram, getCourseCodesForProgram, getMajorProgramByCode } from './rule-catalog/academic-programs';

// ===== Helper Functions =====

function normalizeCode(code?: string): string {
  if (!code) return '';
  return String(code)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function normalizeName(name?: string): string {
  return (name || '').toString().toLowerCase();
}

const HUMANITIES_CODE_PREFIXES = new Set(['HS', 'GS', 'EB', 'LH', 'MB', 'PP', 'SS']);

function isHumanitiesTranscriptCode(code: string): boolean {
  const prefix = code.match(/^[A-Z]+/)?.[0] || '';
  return HUMANITIES_CODE_PREFIXES.has(prefix);
}

// Constants moved to ./constants/classifier-constants.ts

// ===== Main Classifier =====

export function matchesMinor(courseCode: string, minorInput: string): boolean {
  const code = normalizeCode(courseCode);
  const minorProgram = findMinorProgram(minorInput);

  if (!minorProgram) {
    return false;
  }

  if (minorProgram.canonicalCode === 'CT' && isHumanitiesTranscriptCode(code)) {
    return false;
  }

  // Get all equivalent codes (including aliases) for cross-listed course matching.
  const aliases = getAliases(code);
  const allCodes = [code, ...aliases];
  const programCourseCodes = getCourseCodesForProgram(minorProgram);

  return allCodes.some((candidate) => programCourseCodes.includes(candidate));
}

export function classifyCourse(course: TakenCourseType, userMajor?: string, userMinors?: string[]): CategoryKey {
  const code = normalizeCode(course.courseCode);
  const name = normalizeName(course.courseName);
  const alphaMatch = code.match(/^[A-Z]+/);
  const prefix = alphaMatch ? alphaMatch[0] : '';
  const credit = Number(course.credit) || 0;

  // 1) 부전공/복수전공 우선 (타 전공도 부전공으로 이수 가능)
  if (userMinors?.some((m) => matchesMinor(course.courseCode, m))) {
    return 'minor';
  }

  // 1.5) MOOC -> 자유학점
  if (name.includes('mooc')) {
    return 'otherUncheckedClass';
  }

  // 2) 기타 필수 (논문연구/새내기/전공탐색/경제/창의함양/콜로퀴움)
  if (ETC_MANDATORY_CODES.has(code)) return 'etcMandatory';
  if (THESIS_SUFFIXES.some((suf) => code.endsWith(suf))) return 'etcMandatory';
  if (/(논문연구|학사논문연구|새내기|전공탐색|과학기술과 경제|콜로퀴움|창의함양|사회봉사|봉사)/.test(name)) {
    return 'etcMandatory';
  }
  if (/^UC|^CC|^UR/.test(prefix)) return 'etcMandatory';

  // 3) 언어의 기초
  if (LANGUAGE_BASIC_CODES.has(code)) return 'languageBasic';
  if (LANGUAGE_KEYWORDS.some((kw) => name.includes(kw))) return 'languageBasic';

  // 4) 전공
  const resolvedMajor = resolveMajorCode(userMajor);
  if (resolvedMajor.code) {
    const majorProgram = getMajorProgramByCode(resolvedMajor.code);

    // Check exact mapping from course_code_sets
    if (majorProgram) {
      const set = getCourseCodesForProgram(majorProgram);
      if (set.includes(code)) return 'major';
    }

    // Fallback: Prefix matching
    const majorPrefixes = majorProgram?.coursePrefixes ?? [resolvedMajor.code];
    if (majorPrefixes.some((majorPrefix) => prefix.startsWith(majorPrefix))) return 'major';
  }

  // 5) 기초과학
  // 5.1) GSC 과목은 인문사회로 분류 (SCIENCE_KEYWORDS보다 우선)
  // 예: GS2823 "수학의 위대한 순간들 - AI"는 과목명에 '수학'이 들어가지만 GSC(인문선택)임
  if (GSC_COURSES.has(code)) return 'humanities';

  if (SCIENCE_BASIC_CODES.has(code)) return 'scienceBasic';
  // Removed strict prefix check for BS|CH|PH|MA|MM|MT because user requested that
  // if it's not the user's major/minor, it should be Free Elective, not Science Basic.
  // Exception: Generic 'GS' Science courses should likely be in SCIENCE_BASIC_CODES anyway.

  if (SCIENCE_KEYWORDS.some((kw) => name.includes(kw))) return 'scienceBasic';

  // 6) 인문사회
  if (
    /^(HS|EB|LH|MB|PP|SS)/.test(prefix) ||
    HUMANITY_KEYWORDS.some((kw) => name.includes(kw)) ||
    ALL_HUMANITIES_COURSES.has(code)
  ) {
    return 'humanities';
  }

  // 7) 0학점 체육/예체능
  if (credit === 0 && ZERO_CREDIT_PE_PREFIX.some((p) => code.startsWith(p))) {
    return 'otherUncheckedClass';
  }

  // 8) 나머지
  return 'otherUncheckedClass';
}
export { COMMON_MAJOR_PREFIXES };
