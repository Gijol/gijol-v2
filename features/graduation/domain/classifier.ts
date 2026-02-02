/**
 * Course Classifier - Embedded from legacy grad-classifier.ts
 * Classifies courses into graduation categories
 */

import type { TakenCourseType, CategoryKey } from './types';
import {
  COURSE_CODE_SETS,
  MAJOR_CODE_TO_NAME,
  MajorCode,
  MINOR_CODE_TO_NAME,
  MinorCode,
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
} from './constants';

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

// Constants moved to ./constants/classifier-constants.ts

// ===== Main Classifier =====

export function matchesMinor(courseCode: string, minorInput: string): boolean {
  const mCode = normalizeCode(minorInput);
  const code = normalizeCode(courseCode);

  // 1. Check Majors (Major used as Minor)
  const mjName = MAJOR_CODE_TO_NAME[mCode as MajorCode];
  if (mjName) {
    const set = COURSE_CODE_SETS.majors[mjName as keyof typeof COURSE_CODE_SETS.majors];
    if (set && (set as readonly string[]).includes(code)) return true;
  }

  // 2. Check Standard Minors
  const mnName = MINOR_CODE_TO_NAME[mCode as MinorCode];
  if (mnName) {
    const set = COURSE_CODE_SETS.minors[mnName as keyof typeof COURSE_CODE_SETS.minors];
    if (set && (set as readonly string[]).includes(code)) return true;
  }

  // 3. Fallback Prefix Matching
  const mp = mCode.replace(/[^A-Z]/g, '');
  const prefix = code.match(/^[A-Z]+/)?.[0] || '';
  return !!mp && prefix.startsWith(mp);
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
  if (userMajor) {
    const mjCode = normalizeCode(userMajor);

    // Check exact mapping from course_code_sets
    const mjName = MAJOR_CODE_TO_NAME[mjCode as MajorCode];
    if (mjName) {
      const set = COURSE_CODE_SETS.majors[mjName as keyof typeof COURSE_CODE_SETS.majors];
      if (set && (set as readonly string[]).includes(code)) return 'major';
    }

    // Fallback: Prefix matching
    const mjPrefix = mjCode.replace(/[^A-Z]/g, '');
    if (mjPrefix && prefix.startsWith(mjPrefix)) return 'major';
  } else {
    // Only use generic major prefixes if NO user major is specified
    // This prevents 'EC' student getting credit for 'MC' courses as Major
    if (COMMON_MAJOR_PREFIXES.some((p) => prefix.startsWith(p))) return 'major';
  }

  // 5) 기초과학
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
