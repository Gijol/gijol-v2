/**
 * 추천 과목 훅
 * - source-backed graduation recommendation adapter를 실제 서비스 UI에 연결한다.
 * - 수강중(in_progress) 과목도 이미 target에 올라간 과목으로 보고 추천에서 제외한다.
 */

import { useMemo } from 'react';
import type { RecommendedCourse, DomainRecommendation } from '../types/recommended-course';
import { useGraduationStore } from '../stores/useGraduationStore';
import { extractOverallStatus } from '@utils/graduation/grad-formatter';
import {
  DEFAULT_RECOMMENDATION_DISPLAY_POLICY,
  buildGraduationRecommendationGroups,
  type GraduationRecommendationGroups,
  type RecommendationItem,
} from '@features/graduation/data';

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

function toRecommendedCourse(recommendation: RecommendationItem): RecommendedCourse {
  return {
    courseCode: recommendation.courseCode,
    courseName: recommendation.courseName,
    credit: recommendation.credit,
    category: recommendation.reason,
  };
}

export function useRecommendedCourses() {
  const { gradStatus, userMajor, userMinors, takenCourses } = useGraduationStore();
  const overallProps = extractOverallStatus(gradStatus);

  const recommendationGroups = useMemo(() => {
    if (!gradStatus) {
      return {
        recommendations: [] as RecommendationItem[],
        allRecommendations: [] as RecommendationItem[],
        byCategoryKey: {} as Record<string, RecommendationItem[]>,
        allByCategoryKey: {} as Record<string, RecommendationItem[]>,
        takenCourseCodes: new Set<string>(),
        suppressions: [],
        policy: DEFAULT_RECOMMENDATION_DISPLAY_POLICY,
      } satisfies GraduationRecommendationGroups;
    }

    return buildGraduationRecommendationGroups({
      result: gradStatus,
      userMajor,
      userMinors,
      takenCourses,
    });
  }, [gradStatus, userMajor, userMinors, takenCourses]);

  const getRecommendationsForDomain = (domain: string): RecommendedCourse[] => {
    const categoryKey = DOMAIN_TO_CATEGORY_KEY[domain] ?? domain;
    return (recommendationGroups.byCategoryKey[categoryKey] ?? []).map(toRecommendedCourse);
  };

  const getAllRecommendationsForDomain = (domain: string): RecommendedCourse[] => {
    const categoryKey = DOMAIN_TO_CATEGORY_KEY[domain] ?? domain;
    return (recommendationGroups.allByCategoryKey[categoryKey] ?? []).map(toRecommendedCourse);
  };

  const getRecommendationSuppressionsForDomain = (domain: string) => {
    const categoryKey = DOMAIN_TO_CATEGORY_KEY[domain] ?? domain;
    return recommendationGroups.suppressions.filter((suppression) => suppression.categoryKey === categoryKey);
  };

  const domainRecommendations: DomainRecommendation[] = useMemo(() => {
    if (!overallProps?.categoriesArr) return [];

    return overallProps.categoriesArr
      .filter(({ status }) => !status?.satisfied)
      .map(({ domain }) => ({
        domain,
        recommendedCourses: getRecommendationsForDomain(domain),
      }))
      .filter((rec) => rec.recommendedCourses.length > 0);
  }, [overallProps, recommendationGroups]);

  const allRecommendations: RecommendedCourse[] = useMemo(
    () => recommendationGroups.allRecommendations.map(toRecommendedCourse),
    [recommendationGroups],
  );

  return {
    domainRecommendations,
    getRecommendationsForDomain,
    getAllRecommendationsForDomain,
    getRecommendationSuppressionsForDomain,
    allRecommendations,
    takenCourseCodes: recommendationGroups.takenCourseCodes,
    recommendationSuppressions: recommendationGroups.suppressions,
    recommendationPolicy: recommendationGroups.policy,
  };
}
