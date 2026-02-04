/**
 * 추천 과목 훅
 * - 졸업요건 영역별 추천 과목 목록 제공
 * - 세부 요건(fineGrainedRequirements) 기반 추천: 미충족 세부 요건에 해당하는 과목만 추천
 * - 로드맵 기능에서도 재사용 가능하도록 설계
 * - 우선순위: Hard Mandatory → Language → HUS/PPE → Software → Science → Major
 */

import { useMemo } from 'react';
import type { RecommendedCourse, DomainRecommendation } from '../types/recommended-course';
import { useGraduationStore } from '../stores/useGraduationStore';
import { extractOverallStatus } from '@utils/graduation/grad-formatter';
import {
  ETC_MANDATORY_COURSES,
  LANGUAGE_BASIC_COURSES,
  HUS_COURSES,
  PPE_COURSES,
  SOFTWARE_COURSES,
  MATH_COURSES,
  PHYSICS_COURSES,
  CHEMISTRY_COURSES,
  BIOLOGY_COURSES,
  MAJOR_EC_COURSES,
  // 세부 요건별 과목 그룹
  ENGLISH_I_COURSES,
  ENGLISH_II_COURSES,
  WRITING_COURSES,
  CALCULUS_COURSES,
  CORE_MATH_COURSES,
  FRESHMAN_COURSES,
  EXPLORATION_COURSES,
  COLLOQUIUM_COURSES,
  SCIENCE_ECONOMY_COURSES,
  getOfferedCourses,
  type CourseMaster,
} from '../const/course-master';
import type { FineGrainedRequirement } from '../types/grad-requirements';

// CourseMaster를 RecommendedCourse로 변환
function toRecommendedCourse(course: CourseMaster): RecommendedCourse {
  return {
    courseCode: course.courseCode,
    courseName: course.courseNameKo,
    credit: course.credits,
    category: course.department,
  };
}

// 도메인명 → 카테고리키 매핑
const DOMAIN_TO_CATEGORY_KEY: Record<string, string> = {
  '언어와 기초': 'languageBasic',
  언어기초: 'languageBasic',
  languageBasic: 'languageBasic',
  기초과학: 'scienceBasic',
  scienceBasic: 'scienceBasic',
  인문사회: 'humanities',
  humanities: 'humanities',
  전공: 'major',
  major: 'major',
  부전공: 'minor',
  minor: 'minor',
  '연구 및 기타': 'etcMandatory',
  기타필수: 'etcMandatory',
  etcMandatory: 'etcMandatory',
  자유학점: 'otherUncheckedClass',
  otherUncheckedClass: 'otherUncheckedClass',
};

// 세부 요건 ID → 추천 과목 매핑 (개설 과목만)
const FINE_GRAINED_COURSE_MAP: Record<string, CourseMaster[]> = {
  // 언어기초
  'language-english-i': getOfferedCourses(ENGLISH_I_COURSES),
  'language-english-ii': getOfferedCourses(ENGLISH_II_COURSES),
  'language-writing': getOfferedCourses(WRITING_COURSES),

  // 기초과학
  'science-calculus': getOfferedCourses(CALCULUS_COURSES),
  'science-core-math': getOfferedCourses(CORE_MATH_COURSES),
  'science-sw-basic': getOfferedCourses(SOFTWARE_COURSES),
  'science-total': getOfferedCourses([
    ...MATH_COURSES,
    ...PHYSICS_COURSES,
    ...CHEMISTRY_COURSES,
    ...BIOLOGY_COURSES,
    ...SOFTWARE_COURSES,
  ]),

  // 인문사회
  'humanities-hus': getOfferedCourses(HUS_COURSES),
  'humanities-ppe': getOfferedCourses(PPE_COURSES),
  'humanities-total': getOfferedCourses([...HUS_COURSES, ...PPE_COURSES]),

  // 기타필수
  'etc-freshman': getOfferedCourses(FRESHMAN_COURSES),
  'etc-major-exploration': getOfferedCourses(EXPLORATION_COURSES),
  'etc-colloquium': getOfferedCourses(COLLOQUIUM_COURSES),
  'etc-science-economy': getOfferedCourses(SCIENCE_ECONOMY_COURSES),
  'thesis-i': [], // 논문은 전공별로 다름 (추천 불가)
  'thesis-ii': [],

  // 전공 (기본: EC)
  'major-credits': getOfferedCourses(MAJOR_EC_COURSES),

  // 예체능 (추천 불필요 - 학교에서 별도 관리)
  arts: [],
  sports: [],
};

// 중복 제거 헬퍼
function deduplicateByCourseCode(courses: RecommendedCourse[]): RecommendedCourse[] {
  const seen = new Set<string>();
  return courses.filter((c) => {
    if (seen.has(c.courseCode)) return false;
    seen.add(c.courseCode);
    return true;
  });
}

