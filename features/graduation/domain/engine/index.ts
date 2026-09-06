import {
  GradStatusResponseType,
  UserTakenCourseListType,
  GradCategoriesType,
  SingleCategoryType,
  TakenCourseType,
  FineGrainedRequirement,
  CategoryKey,
  YearRuleSet,
  RequirementEvaluationStatus,
  GraduationOverallStatus,
  MinorDeclarationTerms,
  GraduationCatalogSelectionSummary,
} from '../types';
import { pickRuleSet } from '../rules';
import { classifyCourse } from '../classifier';
import { buildFineGrainedRequirements } from '../requirements';
import { resolveMajorCode } from '../academic-context';
import { buildGraduationCatalogSelectionSummary } from '../rule-catalog/selection-adapter';
import { isEarnedCreditCourse } from '@utils/course/credits';
import { calculateRecognizedCredits } from '../recognized-credits';
import { allocateScienceCourses, compareScienceCourseOrder } from '../science-allocation';
import { getCoreMathCodes } from '../rule-catalog/science-courses';
import { MATH_CALCULUS } from '../constants/classifier-constants';
import { getMajorCreditRequirement } from '../rule-catalog/major-minor-requirements';

export interface GradStatusResponseV2 extends GradStatusResponseType {
  fineGrainedRequirements: FineGrainedRequirement[];
  catalogSelection: GraduationCatalogSelectionSummary;
}

interface EngineContext {
  entryYear: number;
  userMajor?: string;
  userMinors?: string[];
  minorDeclarationTerms?: MinorDeclarationTerms;
}

interface EngineDeps {
  recommend?: (deficits: Record<string, number>) => Promise<any>;
}

function getRequirementStatus(req: FineGrainedRequirement): RequirementEvaluationStatus {
  return req.status ?? (req.satisfied ? 'satisfied' : 'unsatisfied');
}

// ========== 부전공 vs 기초과학 재분배 알고리즘 ==========
// 기초과학 요건을 먼저 충족하고, 남은 과목만 부전공으로 분류

interface MinorScienceRebalanceResult {
  minor: TakenCourseType[];
  scienceBasic: TakenCourseType[];
}

