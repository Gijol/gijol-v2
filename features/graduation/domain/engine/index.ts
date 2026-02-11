import {
  GradStatusResponseType,
  UserTakenCourseListType,
  GradCategoriesType,
  SingleCategoryType,
  TakenCourseType,
  FineGrainedRequirement,
  CategoryKey,
  YearRuleSet,
  ScienceField,
  FieldCompletionResult,
  ScienceRebalanceResult,
} from '../types';
import { pickRuleSet } from '../rules';
import { classifyCourse } from '../classifier';
import { buildFineGrainedRequirements } from '../requirements';
import {
  MATH_CALCULUS,
  MATH_ELECTIVE,
  PHYSICS_LECTURE,
  PHYSICS_LAB,
  CHEMISTRY_LECTURE,
  CHEMISTRY_LAB,
  BIOLOGY_LECTURE,
  BIOLOGY_LAB,
  SW_COURSES,
} from '../constants/classifier-constants';

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

// ========== 시간순 3분야 선택 알고리즘 ==========

function toCanonicalSemester(semester: string): '1' | '2' | '여름' | '겨울' | '' {
  const compact = (semester || '').toString().trim().toLowerCase().replace(/\s+/g, '');
  if (compact === '1' || compact === '1학기' || compact === '봄' || compact === '봄학기' || compact === 'spring') {
    return '1';
  }
  if (
    compact === '2' ||
    compact === '2학기' ||
    compact === '가을' ||
    compact === '가을학기' ||
    compact === 'autumn' ||
    compact === 'fall'
  ) {
    return '2';
  }
  if (compact === '여름' || compact === '여름학기' || compact === 'summer') {
    return '여름';
  }
  if (compact === '겨울' || compact === '겨울학기' || compact === 'winter') {
    return '겨울';
  }
  return '';
}

// 학기 비교 함수: 양수면 a가 b보다 이후, 음수면 a가 b보다 이전, 0이면 동일
function compareSemester(a: TakenCourseType, b: TakenCourseType): number {
  if (a.year !== b.year) return a.year - b.year;
  const semOrder: Record<string, number> = { '1': 1, 여름: 2, '2': 3, 겨울: 4 };
  const aOrder = semOrder[toCanonicalSemester(a.semester)] || 0;
  const bOrder = semOrder[toCanonicalSemester(b.semester)] || 0;
  return aOrder - bOrder;
}

// 과목 코드로 분야 판별
function getFieldByCode(code: string): ScienceField | null {
  if (MATH_CALCULUS.has(code) || MATH_ELECTIVE.has(code)) return 'math';
  if (PHYSICS_LECTURE.has(code) || PHYSICS_LAB.has(code)) return 'physics';
  if (CHEMISTRY_LECTURE.has(code) || CHEMISTRY_LAB.has(code)) return 'chemistry';
  if (BIOLOGY_LECTURE.has(code) || BIOLOGY_LAB.has(code)) return 'biology';
  if (SW_COURSES.has(code)) return 'sw';
  return null;
}

// 분야별 과목 그룹화
function groupCoursesByField(courses: TakenCourseType[]): Map<ScienceField, TakenCourseType[]> {
  const result = new Map<ScienceField, TakenCourseType[]>();
  for (const course of courses) {
    const field = getFieldByCode(course.courseCode);
    if (field) {
      if (!result.has(field)) result.set(field, []);
      result.get(field)!.push(course);
    }
  }
  return result;
}

// 실험-강의 선이수/동시수강 검증
function verifyLabPrerequisite(lectures: TakenCourseType[], labs: TakenCourseType[]): boolean {
  for (const lab of labs) {
    const hasPrereq = lectures.some((lecture) => {
      const cmp = compareSemester(lab, lecture);
      return cmp >= 0; // 실험이 강의와 동일 학기이거나 이후 학기면 OK
    });
    if (!hasPrereq) return false;
  }
  return true;
}