// 졸업요건 영역별 실제 과목 데이터 (개설된 과목만)
// 주의: 도메인 키는 grad-formatter.tsx의 extractOverallStatus에서 사용하는 한글명과 일치해야 함
const DOMAIN_RECOMMENDATIONS: Record<string, RecommendedCourse[]> = {
  // 기타필수 / 연구 및 기타 (Hard Mandatory - 최우선)
  etcMandatory: getOfferedCourses(ETC_MANDATORY_COURSES).map(toRecommendedCourse),
  '연구 및 기타': getOfferedCourses(ETC_MANDATORY_COURSES).map(toRecommendedCourse),
  기타필수: getOfferedCourses(ETC_MANDATORY_COURSES).map(toRecommendedCourse),

  // 언어기초 / 언어와 기초 (영어 + 글쓰기)
  languageBasic: getOfferedCourses(LANGUAGE_BASIC_COURSES).map(toRecommendedCourse),
  '언어와 기초': getOfferedCourses(LANGUAGE_BASIC_COURSES).map(toRecommendedCourse),
  언어기초: getOfferedCourses(LANGUAGE_BASIC_COURSES).map(toRecommendedCourse),

  // 인문사회 (HUS + PPE)
  humanities: getOfferedCourses([...HUS_COURSES, ...PPE_COURSES]).map(toRecommendedCourse),
  인문사회: getOfferedCourses([...HUS_COURSES, ...PPE_COURSES]).map(toRecommendedCourse),

  // SW 필수 (기초과학에 포함될 수 있음)
  software: getOfferedCourses(SOFTWARE_COURSES).map(toRecommendedCourse),
  SW필수: getOfferedCourses(SOFTWARE_COURSES).map(toRecommendedCourse),

  // 기초과학 (수학 + 물리 + 화학 + 생물 + SW)
  scienceBasic: getOfferedCourses([
    ...MATH_COURSES,
    ...PHYSICS_COURSES,
    ...CHEMISTRY_COURSES,
    ...BIOLOGY_COURSES,
    ...SOFTWARE_COURSES,
  ]).map(toRecommendedCourse),
  기초과학: getOfferedCourses([
    ...MATH_COURSES,
    ...PHYSICS_COURSES,
    ...CHEMISTRY_COURSES,
    ...BIOLOGY_COURSES,
    ...SOFTWARE_COURSES,
  ]).map(toRecommendedCourse),

  // 전공 - EC(전기전자컴퓨터공학) 기본, 추후 userMajor 기반 확장 가능
  major: getOfferedCourses(MAJOR_EC_COURSES).map(toRecommendedCourse),
  전공: getOfferedCourses(MAJOR_EC_COURSES).map(toRecommendedCourse),

  // 부전공 - 현재 데이터 없음
  minor: [],
  부전공: [],

  // 자유학점 - 모든 영역 과목 가능
  otherUncheckedClass: [],
  자유학점: [],
};

export function useRecommendedCourses() {
  const { gradStatus } = useGraduationStore();

  // 졸업 상태에서 영역별 정보 추출
  const overallProps = extractOverallStatus(gradStatus);

  // 세부 요건 정보 (fineGrainedRequirements)
  const fineGrainedReqs: FineGrainedRequirement[] = gradStatus?.fineGrainedRequirements ?? [];

  // 이수한 과목 코드 Set 생성 (필터링용)
  const takenCourseCodes = useMemo(() => {
    if (!gradStatus?.graduationCategory) return new Set<string>();

    const allTakenCourses = Object.values(gradStatus.graduationCategory).flatMap(
      (cat) => cat?.userTakenCoursesList?.takenCourses ?? [],
    );

    return new Set(allTakenCourses.map((c) => c.courseCode));
  }, [gradStatus]);

  // 이수한 과목을 제외한 추천 과목 필터링
  const filterTakenCourses = (courses: RecommendedCourse[]): RecommendedCourse[] => {
    return courses.filter((c) => !takenCourseCodes.has(c.courseCode));
  };

  /**
   * 세부 요건 기반 추천 과목 조회
   * - fineGrainedRequirements가 있으면: 미충족 세부 요건에 해당하는 과목만 추천
   * - fineGrainedRequirements가 없으면: 기존 영역 전체 추천 방식 fallback
   */
  const getRecommendationsForDomain = (domain: string): RecommendedCourse[] => {
    const categoryKey = DOMAIN_TO_CATEGORY_KEY[domain];

    // fineGrainedRequirements가 없으면 기존 방식 fallback
    if (fineGrainedReqs.length === 0) {
      return filterTakenCourses(DOMAIN_RECOMMENDATIONS[domain] ?? []);
    }

    // 해당 도메인의 미충족 세부 요건 찾기
    const unsatisfiedReqs = fineGrainedReqs.filter(
      (req) => req.categoryKey === categoryKey && !req.satisfied,
    );

    // 미충족 세부 요건이 없으면 빈 배열 (이미 충족됨)
    if (unsatisfiedReqs.length === 0) {
      return [];
    }

    // 미충족 세부 요건에 해당하는 과목만 수집
    const recommendations: RecommendedCourse[] = [];
    for (const req of unsatisfiedReqs) {
      const courses = FINE_GRAINED_COURSE_MAP[req.id] ?? [];
      recommendations.push(...courses.map(toRecommendedCourse));
    }

    // 중복 제거 및 이수 과목 필터링
    const uniqueCourses = deduplicateByCourseCode(recommendations);
    return filterTakenCourses(uniqueCourses);
  };

  // 미충족 영역별 추천 과목 목록 (세부 요건 기반)
  const domainRecommendations: DomainRecommendation[] = useMemo(() => {
    if (!overallProps?.categoriesArr) return [];

    return overallProps.categoriesArr
      .filter(({ status }) => !status?.satisfied)
      .map(({ domain }) => ({
        domain,
        recommendedCourses: getRecommendationsForDomain(domain),
      }))
      .filter((rec) => rec.recommendedCourses.length > 0);
  }, [overallProps, takenCourseCodes, fineGrainedReqs]);

  // 모든 미충족 영역의 추천 과목 (로드맵 용)
  const allRecommendations: RecommendedCourse[] = useMemo(() => {
    return domainRecommendations.flatMap((rec) => rec.recommendedCourses);
  }, [domainRecommendations]);

  return {
    domainRecommendations,
    getRecommendationsForDomain,
    allRecommendations,
    takenCourseCodes, // 디버깅 및 UI에서 활용 가능
  };
}
