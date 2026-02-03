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
  // 2.5. Re-balance Science Basic -> Free Electives (Overflow)
  const scienceReqRule = ruleSet.categories.find((r) => r.key === 'scienceBasic');
  if (scienceReqRule && grouped.scienceBasic.length > 0) {
    // Determine required credits (17 or 18 based on Comp Prog logic, but simple rule check for now is usually static in ruleSet?
    // Actually ruleSet has 'minCredits'. But 'requirements.ts' has dynamic logic for 17/18.
    // We should roughly respect the max. Let's use 18 as safe upper bound or dynamic check?
    // Helper to check Comp Prog
    const hasCompProg = grouped.scienceBasic.some((c) => c.courseCode === 'GS1401' || c.courseCode === 'GS1490'); // Simplified check
    const scienceReq = hasCompProg ? 17 : 18;

    let currentScience = grouped.scienceBasic.reduce((acc, c) => acc + (c.credit || 0), 0);

    if (currentScience > scienceReq) {
      // Identify candidates to move (Non-Mandatory preferred)
      // Mandatory: Calculus (1001, 1011), Core Math, Physics, Chem, Bio, Comp Prog.
      // Basically GS courses are mostly mandatory or key basics.
      // Candidates: Major courses classified as Science Basic (BS*, CH*, etc.)

      // Sort strategies:
      // 1. Move Major-like codes (BS, CH, PH, etc outside GS) first?
      // 2. Just move anything that isn't strictly the 'Must' set?

      const mustPrefixes = ['GS1', 'GS2', 'MM2', 'GS0']; // Heuristic for basic GS headers
      const candidates = [];
      const keeps = [];

      for (const c of grouped.scienceBasic) {
        // If it's a known MUST (Calculus etc, usually GS1xxx), keep it.
        // Unless we have too many GS?
        if (c.courseCode.startsWith('GS')) {
          keeps.push(c);
        } else {
          candidates.push(c);
        }
      }

      // If candidates (e.g. BS/CH major courses) exist, try to move them first
      // Actually, we should just iterate and move if surplus.
      // Let's reset and do a simpler specific sort.

      // Sort: GS first (keep), then others.
      grouped.scienceBasic.sort((a, b) => {
        const aGS = a.courseCode.startsWith('GS');
        const bGS = b.courseCode.startsWith('GS');
        if (aGS && !bGS) return -1;
        if (!aGS && bGS) return 1;
        return 0;
      });

      const newScience = [];
      const overflow = [];
      let creditSum = 0;

      for (const c of grouped.scienceBasic) {
        if (creditSum + (c.credit || 0) <= scienceReq) {
          newScience.push(c);
          creditSum += c.credit || 0;
        } else {
          // Try to fill gap exactly?
          // If adding this exceeds, do we add it?
          // Usually yes, we satisfy >= Req.
          // If we are at 16, need 18, and course is 3cr. Total 19. It stays.
          if (creditSum < scienceReq) {
            newScience.push(c);
            creditSum += c.credit || 0;
          } else {
            overflow.push(c);
          }
        }
      }

      grouped.scienceBasic = newScience;
      grouped.otherUncheckedClass.push(...overflow);
    }
  }

  // 2.6. Re-balance Humanities -> Free Electives (Overflow)
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
    let minCredits = rule.minCredits;

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