// 분야 완료 여부 확인
function checkFieldCompletion(
  courses: TakenCourseType[],
  field: ScienceField,
  sortedAll: TakenCourseType[],
): FieldCompletionResult {
  const getTimeIndex = (c: TakenCourseType) =>
    sortedAll.findIndex((sc) => sc.courseCode === c.courseCode && sc.year === c.year && sc.semester === c.semester);

  const result: FieldCompletionResult = {
    field,
    isComplete: false,
    completionIndex: -1,
    requiredCourses: [],
    hasLab: false,
    labVerified: true,
  };

  switch (field) {
    case 'math': {
      const calculus = courses.filter((c) => MATH_CALCULUS.has(c.courseCode));
      const electives = courses.filter((c) => MATH_ELECTIVE.has(c.courseCode));
      const hasCalculus = calculus.length > 0;
      const hasElective = electives.length > 0;
      result.isComplete = hasCalculus && hasElective;
      if (result.isComplete) {
        result.requiredCourses = [calculus[0], electives[0]];
        result.completionIndex = Math.max(getTimeIndex(calculus[0]), getTimeIndex(electives[0]));
      }
      result.hasLab = true; // 수학은 실험 없음, 항상 true
      break;
    }
    case 'physics':
    case 'chemistry':
    case 'biology': {
      const lectureSet =
        field === 'physics' ? PHYSICS_LECTURE : field === 'chemistry' ? CHEMISTRY_LECTURE : BIOLOGY_LECTURE;
      const labSet = field === 'physics' ? PHYSICS_LAB : field === 'chemistry' ? CHEMISTRY_LAB : BIOLOGY_LAB;
      const lectures = courses.filter((c) => lectureSet.has(c.courseCode));
      const labs = courses.filter((c) => labSet.has(c.courseCode));
      const hasLecture = lectures.length > 0;
      const hasLab = labs.length > 0;
      result.hasLab = hasLab;
      result.labVerified = hasLab ? verifyLabPrerequisite(lectures, labs) : true;

      // 강의+실험 둘 다 있어야 완료
      if (hasLecture && hasLab && result.labVerified) {
        result.isComplete = true;
        result.requiredCourses = [lectures[0], labs[0]];
        result.completionIndex = Math.max(getTimeIndex(lectures[0]), getTimeIndex(labs[0]));
      }
      break;
    }
    case 'sw': {
      const swCourses = courses.filter((c) => SW_COURSES.has(c.courseCode));
      if (swCourses.length > 0) {
        result.isComplete = true;
        result.requiredCourses = [swCourses[0]];
        result.completionIndex = getTimeIndex(swCourses[0]);
        result.hasLab = true; // SW는 실험 없음, 항상 true
      }
      break;
    }
  }
  return result;
}

