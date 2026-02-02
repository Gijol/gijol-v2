/**
 * 추천 과목 훅
 * - 졸업요건 영역별 추천 과목 목록 제공
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
  getOfferedCourses,
  type CourseMaster,
} from '../const/course-master';

// CourseMaster를 RecommendedCourse로 변환
function toRecommendedCourse(course: CourseMaster): RecommendedCourse {
  return {
    courseCode: course.courseCode,
    courseName: course.courseNameKo,
    credit: course.credits,
    category: course.department,
  };
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

  // 미충족 영역별 추천 과목 목록 (이수한 과목 제외)
  const domainRecommendations: DomainRecommendation[] = useMemo(() => {
    if (!overallProps?.categoriesArr) return [];

    return overallProps.categoriesArr
      .filter(({ status }) => !status?.satisfied)
      .map(({ domain }) => ({
        domain,
        recommendedCourses: filterTakenCourses(DOMAIN_RECOMMENDATIONS[domain] ?? []),
      }))
      .filter((rec) => rec.recommendedCourses.length > 0);
  }, [overallProps, takenCourseCodes]);

  // 특정 영역의 추천 과목 조회 (이수한 과목 제외)
  const getRecommendationsForDomain = (domain: string): RecommendedCourse[] => {
    return filterTakenCourses(DOMAIN_RECOMMENDATIONS[domain] ?? []);
  };

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
