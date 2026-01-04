import {
  GradStatusRequestBody,
  GradStatusResponseType,
  SingleCategoryType,
  TakenCourseType,
  GradCategoriesType,
} from '@lib/types/grad';
import { RuleEvalContext, RuleSet, CategoryRule } from '@lib/types/grad-matcher-rule-types';
import { RULESETS } from '@utils/graduation/rules/rule-sets';
import { matchesAny } from './matcher';

function selectRuleSet(entryYear: number, ruleSets: RuleSet[]): RuleSet {
  const candidates = ruleSets.filter((rs) => {
    const { fromYear, toYear } = rs.cohort;
    return entryYear >= fromYear && (toYear === undefined || entryYear <= toYear);
  });

  if (candidates.length === 0) {
    // fallback: fromYear가 가장 작은 룰
    return [...ruleSets].sort((a, b) => a.cohort.fromYear - b.cohort.fromYear)[0];
  }

  // fromYear가 큰(더 구체적인) 룰 우선
  return candidates.sort((a, b) => b.cohort.fromYear - a.cohort.fromYear)[0];
}

function keyOf(course: TakenCourseType): string {
  // 재수강/학기 구분을 포함하고 싶으면 year/semester 포함 유지
  return `${course.year}-${course.semester}-${course.courseCode}`;
}

function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function buildCategoryStatus(
  rule: CategoryRule,
  matched: TakenCourseType[],
  totalCredits: number,
  satisfied: boolean
): SingleCategoryType {
  const tpl = rule.messageTemplate ?? {
    satisfied: '충족됨 — 최소 {min}학점, 현재 {total}학점',
    unsatisfied: '미충족 — 최소 {min}학점 필요, 현재 {total}학점 (부족 {lack}학점)',
    noneRequired: '필수 이수학점이 없는 영역입니다.',
  };

  const noRequirement = rule.minCredits === 0 && rule.matchers.length === 0;

  let msg: string;
  if (noRequirement) {
    msg = tpl.noneRequired;
  } else if (satisfied) {
    msg = format(tpl.satisfied, { min: rule.minCredits, total: totalCredits });
  } else {
    msg = format(tpl.unsatisfied, {
      min: rule.minCredits,
      total: totalCredits,
      lack: Math.max(0, rule.minCredits - totalCredits),
    });
  }

  return {
    messages: [msg],
    minConditionCredits: rule.minCredits,
    satisfied: noRequirement ? true : satisfied,
    totalCredits: totalCredits,
    userTakenCoursesList: { takenCourses: matched },
  };
}

function evaluateCategory(
  rule: CategoryRule,
  pool: TakenCourseType[],
  ctx: RuleEvalContext
): { status: SingleCategoryType; consumedKeys: Set<string> } {
  const consumes = rule.consumes ?? true;
  const noRequirement = rule.minCredits === 0 && rule.matchers.length === 0;

  const matched = noRequirement ? [] : pool.filter((c) => matchesAny(c, rule.matchers, ctx));

  const rawTotal = matched.reduce((acc, c) => acc + c.credit, 0);
  const total = rule.capCredits !== undefined ? Math.min(rawTotal, rule.capCredits) : rawTotal;

  const satisfied = noRequirement ? true : total >= rule.minCredits;

  const consumedKeys = new Set<string>();
  if (consumes) {
    for (const c of matched) consumedKeys.add(keyOf(c));
  }

  return {
    status: buildCategoryStatus(rule, matched, total, satisfied),
    consumedKeys,
  };
}

function emptyCategory(
  minCredits = 0,
  msg = '필수 이수학점이 없는 영역입니다.'
): SingleCategoryType {
  return {
    messages: [msg],
    minConditionCredits: minCredits,
    satisfied: minCredits === 0,
    totalCredits: 0,
    userTakenCoursesList: { takenCourses: [] },
  };
}

export function evaluateGradStatus(
  body: GradStatusRequestBody,
  options?: { ruleSets?: RuleSet[] }
): GradStatusResponseType {
  const ruleSets = options?.ruleSets ?? RULESETS;
  const ruleSet = selectRuleSet(body.entryYear, ruleSets);

  const ctx: RuleEvalContext = {
    userMajor: body.userMajor,
    userMinors: body.userMinors,
  };

  const totalCredits = body.takenCourses.reduce((acc, c) => acc + c.credit, 0);

  let pool = [...body.takenCourses];

  // 기본 shape을 강제로 맞춤(룰셋이 비어있어도 응답 타입 유지)
  const result: GradCategoriesType = {
    languageBasic: emptyCategory(),
    scienceBasic: emptyCategory(),
    major: emptyCategory(),
    minor: emptyCategory(),
    humanities: emptyCategory(),
    etcMandatory: emptyCategory(),
    otherUncheckedClass: emptyCategory(),
  };

  for (const rule of ruleSet.categories) {
    const { status, consumedKeys } = evaluateCategory(rule, pool, ctx);
    result[rule.id] = status;

    if ((rule.consumes ?? true) && consumedKeys.size > 0) {
      pool = pool.filter((c) => !consumedKeys.has(keyOf(c)));
    }
  }

  // 전체 충족 여부: minCredits > 0 인 카테고리는 모두 satisfied여야 true
  const requiredCats = ruleSet.categories.filter((c) => c.minCredits > 0);
  const totalSatisfied = requiredCats.every((c) => result[c.id]?.satisfied);

  return {
    graduationCategory: result,
    totalCredits,
    totalSatisfied,
  };
}