// 시간순 3분야 선택 알고리즘
function rebalanceScienceByTimeOrder(scienceCourses: TakenCourseType[]): ScienceRebalanceResult {
  // 1. 시간순 정렬
  const sorted = [...scienceCourses].sort(compareSemester);

  // 2. 분야별 과목 그룹화
  const byField = groupCoursesByField(sorted);

  // 3. 각 분야 완료 여부 및 완료 시점 계산
  const fieldResults = new Map<ScienceField, FieldCompletionResult>();
  const allFields: ScienceField[] = ['math', 'physics', 'chemistry', 'biology', 'sw'];

  for (const field of allFields) {
    const courses = byField.get(field) || [];
    fieldResults.set(field, checkFieldCompletion(courses, field, sorted));
  }

  // 4. 수학 분야 확인 (별도 필수)
  const mathResult = fieldResults.get('math')!;

  // 5. 물리/화학/생명/SW 중 완료된 분야들을 시간순 정렬
  const scienceLabFields: ScienceField[] = ['physics', 'chemistry', 'biology', 'sw'];
  const completedFields = scienceLabFields
    .filter((f) => fieldResults.get(f)!.isComplete)
    .sort((a, b) => fieldResults.get(a)!.completionIndex - fieldResults.get(b)!.completionIndex);

  // 6. SW 이수 여부에 따른 3분야 선택
  const hasSW = completedFields.includes('sw');
  let selectedFields: ScienceField[];

  if (hasSW) {
    // SW 이수: SW + 물리/화학/생명 중 먼저 완료된 2분야
    // 단, 선택된 2분야는 각각 실험 필수
    const labFieldsWithLab = completedFields.filter((f) => f !== 'sw' && fieldResults.get(f)!.hasLab);
    selectedFields = [...labFieldsWithLab.slice(0, 2), 'sw'];
  } else {
    // SW 미이수: 물리/화학/생명 3분야 (2분야만 실험 필수)
    const labFields = completedFields.filter((f) => f !== 'sw');
    selectedFields = labFields.slice(0, 3);
  }

  // 7. 결과 분류
  const scienceBasic: TakenCourseType[] = [];
  const freeElective: TakenCourseType[] = [];

  // 수학: 미적분학 + 선택 1과목만 기초과학
  if (mathResult.isComplete) {
    scienceBasic.push(...mathResult.requiredCourses);
  }
  // 수학 분야 초과분은 자유선택
  const mathCourses = byField.get('math') || [];
  const mathExtra = mathCourses.filter((c) => !mathResult.requiredCourses.some((rc) => rc.courseCode === c.courseCode));
  freeElective.push(...mathExtra);

  // 선택된 3분야: 분야 완료에 필요한 과목만 기초과학
  for (const field of scienceLabFields) {
    const fieldCourses = byField.get(field) || [];
    const result = fieldResults.get(field)!;

    if (selectedFields.includes(field)) {
      // 선택된 분야: 필수 과목만 기초과학, 초과분은 자유선택
      scienceBasic.push(...result.requiredCourses);
      const extra = fieldCourses.filter((c) => !result.requiredCourses.some((rc) => rc.courseCode === c.courseCode));
      freeElective.push(...extra);
    } else {
      // 미선택 분야: 전부 자유선택
      freeElective.push(...fieldCourses);
    }
  }

  return {
    scienceBasic,
    freeElective,
    selectedFields,
    fieldDetails: fieldResults,
  };
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
): MinorScienceRebalanceResult {
  // 1. 현재 기초과학의 수학 요건 충족 여부 확인
  const existingMathCalc = scienceBasicCourses.filter((c) => MATH_CALCULUS.has(c.courseCode));
  const existingMathElec = scienceBasicCourses.filter((c) => MATH_ELECTIVE.has(c.courseCode));

  const hasCalculus = existingMathCalc.length > 0;
  const hasElective = existingMathElec.length > 0;

  // 이미 충족되면 그대로 반환
  if (hasCalculus && hasElective) {
    return { minor: minorCourses, scienceBasic: scienceBasicCourses };
  }

  // 2. minor에서 이동 가능한 수학 과목 찾기
  const minorMathCalc = minorCourses.filter((c) => MATH_CALCULUS.has(c.courseCode));
  const minorMathElec = minorCourses.filter((c) => MATH_ELECTIVE.has(c.courseCode));

  const coursesToMove: TakenCourseType[] = [];

  // 미적분학 이동 (필요시)
  if (!hasCalculus && minorMathCalc.length > 0) {
    coursesToMove.push(minorMathCalc[0]);
  }

  // 수학선택 이동 (필요시, 시간순 첫 번째)
  if (!hasElective && minorMathElec.length > 0) {
    const sortedElectives = [...minorMathElec].sort(compareSemester);
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

  // 2.3. 복수 인정 처리 (Dual-Credit)
  // 부전공으로 분류된 과목 중 인문사회 조건도 만족하는 과목은 humanities에도 추가
  // 예: GS2544 (문화콘텐츠의 이해) → minor(CT) && humanities(GS2544)
  const humanitiesPrefixes = ['HS', 'GS', 'EB', 'LH', 'MB', 'PP', 'SS'];
  const humanitiesSuffixPattern = /^(GS|HS)[2-4]\d{3}$/; // GS2xxx ~ GS4xxx, HS2xxx ~ HS4xxx

  grouped.minor.forEach((course) => {
    const code = course.courseCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const prefix = code.match(/^[A-Z]+/)?.[0] || '';

    // GS/HS로 시작하는 인문사회 과목은 humanities에도 포함
    if (humanitiesPrefixes.includes(prefix) || humanitiesSuffixPattern.test(code)) {
      // 중복 체크 후 추가
      const alreadyExists = grouped.humanities.some(
        (c) => c.courseCode === course.courseCode && c.year === course.year && c.semester === course.semester,
      );
      if (!alreadyExists) {
        grouped.humanities.push(course);
      }
    }
  });

  // 2.4. Re-balance Minor vs ScienceBasic (기초과학 우선 충족)
  // 부전공과 기초과학에 중복되는 과목이 있을 경우, 기초과학 요건을 먼저 충족
  // 예: 수리과학 부전공 선언 시, 미적분학 + 수학선택1은 기초과학으로, 나머지는 부전공으로
  if (userMinors && userMinors.length > 0 && grouped.minor.length > 0) {
    const minorScienceResult = rebalanceMinorVsScienceBasic(grouped.minor, grouped.scienceBasic);
    grouped.minor = minorScienceResult.minor;
    grouped.scienceBasic = minorScienceResult.scienceBasic;
  }

  // 2.5. Re-balance Science Basic -> Free Electives (시간순 3분야 선택 알고리즘)
  // 수학(별도 필수) + 물리/화학/생명/SW 중 시간순으로 먼저 완료된 3분야만 기초과학 인정
  if (grouped.scienceBasic.length > 0) {
    const rebalanceResult = rebalanceScienceByTimeOrder(grouped.scienceBasic);
    grouped.scienceBasic = rebalanceResult.scienceBasic;
    grouped.otherUncheckedClass.push(...rebalanceResult.freeElective);
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

  // 7. Push fine-grained messages to categories (간결한 형식)
  fineGrainedRequirements.forEach((req) => {
    if (!req.satisfied && req.requiredCredits > 0 && req.importance === 'must') {
      const cat = graduationCategory[req.categoryKey];
      cat.messages.push(`${req.label}`);
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
