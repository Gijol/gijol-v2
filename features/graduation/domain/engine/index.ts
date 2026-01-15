import {
  GradStatusResponseType,
  UserTakenCourseListType,
  GradCategoriesType,
  SingleCategoryType,
  TakenCourseType,
  FineGrainedRequirement,
  CategoryKey,
  YearRuleSet,
} from '../types';
import { pickRuleSet } from '../rules';
import { classifyCourse } from '../classifier';
import { buildFineGrainedRequirements } from '../requirements';

export interface GradStatusResponseV2 extends GradStatusResponseType {
  fineGrainedRequirements: FineGrainedRequirement[];
}

interface EngineContext {
  entryYear: number;
  userMajor?: string;
  userMinors?: string[];
}

interface EngineDeps {
  recommend?: (deficits: Record<string, number>) => Promise<any>;
}

// Helper to build a single category status
function buildCategoryStatus(key: CategoryKey, courses: TakenCourseType[], minCredits: number): SingleCategoryType {
  const total = courses.reduce((acc, c) => acc + (c.credit || 0), 0);
  const satisfied = total >= minCredits;

  const messages: string[] = [];
  if (minCredits > 0) {
    if (satisfied) {
      messages.push(`충족됨 — 최소 ${minCredits}학점, 현재 ${total}학점`);
    } else {
      messages.push(`미충족 — 최소 ${minCredits}학점 필요, 현재 ${total}학점 (부족 ${minCredits - total}학점)`);
    }
  } else {
    messages.push('필수 이수학점이 없는 영역입니다.');
  }

  return {
    messages,
    minConditionCredits: minCredits,
    satisfied,
    totalCredits: total,
    userTakenCoursesList: { takenCourses: courses },
  };
}

/**
 * Pure function: Evaluates graduation status based on inputs.
 * Uses the existing business logic from lib/utils/graduation.
 */
export const evaluateGraduationStatus = async (
  input: { takenCourses: UserTakenCourseListType; ruleContext: EngineContext },
  deps?: EngineDeps,
): Promise<GradStatusResponseV2> => {
  const { takenCourses } = input.takenCourses;
  const { entryYear, userMajor, userMinors } = input.ruleContext;

  // 1. Get Rules
  const ruleSet: YearRuleSet = pickRuleSet(entryYear);

  // 2. Classify Courses
  const grouped: Record<CategoryKey, TakenCourseType[]> = {
    languageBasic: [],
    scienceBasic: [],
    major: [],
    minor: [],
    humanities: [],
    etcMandatory: [],
    otherUncheckedClass: [],
  };

  takenCourses.forEach((course) => {
    const key = classifyCourse(course, userMajor, userMinors);
    if (grouped[key]) {
      grouped[key].push(course);
    }
  });

  // 3. Build Categories
  const graduationCategory = {} as GradCategoriesType;

  // Initialize with rules
  ruleSet.categories.forEach((rule) => {
    graduationCategory[rule.key] = buildCategoryStatus(rule.key, grouped[rule.key] || [], rule.minCredits);
  });

  // Fill missing keys with default empty status
  (Object.keys(grouped) as CategoryKey[]).forEach((key) => {
    if (!graduationCategory[key]) {
      graduationCategory[key] = buildCategoryStatus(key, grouped[key] || [], 0);
    }
  });

  // 4. Calculate Total Credits
  const totalCredits = takenCourses.reduce((acc, c) => acc + (c.credit || 0), 0);

  // 5. Fine-grained Requirements
  const fineGrainedRequirements = buildFineGrainedRequirements({
    allCourses: takenCourses,
    grouped,
    ruleSet,
    entryYear,
    userMajor,
    userMinors: userMinors || [],
  });

  // 6. Refine Category Satisfaction based on Fine-grained Requirements
  // (If a fine-grained 'must' requirement is missing, the whole category is unsatisfied)
  (Object.keys(graduationCategory) as CategoryKey[]).forEach((key) => {
    const cat = graduationCategory[key];
    const hardReqs = fineGrainedRequirements.filter(
      (r) => r.categoryKey === key && r.importance === 'must' && r.requiredCredits > 0,
    );

    if (hardReqs.length > 0) {
      if (!hardReqs.every((r) => r.satisfied)) {
        cat.satisfied = false;
      }
    }
  });

  // 7. Push fine-grained messages to categories
  fineGrainedRequirements.forEach((req) => {
    if (!req.satisfied && req.requiredCredits > 0 && req.importance === 'must') {
      const cat = graduationCategory[req.categoryKey];
      const hint = req.hint ? ` (${req.hint})` : '';
      cat.messages.push(`[필수] ${req.label} 미충족${hint}`);
    }
  });

  // 8. Overall Satisfaction
  const categoriesSatisfied = ruleSet.categories
    .filter((c) => !c.optional)
    .every((c) => graduationCategory[c.key].satisfied);

  const totalSatisfied = categoriesSatisfied && totalCredits >= ruleSet.minTotalCredits;

  return {
    graduationCategory,
    totalCredits,
    totalSatisfied,
    fineGrainedRequirements,
  };
};
