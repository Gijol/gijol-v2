// grad-calc-v2.ts
import type {
  GradStatusRequestBody,
  GradStatusResponseType,
  TakenCourseType,
  SingleCategoryType,
} from '@lib/types/grad';

import { FineGrainedRequirement } from '@lib/types/grad-requirements';
import { CategoryKey, pickRuleSet, YearRuleSet } from './grad-rules';
import { classifyCourse } from './grad-classifier';
import { buildFineGrainedRequirements } from './grad-requirements';

export interface GradStatusResponseV2 extends GradStatusResponseType {
  // 세부 요건 단위 리스트
  fineGrainedRequirements: FineGrainedRequirement[];
}


// 기존 buildSingleCategory 재활용 (필요하다면 약간 확장)
function buildSingleCategory(
  categoryKey: CategoryKey,
  takenCourses: TakenCourseType[],
  minConditionCredits: number
): SingleCategoryType {
  const totalCredits = takenCourses.reduce((s, c) => s + (Number(c.credit) || 0), 0);
  const required = minConditionCredits || 0;
  const satisfied = totalCredits >= required;

  const messages: string[] = [];
  if (required === 0) {
    messages.push('필수 이수학점이 없는 영역입니다.');
  } else if (satisfied) {
    messages.push(`충족됨 — 최소 ${required}학점, 현재 ${totalCredits}학점`);
  } else {
    messages.push(
      `미충족 — 최소 ${required}학점 필요, 현재 ${totalCredits}학점 (부족 ${
        required - totalCredits
      }학점)`
    );
  }

  return {
    messages,
    minConditionCredits: required,
    satisfied,
    totalCredits,
    userTakenCoursesList: { takenCourses },
  };
}

// 메인 함수
export function calculateGradStatusV2(
  body: GradStatusRequestBody & { entryYear: number }
): GradStatusResponseV2 {
  const { takenCourses = [], userMajor, userMinors, entryYear } = body;

  const ruleSet: YearRuleSet = pickRuleSet(entryYear);

  // 1) 카테고리별 그룹핑
  const grouped: Record<CategoryKey, TakenCourseType[]> = {
    languageBasic: [],
    scienceBasic: [],
    major: [],
    minor: [],
    humanities: [],
    etcMandatory: [],
    otherUncheckedClass: [],
  };

  for (const c of takenCourses) {
    let k: CategoryKey = 'otherUncheckedClass';
    try {
      // 기존 classifyCourse 함수 재활용
      // (import { classifyCourse } from './calculateGradStatus-old' 등으로 빼놓으면 좋음)
      // 여기서는 이미 정의되어 있다고 가정
      // eslint-disable-next-line no-undef
      k = classifyCourse(c, userMajor, userMinors);
    } catch {
      k = 'otherUncheckedClass';
    }
    grouped[k].push(c);
  }

  // 2) ruleSet 기반으로 카테고리별 SingleCategory 생성
  const graduationCategory = {} as GradStatusResponseType['graduationCategory'];

  for (const rule of ruleSet.categories) {
    const key = rule.key;
    const bucket = grouped[key] ?? [];
    const cat = buildSingleCategory(key, bucket, rule.minCredits);
    graduationCategory[key] = cat;
  }

  // 혹시 ruleSet에 없는 카테고리가 있으면 기본 0으로 채워줌
  (['languageBasic', 'scienceBasic', 'major', 'minor', 'humanities', 'etcMandatory', 'otherUncheckedClass'] as CategoryKey[]).forEach(
    (key) => {
      if (!graduationCategory[key]) {
        graduationCategory[key] = buildSingleCategory(key, grouped[key] ?? [], 0);
      }
    }
  );

  // 3) 총 학점
  const totalCredits = takenCourses.reduce((s, c) => s + (Number(c.credit) || 0), 0);

  // 4) 세부 요건 리스트 생성
  const fineGrainedRequirements = buildFineGrainedRequirements({
    allCourses: takenCourses,
    grouped,
    ruleSet,
  });

  // 5) 세부 요건을 기준으로 카테고리 satisfied 보정
  //    (예: 인문사회 24학점은 채웠지만 PPE 6을 못 채웠으면 humanities.satisfied = false)
  (Object.keys(graduationCategory) as CategoryKey[]).forEach((key) => {
    const cat = graduationCategory[key];
    const hardReqs = fineGrainedRequirements.filter(
      (r) => r.categoryKey === key && r.importance === 'must' && r.requiredCredits > 0
    );
    if (hardReqs.length === 0) return;

    const allHardSatisfied = hardReqs.every((r) => r.satisfied);
    if (!allHardSatisfied) {
      cat.satisfied = false;
    }
  });

  // 6) 카테고리 메시지에 세부 요건 미충족 정보 push
  fineGrainedRequirements.forEach((req) => {
    if (!req.satisfied && req.requiredCredits > 0 && req.importance === 'must') {
      const cat = graduationCategory[req.categoryKey];
      const suffix = req.missingCredits
        ? ` (부족 ${req.missingCredits}학점)`
        : '';
      cat.messages.push(
        `[세부요건 미충족] ${req.label} — 최소 ${req.requiredCredits}학점 중 현재 ${req.acquiredCredits}학점 이수${suffix}${
          req.hint ? ` / ${req.hint}` : ''
        }`
      );
    }
  });

  // 7) 전체 졸업 요건 충족 여부
  const requiredSatisfied = ruleSet.categories
    .filter((c) => !c.optional)
    .every((c) => graduationCategory[c.key].satisfied);

  const totalSatisfied = requiredSatisfied && totalCredits >= ruleSet.minTotalCredits;


  const base: GradStatusResponseType = {
    graduationCategory,
    totalCredits,
    totalSatisfied,
  };

  const extended: GradStatusResponseV2 = {
    ...base,
    fineGrainedRequirements,
  };

  return extended;
}