function rebalanceMinorVsScienceBasic(
  minorCourses: TakenCourseType[],
  scienceBasicCourses: TakenCourseType[],
  entryYear: number,
): MinorScienceRebalanceResult {
  // 1. 현재 기초과학의 수학 요건 충족 여부 확인
  const existingMathCalc = scienceBasicCourses.filter((c) => MATH_CALCULUS.has(c.courseCode));
  const existingMathElec = scienceBasicCourses.filter((c) => getCoreMathCodes(entryYear).includes(c.courseCode));

  const hasCalculus = existingMathCalc.length > 0;
  const hasElective = existingMathElec.length > 0;

  // 이미 충족되면 그대로 반환
  if (hasCalculus && hasElective) {
    return { minor: minorCourses, scienceBasic: scienceBasicCourses };
  }

  // 2. minor에서 이동 가능한 수학 과목 찾기
  const minorMathCalc = minorCourses.filter((c) => MATH_CALCULUS.has(c.courseCode));
  const minorMathElec = minorCourses.filter((c) => getCoreMathCodes(entryYear).includes(c.courseCode));

  const coursesToMove: TakenCourseType[] = [];

  // 미적분학 이동 (필요시)
  if (!hasCalculus && minorMathCalc.length > 0) {
    coursesToMove.push(minorMathCalc[0]);
  }

  // 수학선택 이동 (필요시, 시간순 첫 번째)
  if (!hasElective && minorMathElec.length > 0) {
    const sortedElectives = [...minorMathElec].sort(compareScienceCourseOrder);
    coursesToMove.push(sortedElectives[0]);
  }

  // 이동할 과목이 없으면 그대로 반환
  if (coursesToMove.length === 0) {
    return { minor: minorCourses, scienceBasic: scienceBasicCourses };
  }

  // 3. 결과 생성 - courseCode + year + semester로 고유 식별
  const movedKeys = new Set(coursesToMove.map((c) => `${c.courseCode}-${c.year}-${c.semester}`));

  return {
    minor: minorCourses.filter((c) => !movedKeys.has(`${c.courseCode}-${c.year}-${c.semester}`)),
    scienceBasic: [...scienceBasicCourses, ...coursesToMove],
  };
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
  const takenCourses = input.takenCourses.takenCourses.filter(isEarnedCreditCourse);
  const { entryYear, userMajor: rawUserMajor, userMinors, minorDeclarationTerms } = input.ruleContext;
  const majorResolution = resolveMajorCode(rawUserMajor);
  const userMajor = majorResolution.code;
  const unresolvedUserMajorInput =
    rawUserMajor && !majorResolution.code && majorResolution.status !== 'missing' ? rawUserMajor : undefined;

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
    const key = classifyCourse(course, userMajor, userMinors, entryYear);
    if (grouped[key]) {
      grouped[key].push(course);
    }
  });

  // 2.3. Re-balance Minor vs ScienceBasic (기초과학 우선 충족)
  // 부전공과 기초과학에 중복되는 과목이 있을 경우, 기초과학 요건을 먼저 충족
  // 예: 수리과학 부전공 선언 시, 미적분학 + 수학선택1은 기초과학으로, 나머지는 부전공으로
  if (userMinors && userMinors.length > 0 && grouped.minor.length > 0) {
    const minorScienceResult = rebalanceMinorVsScienceBasic(grouped.minor, grouped.scienceBasic, entryYear);
    grouped.minor = minorScienceResult.minor;
    grouped.scienceBasic = minorScienceResult.scienceBasic;
  }

  // 2.4. Re-balance Science Basic -> Free Electives (시간순 3분야 선택 알고리즘)
  // 수학(별도 필수) + 물리/화학/생명/SW 중 시간순으로 먼저 완료된 3분야만 기초과학 인정
  let scienceFieldsComplete = false;
  if (grouped.scienceBasic.length > 0) {
    const rebalanceResult = allocateScienceCourses(grouped.scienceBasic, entryYear);
    scienceFieldsComplete = rebalanceResult.selectedFields.every(
      (field) => rebalanceResult.fieldDetails.get(field)?.isComplete,
    );
    grouped.scienceBasic = rebalanceResult.scienceBasic;
    grouped.otherUncheckedClass.push(...rebalanceResult.freeElective);
  }

  // 2.5. Re-balance Humanities -> Free Electives (Overflow)
  // 인문사회 24학점 초과분은 최대 12학점까지 자유선택학점으로 인정
  const humanitiesReqRule = ruleSet.categories.find((r) => r.key === 'humanities');
  if (humanitiesReqRule && grouped.humanities.length > 0) {
    const humanitiesReq = 24; // 인문사회 필수 학점
    const maxOverflowToFreeElective = 12; // 자유선택으로 인정 가능한 최대 학점

    let currentHumanities = grouped.humanities.reduce((acc, c) => acc + (c.credit || 0), 0);

    if (currentHumanities > humanitiesReq) {
      const overflowCredits = currentHumanities - humanitiesReq;
      const creditsToMove = Math.min(overflowCredits, maxOverflowToFreeElective);

      // Sort: Keep HUS/PPE courses first, move GSC or extra courses to overflow
      // GSC courses have lower priority than HUS/PPE
      grouped.humanities.sort((a, b) => {
        const aCode = a.courseCode.toUpperCase();
        const bCode = b.courseCode.toUpperCase();
        // GS prefix courses go last (they might be GSC)
        const aGS = aCode.startsWith('GS');
        const bGS = bCode.startsWith('GS');
        if (aGS && !bGS) return 1;
        if (!aGS && bGS) return -1;
        return 0;
      });

      const newHumanities: TakenCourseType[] = [];
      const overflow: TakenCourseType[] = [];
      let creditSum = 0;
      let overflowSum = 0;

      for (const c of grouped.humanities) {
        if (creditSum + (c.credit || 0) <= humanitiesReq) {
          newHumanities.push(c);
          creditSum += c.credit || 0;
        } else if (overflowSum + (c.credit || 0) <= creditsToMove) {
          // 자유선택으로 이동 (최대 12학점까지)
          overflow.push(c);
          overflowSum += c.credit || 0;
        } else {
          // 12학점 초과분은 그냥 인문사회에 남김
          newHumanities.push(c);
          creditSum += c.credit || 0;
        }
      }

      grouped.humanities = newHumanities;
      grouped.otherUncheckedClass.push(...overflow);
    }
  }

  // 3. Build Categories
  const graduationCategory = {} as GradCategoriesType;

  // Initialize with rules
  ruleSet.categories.forEach((rule) => {
    let minCredits =
      rule.key === 'major' ? getMajorCreditRequirement(entryYear, userMajor).requiredCredits : rule.minCredits;
    if (rule.key === 'scienceBasic') minCredits = takenCourses.some((c) => c.courseCode === 'GS1401') ? 17 : 18;

    // Dynamically update Minor requirement if user has selected minors
    if (rule.key === 'minor' && userMinors && userMinors.length > 0) {
      minCredits = userMinors.length * 15;
    }

    graduationCategory[rule.key] = buildCategoryStatus(rule.key, grouped[rule.key] || [], minCredits);
  });

  // Fill missing keys with default empty status
  (Object.keys(grouped) as CategoryKey[]).forEach((key) => {
    if (!graduationCategory[key]) {
      graduationCategory[key] = buildCategoryStatus(key, grouped[key] || [], 0);
    }
  });

  // 4. Calculate Total Credits
  const recognizedCredits = calculateRecognizedCredits(takenCourses, entryYear, userMajor);
  const totalCredits = recognizedCredits.total;

  // 5. Fine-grained Requirements
  const fineGrainedRequirements = buildFineGrainedRequirements({
    allCourses: takenCourses,
    grouped,
    ruleSet,
    entryYear,
    userMajor,
    unresolvedUserMajorInput,
    scienceFieldsComplete,
    recognizedCredits,
    userMinors: userMinors || [],
    minorDeclarationTerms,
  }).map((req) => ({
    ...req,
    status: getRequirementStatus(req),
  }));

  const catalogSelection = buildGraduationCatalogSelectionSummary({
    entryYear,
    userMajor,
    userMinors: userMinors ?? [],
    minorDeclarationTerms,
  });

  // 6. Refine Category Satisfaction based on Fine-grained Requirements
  // (If a fine-grained 'must' requirement is missing, the whole category is unsatisfied)
  (Object.keys(graduationCategory) as CategoryKey[]).forEach((key) => {
    const cat = graduationCategory[key];
    const hardReqs = fineGrainedRequirements.filter((r) => r.categoryKey === key && r.importance === 'must');

    if (hardReqs.length > 0) {
      if (!hardReqs.every((r) => getRequirementStatus(r) === 'satisfied')) {
        cat.satisfied = false;
      }
    }
  });

  // 7. Push fine-grained messages to categories (간결한 형식)
  fineGrainedRequirements.forEach((req) => {
    const status = getRequirementStatus(req);
    if (req.importance !== 'must') return;

    if (status === 'needs_review') {
      const cat = graduationCategory[req.categoryKey];
      cat.messages.push(`${req.label} - 확인 필요`);
      return;
    }

    if (status === 'unsatisfied' && req.requiredCredits > 0) {
      const cat = graduationCategory[req.categoryKey];
      cat.messages.push(`${req.label}`);
    }
  });

  // 8. Overall Satisfaction
  const categoriesSatisfied = ruleSet.categories
    .filter((c) => !c.optional)
    .every((c) => graduationCategory[c.key].satisfied);

  const hasNeedsReview = fineGrainedRequirements.some(
    (req) => req.importance === 'must' && getRequirementStatus(req) === 'needs_review',
  );
  const hasSatisfiedAllKnownRequirements = categoriesSatisfied && totalCredits >= ruleSet.minTotalCredits;

  const overallStatus: GraduationOverallStatus = hasNeedsReview
    ? 'needs_review'
    : hasSatisfiedAllKnownRequirements
      ? 'satisfied'
      : 'unsatisfied';
  const totalSatisfied = overallStatus === 'satisfied';

  return {
    graduationCategory,
    totalCredits,
    earnedCredits: recognizedCredits.earned,
    overallStatus,
    totalSatisfied,
    fineGrainedRequirements,
    catalogSelection,
  };
};
