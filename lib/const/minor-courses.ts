/**
 * 부전공 과목 데이터 및 유틸리티
 * - DB/minor/*.json 파일 데이터를 타입 안전하게 제공
 * - 부전공 코드 → 과목 목록 매핑
 */

import type { RecommendedCourse } from '../types/recommended-course';

// ========== 타입 정의 ==========

export interface MinorCourseInfo {
  courseCode: string;
  courseName: string;
  credits: number;
  category: string;
  classification: 'Basic Mandatory' | 'Major Mandatory' | 'Major Elective' | 'Basic Elective' | 'Planned';
}

export interface MinorCourseData {
  'Basic Mandatory'?: MinorCourseInfo[];
  'Major Mandatory'?: MinorCourseInfo[];
  'Major Elective'?: MinorCourseInfo[];
  'Basic Elective'?: MinorCourseInfo[];
  Planned?: MinorCourseInfo[];
}

// ========== 부전공 코드 → JSON 파일명 매핑 ==========

const MINOR_CODE_TO_FILE: Record<string, string> = {
  // 자연과학/공학
  EC: 'eecs',
  MA: 'material',
  MC: 'mechanical',
  EV: 'environmental',
  BS: 'bioscience',
  PS: 'physical_optics',
  CH: 'chemistry',
  MM: 'math',

  // 융합/특수
  CT: 'culture',
  IR: 'robot',
  AI: 'ai',
  FE: 'energy',
  MD: 'biomedical',
  SE: 'eecs', // 반도체는 EECS 과목 일부 사용

  // 인문사회
  LH_LIT: 'literature_history',
  LH_PP: 'law_politics',
  LH_EB: 'economics',
  LH_SS: 'science_society',
  LH_MB: 'mind_behavior',
};

// ========== JSON 데이터 임포트 ==========
// Note: 동적 import가 아닌 정적 import로 번들링

import eecsCourses from '../../DB/minor/eecs.json';
import mathCourses from '../../DB/minor/math.json';
import materialCourses from '../../DB/minor/material.json';
import mechanicalCourses from '../../DB/minor/mechanical.json';
import environmentalCourses from '../../DB/minor/environmental.json';
import bioscienceCourses from '../../DB/minor/bioscience.json';
import physicalOpticsCourses from '../../DB/minor/physical_optics.json';
import chemistryCourses from '../../DB/minor/chemistry.json';
import cultureCourses from '../../DB/minor/culture.json';
import robotCourses from '../../DB/minor/robot.json';
import aiCourses from '../../DB/minor/ai.json';
import energyCourses from '../../DB/minor/energy.json';
import biomedicalCourses from '../../DB/minor/biomedical.json';
import literatureHistoryCourses from '../../DB/minor/literature_history.json';
import lawPoliticsCourses from '../../DB/minor/law_politics.json';
import economicsCourses from '../../DB/minor/economics.json';
import scienceSocietyCourses from '../../DB/minor/science_society.json';
import mindBehaviorCourses from '../../DB/minor/mind_behavior.json';

const MINOR_DATA_MAP: Record<string, MinorCourseData> = {
  eecs: eecsCourses as MinorCourseData,
  math: mathCourses as MinorCourseData,
  material: materialCourses as MinorCourseData,
  mechanical: mechanicalCourses as MinorCourseData,
  environmental: environmentalCourses as MinorCourseData,
  bioscience: bioscienceCourses as MinorCourseData,
  physical_optics: physicalOpticsCourses as MinorCourseData,
  chemistry: chemistryCourses as MinorCourseData,
  culture: cultureCourses as MinorCourseData,
  robot: robotCourses as MinorCourseData,
  ai: aiCourses as MinorCourseData,
  energy: energyCourses as MinorCourseData,
  biomedical: biomedicalCourses as MinorCourseData,
  literature_history: literatureHistoryCourses as MinorCourseData,
  law_politics: lawPoliticsCourses as MinorCourseData,
  economics: economicsCourses as MinorCourseData,
  science_society: scienceSocietyCourses as MinorCourseData,
  mind_behavior: mindBehaviorCourses as MinorCourseData,
};

// ========== 유틸리티 함수 ==========

/**
 * 부전공 코드로 해당 부전공의 과목 데이터 조회
 */
export function getMinorCourseData(minorCode: string): MinorCourseData | null {
  const fileName = MINOR_CODE_TO_FILE[minorCode];
  if (!fileName) return null;
  return MINOR_DATA_MAP[fileName] || null;
}

/**
 * 부전공의 모든 과목 조회 (분류 무관)
 */
export function getMinorAllCourses(minorCode: string): MinorCourseInfo[] {
  const data = getMinorCourseData(minorCode);
  if (!data) return [];

  const allCourses: MinorCourseInfo[] = [];
  if (data['Basic Mandatory']) allCourses.push(...data['Basic Mandatory']);
  if (data['Major Mandatory']) allCourses.push(...data['Major Mandatory']);
  if (data['Major Elective']) allCourses.push(...data['Major Elective']);
  if (data['Basic Elective']) allCourses.push(...data['Basic Elective']);
  // Planned는 제외 (아직 개설되지 않은 과목)

  return allCourses;
}

/**
 * 부전공의 필수 과목(Major Mandatory) 조회
 */
export function getMinorMandatoryCourses(minorCode: string): MinorCourseInfo[] {
  const data = getMinorCourseData(minorCode);
  if (!data) return [];
  return data['Major Mandatory'] || [];
}

/**
 * 부전공의 선택 과목(Major Elective) 조회
 */
export function getMinorElectiveCourses(minorCode: string): MinorCourseInfo[] {
  const data = getMinorCourseData(minorCode);
  if (!data) return [];
  return data['Major Elective'] || [];
}

/**
 * MinorCourseInfo를 RecommendedCourse로 변환
 */
export function toRecommendedCourse(course: MinorCourseInfo): RecommendedCourse {
  return {
    courseCode: course.courseCode,
    courseName: course.courseName,
    credit: course.credits,
    category: course.category,
  };
}

/**
 * 부전공의 추천 과목 조회 (이수 과목 제외, 우선순위 정렬)
 * @param minorCode 부전공 코드
 * @param takenCodes 이수한 과목 코드 Set
 * @returns 추천 과목 목록 (필수 > 선택 순서)
 */
export function getMinorRecommendations(minorCode: string, takenCodes: Set<string>): RecommendedCourse[] {
  // 1. 필수 과목 (Major Mandatory) 중 미이수
  const mandatoryCourses = getMinorMandatoryCourses(minorCode)
    .filter((c) => !takenCodes.has(c.courseCode))
    .map(toRecommendedCourse);

  // 2. 선택 과목 (Major Elective) 중 미이수
  const electiveCourses = getMinorElectiveCourses(minorCode)
    .filter((c) => !takenCodes.has(c.courseCode))
    .map(toRecommendedCourse);

  // 3. 중복 제거 (과목 코드 기준)
  const seenCodes = new Set<string>();
  const result: RecommendedCourse[] = [];

  for (const course of [...mandatoryCourses, ...electiveCourses]) {
    if (!seenCodes.has(course.courseCode)) {
      seenCodes.add(course.courseCode);
      result.push(course);
    }
  }

  return result;
}

/**
 * 지원하는 부전공 코드 목록
 */
export function getSupportedMinorCodes(): string[] {
  return Object.keys(MINOR_CODE_TO_FILE);
}
