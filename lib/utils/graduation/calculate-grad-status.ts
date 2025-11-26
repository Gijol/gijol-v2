import {
  GradCategoriesType,
  GradStatusRequestBody,
  GradStatusResponseType,
  SingleCategoryType,
} from '@lib/types/grad';
import { CategoryKey, pickRuleSet, YearRuleSet } from '@utils/graduation/grad-rules';
import { classifyCourseToCategory } from '@utils/graduation/classify-course';

function initCategories(): GradCategoriesType {
  const empty = (): SingleCategoryType => ({
    messages: [],
    minConditionCredits: 0,
    satisfied: false,
    totalCredits: 0,
    userTakenCoursesList: { takenCourses: [] },
  });
  return {
    languageBasic: empty(),
    scienceBasic: empty(),
    major: empty(),
    minor: empty(),
    humanities: empty(),
    etcMandatory: empty(),
    otherUncheckedClass: empty(),
  };
}

/**
 * GPA, 재학학기 정보가 Request에 추가되면,
 * 여기서 ruleSet.minGpaForGraduation 등을 같이 체크해서
 * totalSatisfied에 반영할 수 있다.
 */
export function calculateGradStatus(payload: GradStatusRequestBody): GradStatusResponseType {
  const { entryYear, takenCourses, userMajor, userMinors } = payload;
  const ruleSet: YearRuleSet = pickRuleSet(entryYear);
  const categories: GradCategoriesType = initCategories();

  // 1. 과목을 카테고리로 분류하고, 카테고리별 학점/리스트 누적
  for (const course of takenCourses) {
    const categoryKey: CategoryKey = classifyCourseToCategory(course, {
      entryYear,
      userMajor,
      userMinors,
    });

    const cat = categories[categoryKey];
    cat.userTakenCoursesList.takenCourses.push(course);

    // 무학점(S/U) 과목(예체능, 콜로퀴움 등)은 credit이 0일 수 있으니,
    // 엑셀에서 0으로 들어오면 합산에서 자연스럽게 제외됨.
    cat.totalCredits += course.credit ?? 0;
  }

  // 2. RuleSet 기반으로 minConditionCredits & satisfied 계산
  for (const rule of ruleSet.categories) {
    const cat = categories[rule.key];
    cat.minConditionCredits = rule.minCredits;

    if (rule.minCredits === 0) {
      // 필수 학점이 없으면 기본적으로 satisfied = true로 보고,
      // optional인 경우 메시지만 약하게 남겨둔다.
      cat.satisfied = true;
      if (!rule.optional) {
        cat.messages.push('이 영역은 최소 이수학점이 0으로 설정되어 있습니다.');
      }
      continue;
    }

    if (cat.totalCredits >= rule.minCredits) {
      cat.satisfied = true;
      cat.messages.push(`최소 이수학점(${rule.minCredits}학점)을 충족했습니다.`);
    } else {
      cat.satisfied = false;
      const diff = rule.minCredits - cat.totalCredits;
      cat.messages.push(`최소 이수학점(${rule.minCredits}학점)까지 ${diff}학점 부족합니다.`);
    }
  }

  // 3. 전체 총학점 계산
  const totalCredits = takenCourses.reduce((sum, c) => sum + c.credit, 0);

  // 4. 전체 졸업요건 만족 여부
  // - 총 학점 >= ruleSet.minTotalCredits (일반 졸업 기준 130학점)
  // - 언어/인문/기초과학/전공/연구&기타 등의 필수 카테고리가 모두 satisfied
  const requiredKeys: CategoryKey[] = [
    'languageBasic',
    'scienceBasic',
    'humanities',
    'major',
    'etcMandatory',
    // minor는 rule에서 optional로 세팅되어 있고, 그럴 경우 여기서 체크하지 않았다고 가정
  ];

  const allRequiredSatisfied =
    totalCredits >= ruleSet.minTotalCredits &&
    requiredKeys.every((key) => categories[key].satisfied);

  const graduationCategory: GradCategoriesType = categories;

  const response: GradStatusResponseType = {
    graduationCategory,
    totalCredits,
    totalSatisfied: allRequiredSatisfied,
  };

  return response;
}
