/**
 * Fine-Grained Requirements Builder - Embedded from legacy grad-requirements.ts
 * Generates detailed graduation requirement checks based on actual courses taken
 */

import {
  HUS_COURSES,
  PPE_COURSES,
  GSC_COURSES,
  HUS_SUFFIXES,
  PPE_SUFFIXES,
  GSC_SUFFIXES,
  getCourseSuffix,
  PHYSICAL_EDUCATION_CODES,
  ARTS_EDUCATION_CODES,
} from './constants';
import { matchesMinor } from './classifier';
import { getBasicRequirementCatalog } from './rule-catalog/basic-requirements';
import {
  getMajorCreditRequirement,
  getMajorMandatoryRulesForContext,
  getMinorCourseLimitRequirement,
  getMinorCreditRequirement,
  getMinorDeclarationTermRequirement,
  getMinorMandatoryRulesForContext,
  getThesisRequirements,
  requiresMinorDeclarationTerm,
} from './rule-catalog/major-minor-requirements';
import type {
  TakenCourseType,
  CategoryKey,
  YearRuleSet,
  FineGrainedRequirement,
  MatchedCourseInfo,
  ExcludedCourseInfo,
  AcademicTerm,
  MinorDeclarationTerms,
} from './types';

// ===== Helper Functions =====

function normalizeCode(code?: string): string {
  if (!code) return '';
  return String(code)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function normalizeName(name?: string): string {
  return (name || '').toString().toLowerCase();
}

function sumCredits(courses: TakenCourseType[], predicate?: (c: TakenCourseType) => boolean): number {
  return courses.reduce((acc, c) => {
    if (!predicate || predicate(c)) {
      return acc + (Number(c.credit) || 0);
    }
    return acc;
  }, 0);
}

function countCourses(courses: TakenCourseType[], predicate: (c: TakenCourseType) => boolean): number {
  return courses.reduce((acc, c) => acc + (predicate(c) ? 1 : 0), 0);
}

function codeInSet(c: TakenCourseType, set: Set<string>): boolean {
  return set.has(normalizeCode(c.courseCode));
}

function hasCourseInSet(courses: TakenCourseType[], set: Set<string>): boolean {
  return courses.some((c) => codeInSet(c, set));
}

function hasCourseWithSuffix(courses: TakenCourseType[], suffix: string): boolean {
  return courses.some((c) => normalizeCode(c.courseCode).endsWith(suffix));
}

function hasCodePrefix(c: TakenCourseType, prefix: string): boolean {
  return normalizeCode(c.courseCode).startsWith(prefix);
}

function isCourseType(c: TakenCourseType, type: string): boolean {
  const normType = normalizeCode(type);
  const code = normalizeCode(c.courseCode);
  const suffix = getCourseSuffix(code);

  // 직접 코드 매칭 또는 suffix 매칭 (HS2503 = GS2503 = HUS)
  if (normType === 'HUS') {
    return HUS_COURSES.has(code) || HUS_SUFFIXES.has(suffix);
  }
  if (normType === 'PPE') {
    return PPE_COURSES.has(code) || PPE_SUFFIXES.has(suffix);
  }
  if (normType === 'GSC') {
    return GSC_COURSES.has(code) || GSC_SUFFIXES.has(suffix);
  }

  return normalizeCode(c.courseType) === normType;
}

// ===== Course Matching Helpers =====

/** Convert TakenCourseType to MatchedCourseInfo */
function toMatchedInfo(c: TakenCourseType): MatchedCourseInfo {
  return {
    courseCode: c.courseCode,
    courseName: c.courseName,
    credit: c.credit,
    year: c.year,
    semester: c.semester,
  };
}

function toExcludedCourseInfo(c: TakenCourseType, reason: string): ExcludedCourseInfo {
  return {
    ...toMatchedInfo(c),
    reason,
  };
}

/** Find all courses matching a code set */
function findCoursesInSet(courses: TakenCourseType[], set: Set<string>): TakenCourseType[] {
  return courses.filter((c) => codeInSet(c, set));
}

/** Find all courses with a code suffix */
function findCoursesWithSuffix(courses: TakenCourseType[], suffix: string): TakenCourseType[] {
  return courses.filter((c) => normalizeCode(c.courseCode).endsWith(suffix));
}

/** Find all courses with a code prefix */
function findCoursesWithPrefix(courses: TakenCourseType[], prefix: string): TakenCourseType[] {
  return courses.filter((c) => hasCodePrefix(c, prefix));
}

/** Generate dynamic label based on matched courses */
function courseBasedLabel(baseName: string, matched: MatchedCourseInfo[], satisfied: boolean): string {
  if (satisfied && matched.length > 0) {
    const courseList = matched.map((c) => c.courseCode).join(', ');
    return `${baseName} ✓ (${courseList})`;
  }
  return `${baseName} ✗ 미충족`;
}

/** Generate dynamic hint based on matched courses */
function courseBasedHint(
  matched: MatchedCourseInfo[],
  satisfied: boolean,
  satisfiedTemplate: string,
  unsatisfiedTemplate: string,
): string {
  if (satisfied && matched.length > 0) {
    const first = matched[0];
    return satisfiedTemplate
      .replace('{course}', `${first.courseCode}(${first.courseName})`)
      .replace('{year}', `${first.year}`)
      .replace('{semester}', first.semester);
  }
  return unsatisfiedTemplate;
}

/** Generate credit-based label with progress */
function creditBasedLabel(baseName: string, required: number, acquired: number, unit: string = '학점'): string {
  if (acquired >= required) {
    return `${baseName} ✓ (${acquired}/${required}${unit})`;
  }
  return `${baseName} (${acquired}/${required}${unit}, ${required - acquired}${unit} 부족)`;
}

// ===== Constant Sets =====

// 영어 I (필수 2학점)
const SET_ENG_I_REQUIRED_2021 = new Set(['GS1607']); // 2021학번 이후 필수
const SET_ENG_I_LEGACY = new Set(['GS1601', 'GS1603']); // 2021 이전 학번용
const SET_ENG_I_ALL = new Set(['GS1601', 'GS1603', 'GS1607']);

// 영어 II (필수 2학점)
const SET_ENG_II_REQUIRED_2021 = new Set(['GS2652']); // 2021학번 이후 필수
const SET_ENG_II_LEGACY = new Set(['GS1602', 'GS1604']); // 2021 이전 학번용
const SET_ENG_II_ALL = new Set(['GS1602', 'GS1604', 'GS2652']);

// 영어 선택 (선이수 조건 없음)
const SET_ENG_OPTIONAL = new Set(['GS1605', 'GS1606', 'GS2651', 'GS2653', 'GS2654']);

// 영어 고급 (영어I + 영어II 이수 후에만 가능)
const SET_ENG_ADVANCED = new Set(['GS2655', 'GS3651']);

// 글쓰기 기초 (3학점, 7과목 중 1과목 필수)
const SET_WRITING_BASIC = new Set(['GS1511', 'GS1512', 'GS1513']);

// 글쓰기 심화 (기초 이수자만 추가 수강 가능, 자유선택 처리)
const SET_WRITING_ADVANCED = new Set(['GS1531', 'GS1532', 'GS1533', 'GS1535']);

// 전체 글쓰기 (기초 + 심화)
const SET_WRITING_ALL = new Set(['GS1511', 'GS1512', 'GS1513', 'GS1531', 'GS1532', 'GS1533', 'GS1535']);

const SET_CALCULUS = new Set(['GS1001', 'GS1011']);
const SET_CORE_MATH = new Set([
  'GS1002',
  'GS2001',
  'MM2001',
  'GS1012',
  'GS2004',
  'GS2013',
  'MM2004',
  'GS2002',
  'MM2002',
]);

const SET_PHYSICS = new Set(['GS1101', 'GS1103']);
const SET_CHEM = new Set(['GS1201', 'GS1203']);
const SET_BIO = new Set(['GS1301', 'GS1302', 'GS1303']);
const SET_COMP_PROG = new Set(['GS1401']);
const SET_SW_BASIC = new Set(['GS1490']);

const SET_FRESHMAN = new Set(['GS1901', 'GS9301']);
const SET_EXPLORATION = new Set(['UC0902']);
const SET_COLLOQUIUM = new Set(['UC9331']);
const SET_SCIENCE_ECONOMY = new Set(['GS1701', 'UC0901']); // 과학기술과 경제

// 예체능 과목 prefix (legacy) - 새로운 코드 집합으로 대체됨
// const CODE_ART_PREFIX = 'GS02';
// const CODE_SPORT_PREFIX = 'GS01';

const SCIENCE_LAB_KEYWORDS = ['실험', 'lab', 'biology', 'physics', 'chemistry', '생물', '물리', '화학'];

function isLabCourse(c: TakenCourseType): boolean {
  const name = normalizeName(c.courseName);
  const code = normalizeCode(c.courseCode);
  return SCIENCE_LAB_KEYWORDS.some((kw) => name.includes(kw)) || /[0-9]11$/.test(code) || name.includes('experiment');
}

function isScienceCreditCourse(c: TakenCourseType): boolean {
  const codeMatch =
    codeInSet(c, SET_PHYSICS) ||
    codeInSet(c, SET_CHEM) ||
    codeInSet(c, SET_BIO) ||
    codeInSet(c, SET_COMP_PROG) ||
    codeInSet(c, SET_SW_BASIC);

  if (codeMatch) return true;

  const name = normalizeName(c.courseName);
  const isScienceLab = isLabCourse(c);
  const scienceKeyword =
    name.includes('physics') ||
    name.includes('chem') ||
    name.includes('bio') ||
    name.includes('생물') ||
    name.includes('물리') ||
    name.includes('화학');

  return isScienceLab && scienceKeyword;
}

const THESIS_COURSE_SUFFIXES = new Set(getThesisRequirements(2021).map((requirement) => requirement.suffix));

function getMinorDeclarationTerm(minorCode: string, terms?: MinorDeclarationTerms): AcademicTerm | undefined {
  if (!terms) return undefined;

  const normalizedMinorCode = normalizeCode(minorCode);
  const directMatch = terms[minorCode] ?? terms[normalizedMinorCode];
  if (directMatch) return directMatch;

  const matchingKey = Object.keys(terms).find((key) => normalizeCode(key) === normalizedMinorCode);
  return matchingKey ? terms[matchingKey] : undefined;
}

function getSemesterOrder(semester: string): number {
  const normalized = String(semester).trim().toLowerCase();
  if (['1', '1학기', 'spring', '봄'].includes(normalized)) return 1;
  if (['summer', '여름', '여름학기'].includes(normalized)) return 2;
  if (['2', '2학기', 'fall', 'autumn', '가을'].includes(normalized)) return 3;
  if (['winter', '겨울', '겨울학기'].includes(normalized)) return 4;
  return 0;
}

function compareCourseTakenOrder(a: TakenCourseType, b: TakenCourseType): number {
  if (a.year !== b.year) return a.year - b.year;

  const semesterDiff = getSemesterOrder(a.semester) - getSemesterOrder(b.semester);
  if (semesterDiff !== 0) return semesterDiff;

  return normalizeCode(a.courseCode).localeCompare(normalizeCode(b.courseCode));
}

function isIrAiCodeCourse(c: TakenCourseType): boolean {
  const code = normalizeCode(c.courseCode);
  return /^AI[0-9]/.test(code) && !Array.from(THESIS_COURSE_SUFFIXES).some((suffix) => code.endsWith(suffix));
}

function applyIrAiCodeCourseLimit(
  minorCode: string,
  courses: TakenCourseType[],
  entryYear: number,
  declarationTerm?: AcademicTerm,
): { accepted: TakenCourseType[]; excluded: TakenCourseType[]; reason?: string } {
  const limitRequirement = getMinorCourseLimitRequirement(minorCode, { entryYear, declarationTerm });
  if (!limitRequirement) {
    return { accepted: courses, excluded: [] };
  }

  const acceptedAiCourses = new Set(
    courses.filter(isIrAiCodeCourse).sort(compareCourseTakenOrder).slice(0, limitRequirement.limit.maxCourses),
  );

  return {
    accepted: courses.filter((course) => !isIrAiCodeCourse(course) || acceptedAiCourses.has(course)),
    excluded: courses
      .filter((course) => isIrAiCodeCourse(course) && !acceptedAiCourses.has(course))
      .sort(compareCourseTakenOrder),
    reason: limitRequirement.reason,
  };
}

// ===== Main Builder =====

export interface AnalyzeContext {
  allCourses: TakenCourseType[];
  grouped: Record<CategoryKey, TakenCourseType[]>;
  ruleSet: YearRuleSet;
  entryYear: number;
  userMajor?: string;
  unresolvedUserMajorInput?: string;
  userMinors?: string[];
  minorDeclarationTerms?: MinorDeclarationTerms;
}

export function buildFineGrainedRequirements(ctx: AnalyzeContext): FineGrainedRequirement[] {
  const { allCourses, grouped, entryYear, userMajor, unresolvedUserMajorInput, userMinors, minorDeclarationTerms } =
    ctx;
  const basicCatalog = getBasicRequirementCatalog(entryYear);
  const basicSourceRefs = [basicCatalog.source];
  const reqs: FineGrainedRequirement[] = [];

  // ===== 0. Total Credits =====
  const totalCredits = sumCredits(allCourses);
  const requiredTotalCredits = basicCatalog.totalCredits.requiredCredits;
  const totalSatisfied = totalCredits >= requiredTotalCredits;
  const totalMissing = Math.max(0, requiredTotalCredits - totalCredits);
  reqs.push({
    id: basicCatalog.totalCredits.id,
    categoryKey: 'otherUncheckedClass',
    label: creditBasedLabel(basicCatalog.totalCredits.label, requiredTotalCredits, totalCredits),
    requiredCredits: requiredTotalCredits,
    acquiredCredits: totalCredits,
    missingCredits: totalMissing,
    satisfied: totalSatisfied,
    importance: 'must',
    hint: totalSatisfied
      ? `축하합니다! 총 ${totalCredits}학점을 이수하여 요건을 충족했습니다.`
      : `졸업을 위해 ${totalMissing}학점을 더 이수해야 합니다.`,
    sourceRefs: basicSourceRefs,
    matchedCourses: allCourses.map(toMatchedInfo),
  });

  // ===== 1. 언어의 기초 =====

  // 영어 I 요건 확인
  // 2021학번 이후: GS1607 필수 (GS1601, GS1603 대체 가능)
  // 2018-2020학번: GS1601, GS1603, GS1607 중 택1
  const engICourses = findCoursesInSet(allCourses, SET_ENG_I_ALL);
  const engIMatched = engICourses.map(toMatchedInfo);

  let tookEngI = false;
  if (entryYear >= 2021) {
    // 2021학번 이후: GS1607 또는 (GS1601 + GS1603) → GS1607이 둘을 대체
    const hasGS1607 = engICourses.some((c) => c.courseCode === 'GS1607');
    const hasGS1601 = engICourses.some((c) => c.courseCode === 'GS1601');
    const hasGS1603 = engICourses.some((c) => c.courseCode === 'GS1603');
    tookEngI = hasGS1607 || (hasGS1601 && hasGS1603);
  } else {
    // 2018-2020학번: 택1
    tookEngI = engICourses.length > 0;
  }

  // 영어 II 요건 확인
  const engIICourses = findCoursesInSet(allCourses, SET_ENG_II_ALL);
  const engIIMatched = engIICourses.map(toMatchedInfo);
  const tookEngII = engIICourses.length > 0;

  // 글쓰기 요건 확인 (기초 + 심화 중 1과목 필수)
  const basicWritingCourses = findCoursesInSet(allCourses, SET_WRITING_BASIC);
  const advancedWritingCourses = findCoursesInSet(allCourses, SET_WRITING_ADVANCED);
  const allWritingCourses = [...basicWritingCourses, ...advancedWritingCourses];
  const writingMatched = allWritingCourses.map(toMatchedInfo);

  const hasBasicWriting = basicWritingCourses.length > 0;
  const hasAdvancedWriting = advancedWritingCourses.length > 0;
  const tookWriting = hasBasicWriting || hasAdvancedWriting;

  // 영어 고급 수강 가능 여부 (영어I + 영어II 이수 후)
  const canTakeAdvancedEnglish = tookEngI && tookEngII;
  const advancedEnglishCourses = findCoursesInSet(allCourses, SET_ENG_ADVANCED);
  const englishIRequirement = basicCatalog.language.englishI;
  const englishIIRequirement = basicCatalog.language.englishII;
  const writingRequirement = basicCatalog.language.writing;

  reqs.push(
    {
      id: englishIRequirement.id,
      categoryKey: 'languageBasic',
      label: courseBasedLabel(
        `${englishIRequirement.label} (${englishIRequirement.requiredCredits}학점)`,
        engIMatched,
        tookEngI,
      ),
      requiredCredits: englishIRequirement.requiredCredits,
      acquiredCredits: tookEngI ? englishIRequirement.requiredCredits : 0,
      missingCredits: tookEngI ? 0 : englishIRequirement.requiredCredits,
      satisfied: tookEngI,
      importance: 'must',
      hint: courseBasedHint(
        engIMatched,
        tookEngI,
        '{year}년 {semester}에 {course}를 이수하여 요건을 충족했습니다.',
        entryYear >= 2021
          ? 'GS1607 학술영어를 이수해야 합니다. (GS1601+GS1603 동시 이수로 대체 가능)'
          : 'GS1601, GS1603, GS1607 중 1과목을 이수해야 합니다.',
      ),
      sourceRefs: basicSourceRefs,
      matchedCourses: engIMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_ENG_I_ALL) },
    },
    {
      id: englishIIRequirement.id,
      categoryKey: 'languageBasic',
      label: courseBasedLabel(
        `${englishIIRequirement.label} (${englishIIRequirement.requiredCredits}학점)`,
        engIIMatched,
        tookEngII,
      ),
      requiredCredits: englishIIRequirement.requiredCredits,
      acquiredCredits: tookEngII ? englishIIRequirement.requiredCredits : 0,
      missingCredits: tookEngII ? 0 : englishIIRequirement.requiredCredits,
      satisfied: tookEngII,
      importance: 'must',
      hint: courseBasedHint(
        engIIMatched,
        tookEngII,
        '{year}년 {semester}에 {course}를 이수하여 요건을 충족했습니다.',
        entryYear >= 2021
          ? 'GS2652 이공계 글쓰기 입문을 이수해야 합니다.'
          : 'GS1602, GS1604, GS2652 중 1과목을 이수해야 합니다.',
      ),
      sourceRefs: basicSourceRefs,
      matchedCourses: engIIMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_ENG_II_ALL) },
    },
    {
      id: writingRequirement.id,
      categoryKey: 'languageBasic',
      label: courseBasedLabel(
        `${writingRequirement.label} (${writingRequirement.requiredCredits}학점)`,
        writingMatched,
        tookWriting,
      ),
      requiredCredits: writingRequirement.requiredCredits,
      acquiredCredits: tookWriting ? writingRequirement.requiredCredits : 0,
      missingCredits: tookWriting ? 0 : writingRequirement.requiredCredits,
      satisfied: tookWriting,
      importance: 'must',
      hint: courseBasedHint(
        writingMatched,
        tookWriting,
        '{year}년 {semester}에 {course}를 이수하여 요건을 충족했습니다.',
        hasAdvancedWriting && !hasBasicWriting
          ? '심화 글쓰기로 요건 충족. (기초 글쓰기 추가 수강 불가)'
          : '글쓰기의 기초(GS1511~1513) 또는 심화 글쓰기(GS1531~1535) 중 1과목을 이수해야 합니다.',
      ),
      sourceRefs: basicSourceRefs,
      matchedCourses: writingMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_WRITING_ALL) },
    },
  );

  // 영어 고급 선이수 조건 확인 (정보성 요건)
  if (advancedEnglishCourses.length > 0 && !canTakeAdvancedEnglish) {
    reqs.push({
      id: 'language-english-advanced-prereq',
      categoryKey: 'languageBasic',
      label: '영어 고급 선이수 조건 ⚠️',
      requiredCredits: 0,
      acquiredCredits: 0,
      missingCredits: 0,
      satisfied: false,
      importance: 'should',
      hint: 'GS2655, GS3651은 영어I + 영어II를 모두 이수한 후에만 수강 가능합니다.',
      sourceRefs: basicSourceRefs,
      matchedCourses: advancedEnglishCourses.map(toMatchedInfo),
    });
  }

  // ===== 2. 기초과학 - 수학 필수 =====
  const calculusCourses = findCoursesInSet(allCourses, SET_CALCULUS);
  const calculusMatched = calculusCourses.map(toMatchedInfo);
  const tookCalculus = calculusCourses.length > 0;

  const coreMathCourses = findCoursesInSet(allCourses, SET_CORE_MATH);
  const coreMathMatched = coreMathCourses.map(toMatchedInfo);
  const tookCoreMath = coreMathCourses.length > 0;
  const calculusRequirement = basicCatalog.scienceBasic.calculus;
  const coreMathRequirement = basicCatalog.scienceBasic.coreMath;

  reqs.push(
    {
      id: calculusRequirement.id,
      categoryKey: 'scienceBasic',
      label: courseBasedLabel(calculusRequirement.label, calculusMatched, tookCalculus),
      requiredCredits: calculusRequirement.requiredCredits,
      acquiredCredits: tookCalculus ? calculusRequirement.requiredCredits : 0,
      missingCredits: tookCalculus ? 0 : calculusRequirement.requiredCredits,
      unit: 'courses',
      satisfied: tookCalculus,
      importance: 'must',
      hint: courseBasedHint(
        calculusMatched,
        tookCalculus,
        '{course}를 이수하여 미적분학 요건을 충족했습니다.',
        'GS1001 또는 GS1011 중 1과목을 이수해야 합니다.',
      ),
      sourceRefs: basicSourceRefs,
      matchedCourses: calculusMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_CALCULUS) },
    },
    {
      id: coreMathRequirement.id,
      categoryKey: 'scienceBasic',
      label: courseBasedLabel(coreMathRequirement.label, coreMathMatched, tookCoreMath),
      requiredCredits: coreMathRequirement.requiredCredits,
      acquiredCredits: tookCoreMath ? coreMathRequirement.requiredCredits : 0,
      missingCredits: tookCoreMath ? 0 : coreMathRequirement.requiredCredits,
      unit: 'courses',
      satisfied: tookCoreMath,
      importance: 'must',
      hint: courseBasedHint(
        coreMathMatched,
        tookCoreMath,
        '{course}를 이수하여 수학 선택 요건을 충족했습니다.',
        '해석학/선형대수 등 CORE MATH 과목 중 1과목을 이수해야 합니다.',
      ),
      sourceRefs: basicSourceRefs,
      matchedCourses: coreMathMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_CORE_MATH) },
    },
  );

  // ===== 3. 기초과학 학점 =====
  const compProgCourses = findCoursesInSet(allCourses, SET_COMP_PROG);
  const tookCompProg = compProgCourses.length > 0;
  const scienceCourses = grouped.scienceBasic ?? [];
  const scienceCredits = sumCredits(scienceCourses);
  const scienceTotalRequirement = basicCatalog.scienceBasic.totalCredits;
  const requiredScienceCredits = tookCompProg
    ? scienceTotalRequirement.withComputerProgrammingCredits
    : scienceTotalRequirement.defaultCredits;
  const scienceSatisfied = scienceCredits >= requiredScienceCredits;

  reqs.push({
    id: scienceTotalRequirement.id,
    categoryKey: 'scienceBasic',
    label: creditBasedLabel(`${scienceTotalRequirement.label} 학점`, requiredScienceCredits, scienceCredits),
    requiredCredits: requiredScienceCredits,
    acquiredCredits: scienceCredits,
    missingCredits: Math.max(0, requiredScienceCredits - scienceCredits),
    satisfied: scienceSatisfied,
    importance: 'must',
    hint: scienceSatisfied
      ? `기초과학 ${scienceCredits}학점을 이수하여 요건(${requiredScienceCredits}학점)을 충족했습니다.`
      : `기초과학 ${requiredScienceCredits - scienceCredits}학점이 더 필요합니다.`,
    sourceRefs: basicSourceRefs,
    matchedCourses: scienceCourses.map(toMatchedInfo),
  });

  // ===== 4. SW 기초 =====
  const swBasicCourses = findCoursesInSet(allCourses, SET_SW_BASIC);
  const swMatched = [...swBasicCourses, ...compProgCourses].map(toMatchedInfo);
  const swSatisfied = swBasicCourses.length > 0 || tookCompProg;
  const softwareBasicRequirement = basicCatalog.scienceBasic.softwareBasic;

  reqs.push({
    id: softwareBasicRequirement.id,
    categoryKey: 'scienceBasic',
    label: courseBasedLabel(softwareBasicRequirement.label, swMatched, swSatisfied),
    requiredCredits: softwareBasicRequirement.requiredCredits,
    acquiredCredits: swSatisfied ? softwareBasicRequirement.requiredCredits : 0,
    missingCredits: swSatisfied ? 0 : softwareBasicRequirement.requiredCredits,
    unit: 'courses',
    satisfied: swSatisfied,
    importance: 'must',
    hint: swSatisfied
      ? tookCompProg
        ? '컴퓨터 프로그래밍(GS1401) 이수로 면제되었습니다.'
        : 'SW 기초와 코딩(GS1490)을 이수하여 요건을 충족했습니다.'
      : 'GS1490을 이수하거나 GS1401로 면제받아야 합니다.',
    sourceRefs: basicSourceRefs,
    matchedCourses: swMatched,
    relatedCoursePatterns: { codePrefixes: Array.from(SET_SW_BASIC) },
  });

  // ===== 5. 인문사회 =====
  const husRequirement = basicCatalog.humanities.hus;
  const ppeRequirement = basicCatalog.humanities.ppe;
  const humanitiesTotalRequirement = basicCatalog.humanities.totalCredits;

  const husCourses = allCourses.filter((c) => isCourseType(c, 'HUS'));
  const husCredits = sumCredits(husCourses);
  const husSatisfied = husCredits >= husRequirement.requiredCredits;

  const ppeCourses = allCourses.filter((c) => isCourseType(c, 'PPE'));
  const ppeCredits = sumCredits(ppeCourses);
  const ppeSatisfied = ppeCredits >= ppeRequirement.requiredCredits;

  const humanitiesCourses = grouped.humanities ?? [];
  const humanitiesCredits = sumCredits(humanitiesCourses);
  const humanitiesSatisfied = humanitiesCredits >= humanitiesTotalRequirement.requiredCredits;

  reqs.push(
    {
      id: husRequirement.id,
      categoryKey: 'humanities',
      label: creditBasedLabel(`${husRequirement.label} 학점`, husRequirement.requiredCredits, husCredits),
      requiredCredits: husRequirement.requiredCredits,
      acquiredCredits: husCredits,
      missingCredits: Math.max(0, husRequirement.requiredCredits - husCredits),
      satisfied: husSatisfied,
      importance: 'must',
      hint: husSatisfied
        ? `HUS 과목 ${husCredits}학점을 이수하여 요건을 충족했습니다.`
        : `HUS 이수구분 과목에서 ${husRequirement.requiredCredits - husCredits}학점이 더 필요합니다.`,
      sourceRefs: basicSourceRefs,
      matchedCourses: husCourses.map(toMatchedInfo),
    },
    {
      id: ppeRequirement.id,
      categoryKey: 'humanities',
      label: creditBasedLabel(`${ppeRequirement.label} 학점`, ppeRequirement.requiredCredits, ppeCredits),
      requiredCredits: ppeRequirement.requiredCredits,
      acquiredCredits: ppeCredits,
      missingCredits: Math.max(0, ppeRequirement.requiredCredits - ppeCredits),
      satisfied: ppeSatisfied,
      importance: 'must',
      hint: ppeSatisfied
        ? `PPE 과목 ${ppeCredits}학점을 이수하여 요건을 충족했습니다.`
        : `PPE 이수구분 과목에서 ${ppeRequirement.requiredCredits - ppeCredits}학점이 더 필요합니다.`,
      sourceRefs: basicSourceRefs,
      matchedCourses: ppeCourses.map(toMatchedInfo),
    },
    {
      id: humanitiesTotalRequirement.id,
      categoryKey: 'humanities',
      label: creditBasedLabel(
        `${humanitiesTotalRequirement.label} 총 학점`,
        humanitiesTotalRequirement.requiredCredits,
        humanitiesCredits,
      ),
      requiredCredits: humanitiesTotalRequirement.requiredCredits,
      acquiredCredits: humanitiesCredits,
      missingCredits: Math.max(0, humanitiesTotalRequirement.requiredCredits - humanitiesCredits),
      satisfied: humanitiesSatisfied,
      importance: 'must',
      hint: humanitiesSatisfied
        ? `인문사회 ${humanitiesCredits}학점을 이수하여 요건을 충족했습니다.`
        : `인문사회 영역에서 ${humanitiesTotalRequirement.requiredCredits - humanitiesCredits}학점이 더 필요합니다.`,
      sourceRefs: basicSourceRefs,
      matchedCourses: humanitiesCourses.map(toMatchedInfo),
    },
  );

  // ===== 6. 공통 필수 =====
  const freshmanCourses = findCoursesInSet(allCourses, SET_FRESHMAN);
  const freshmanMatched = freshmanCourses.map(toMatchedInfo);
  const freshmanTaken = freshmanCourses.length > 0;

  const explorationCourses = findCoursesInSet(allCourses, SET_EXPLORATION);
  const explorationMatched = explorationCourses.map(toMatchedInfo);
  const explorationTaken = explorationCourses.length > 0;
  const freshmanRequirement = basicCatalog.commonMandatory.freshman;
  const majorExplorationRequirement = basicCatalog.commonMandatory.majorExploration;
  const colloquiumRequirement = basicCatalog.commonMandatory.colloquium;

  const colloquiumCourses = allCourses.filter(
    (c) => codeInSet(c, SET_COLLOQUIUM) || normalizeName(c.courseName).includes('콜로퀴움'),
  );
  const colloquiumMatched = colloquiumCourses.map(toMatchedInfo);
  const colloquiumCount = colloquiumCourses.length;
  const colloquiumSatisfied = colloquiumCount >= colloquiumRequirement.requiredCount;

  reqs.push({
    id: freshmanRequirement.id,
    categoryKey: 'etcMandatory',
    label: courseBasedLabel(freshmanRequirement.label, freshmanMatched, freshmanTaken),
    requiredCredits: freshmanRequirement.requiredCredits,
    acquiredCredits: freshmanTaken ? freshmanRequirement.requiredCredits : 0,
    missingCredits: freshmanTaken ? 0 : freshmanRequirement.requiredCredits,
    satisfied: freshmanTaken,
    importance: 'must',
    hint: courseBasedHint(
      freshmanMatched,
      freshmanTaken,
      '{year}년 {semester}에 {course}를 이수했습니다.',
      'GS1901 또는 GS9301을 이수해야 합니다.',
    ),
    sourceRefs: basicSourceRefs,
    matchedCourses: freshmanMatched,
    relatedCoursePatterns: { codePrefixes: Array.from(SET_FRESHMAN) },
  });

  if (majorExplorationRequirement) {
    reqs.push({
      id: majorExplorationRequirement.id,
      categoryKey: 'etcMandatory',
      label: courseBasedLabel(majorExplorationRequirement.label, explorationMatched, explorationTaken),
      requiredCredits: majorExplorationRequirement.requiredCredits,
      acquiredCredits: explorationTaken ? majorExplorationRequirement.requiredCredits : 0,
      missingCredits: explorationTaken ? 0 : majorExplorationRequirement.requiredCredits,
      satisfied: explorationTaken,
      importance: 'must',
      hint: courseBasedHint(
        explorationMatched,
        explorationTaken,
        '{year}년 {semester}에 {course}를 이수했습니다.',
        '2021학번 이후는 UC0902 전공탐색을 필수로 이수해야 합니다.',
      ),
      sourceRefs: basicSourceRefs,
      matchedCourses: explorationMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_EXPLORATION) },
    });
  }

  reqs.push({
    id: colloquiumRequirement.id,
    categoryKey: 'etcMandatory',
    label: creditBasedLabel(colloquiumRequirement.label, colloquiumRequirement.requiredCount, colloquiumCount, '회'),
    requiredCredits: colloquiumRequirement.requiredCount,
    acquiredCredits: colloquiumCount,
    missingCredits: Math.max(0, colloquiumRequirement.requiredCount - colloquiumCount),
    unit: 'occurrences',
    satisfied: colloquiumSatisfied,
    importance: 'must',
    hint: colloquiumSatisfied
      ? `콜로퀴움을 ${colloquiumCount}회 이수하여 요건을 충족했습니다.`
      : `콜로퀴움을 ${colloquiumRequirement.requiredCount - colloquiumCount}회 더 이수해야 합니다.`,
    sourceRefs: basicSourceRefs,
    matchedCourses: colloquiumMatched,
    relatedCoursePatterns: { codePrefixes: Array.from(SET_COLLOQUIUM) },
  });

  // ===== 6-1. 과학기술과 경제 (1학점 필수) =====
  const scienceEconomyCourses = findCoursesInSet(allCourses, SET_SCIENCE_ECONOMY);
  const scienceEconomyMatched = scienceEconomyCourses.map(toMatchedInfo);
  const scienceEconomyTaken = scienceEconomyCourses.length > 0;
  const scienceEconomyRequirement = basicCatalog.commonMandatory.scienceEconomy;

  reqs.push({
    id: scienceEconomyRequirement.id,
    categoryKey: 'etcMandatory',
    label: courseBasedLabel(scienceEconomyRequirement.label, scienceEconomyMatched, scienceEconomyTaken),
    requiredCredits: scienceEconomyRequirement.requiredCredits,
    acquiredCredits: scienceEconomyTaken ? scienceEconomyRequirement.requiredCredits : 0,
    missingCredits: scienceEconomyTaken ? 0 : scienceEconomyRequirement.requiredCredits,
    satisfied: scienceEconomyTaken,
    importance: 'must',
    hint: courseBasedHint(
      scienceEconomyMatched,
      scienceEconomyTaken,
      '{year}년 {semester}에 {course}를 이수했습니다.',
      `${scienceEconomyRequirement.acceptedCodes.join(', ')} 중 1과목을 이수해야 합니다.`,
    ),
    sourceRefs: basicSourceRefs,
    matchedCourses: scienceEconomyMatched,
    relatedCoursePatterns: { codePrefixes: Array.from(SET_SCIENCE_ECONOMY) },
  });

  // ===== 7. 예체능 =====
  const artsRequirement = basicCatalog.artsSports.arts;
  const sportsRequirement = basicCatalog.artsSports.sports;

  // 예능 과목 (GS0201~GS0213)
  const artCourses = findCoursesInSet(allCourses, ARTS_EDUCATION_CODES);
  const artMatched = artCourses.map(toMatchedInfo);
  const artCount = artCourses.length;
  const artSatisfied = artCount >= artsRequirement.requiredCount;

  // 체육 과목 (GS0101~GS0115)
  const sportCourses = findCoursesInSet(allCourses, PHYSICAL_EDUCATION_CODES);
  const sportMatched = sportCourses.map(toMatchedInfo);
  const sportCount = sportCourses.length;
  const sportSatisfied = sportCount >= sportsRequirement.requiredCount;

  reqs.push(
    {
      id: artsRequirement.id,
      categoryKey: 'otherUncheckedClass',
      label: creditBasedLabel(artsRequirement.label, artsRequirement.requiredCount, artCount, '과목'),
      requiredCredits: artsRequirement.requiredCount,
      acquiredCredits: artCount,
      missingCredits: Math.max(0, artsRequirement.requiredCount - artCount),
      unit: 'courses',
      satisfied: artSatisfied,
      importance: 'must',
      hint: artSatisfied
        ? `예술 교양 ${artCount}과목을 이수하여 요건을 충족했습니다.`
        : `예술 교양 ${artsRequirement.requiredCount - artCount}과목이 더 필요합니다.`,
      sourceRefs: basicSourceRefs,
      matchedCourses: artMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(ARTS_EDUCATION_CODES) },
    },
    {
      id: sportsRequirement.id,
      categoryKey: 'otherUncheckedClass',
      label: creditBasedLabel(sportsRequirement.label, sportsRequirement.requiredCount, sportCount, '과목'),
      requiredCredits: sportsRequirement.requiredCount,
      acquiredCredits: sportCount,
      missingCredits: Math.max(0, sportsRequirement.requiredCount - sportCount),
      unit: 'courses',
      satisfied: sportSatisfied,
      importance: 'must',
      hint: sportSatisfied
        ? `체육 ${sportCount}과목을 이수하여 요건을 충족했습니다.`
        : `체육 ${sportsRequirement.requiredCount - sportCount}과목이 더 필요합니다.`,
      sourceRefs: basicSourceRefs,
      matchedCourses: sportMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(PHYSICAL_EDUCATION_CODES) },
    },
  );

  // ===== 7-1. 부전공 학점 (15학점) =====
  if (userMinors?.length) {
    userMinors.forEach((minorCode) => {
      const declarationTerm = getMinorDeclarationTerm(minorCode, minorDeclarationTerms);
      if (requiresMinorDeclarationTerm(minorCode) && !declarationTerm) {
        const declarationRequirement = getMinorDeclarationTermRequirement(minorCode);
        reqs.push({
          id: declarationRequirement?.missingTermRequirementId ?? `minor-declaration-term-${minorCode}`,
          categoryKey: 'minor',
          label: declarationRequirement?.missingTermLabel ?? `${minorCode} 부전공 선언 학기 확인 필요`,
          requiredCredits: 0,
          acquiredCredits: 0,
          missingCredits: 0,
          satisfied: false,
          status: 'needs_review',
          importance: 'must',
          hint:
            declarationRequirement?.missingTermHint ??
            `${minorCode} 부전공은 선언 학기에 따라 필수과목 적용 여부가 달라져 선언 학기 정보가 필요합니다.`,
          sourceRefs: declarationRequirement?.sourceRefs,
          matchedCourses: [],
        });
      }

      const minorCourseLimit = applyIrAiCodeCourseLimit(
        minorCode,
        (grouped.minor ?? []).filter((c) => matchesMinor(c.courseCode, minorCode)),
        entryYear,
        declarationTerm,
      );
      const minorCourses = minorCourseLimit.accepted;
      const minorMatched = minorCourses.map(toMatchedInfo);
      const minorExcluded = minorCourseLimit.excluded.map((course) =>
        toExcludedCourseInfo(course, minorCourseLimit.reason ?? '부전공 이수학점 인정 제한으로 제외되었습니다.'),
      );
      const minorCredits = sumCredits(minorCourses);
      const minorCreditRequirement = getMinorCreditRequirement(minorCode, entryYear);
      const requiredMinorCredits = minorCreditRequirement.requiredCredits;
      const minorSatisfied = minorCredits >= requiredMinorCredits;

      reqs.push({
        id: `minor-credits-${minorCode}`,
        categoryKey: 'minor',
        label: creditBasedLabel(`${minorCode} 부전공`, requiredMinorCredits, minorCredits),
        requiredCredits: requiredMinorCredits,
        acquiredCredits: minorCredits,
        missingCredits: Math.max(0, requiredMinorCredits - minorCredits),
        satisfied: minorSatisfied,
        importance: 'must',
        hint: minorSatisfied
          ? `${minorCode} 부전공 ${minorCredits}학점을 이수하여 요건을 충족했습니다.`
          : `${minorCode} 부전공 ${Math.max(0, requiredMinorCredits - minorCredits)}학점이 더 필요합니다.`,
        sourceRefs: minorCreditRequirement.sourceRefs,
        matchedCourses: minorMatched,
        excludedCourses: minorExcluded.length > 0 ? minorExcluded : undefined,
      });
    });
  }

  // ===== 8. 전공 학점 및 필수 =====
  const majorCreditRequirement = getMajorCreditRequirement(entryYear);
  if (!userMajor) {
    reqs.push({
      id: 'major-context',
      categoryKey: 'major',
      label: unresolvedUserMajorInput ? `전공 정보 확인 필요 (${unresolvedUserMajorInput})` : '전공 정보 확인 필요',
      requiredCredits: 0,
      acquiredCredits: 0,
      missingCredits: 0,
      satisfied: false,
      status: 'needs_review',
      importance: 'must',
      hint: unresolvedUserMajorInput
        ? `입력된 전공 "${unresolvedUserMajorInput}"을 지원 전공 코드로 해석할 수 없습니다. 전공 학점과 전공필수 요건을 판정하려면 전공 정보를 확인해야 합니다.`
        : '전공 학점과 전공필수 요건을 판정하려면 학생의 전공 정보가 필요합니다.',
      sourceRefs: majorCreditRequirement.sourceRefs,
      matchedCourses: [],
    });
  } else {
    const majorCourses = grouped.major ?? [];
    const majorMatched = majorCourses.map(toMatchedInfo);
    const majorCredits = sumCredits(majorCourses);
    const requiredMajorCredits = majorCreditRequirement.requiredCredits;
    const majorSatisfied = majorCredits >= requiredMajorCredits;

    reqs.push({
      id: majorCreditRequirement.id,
      categoryKey: 'major',
      label: creditBasedLabel(majorCreditRequirement.label, requiredMajorCredits, majorCredits),
      requiredCredits: requiredMajorCredits,
      acquiredCredits: majorCredits,
      missingCredits: Math.max(0, requiredMajorCredits - majorCredits),
      satisfied: majorSatisfied,
      importance: 'must',
      hint: majorSatisfied
        ? `전공 ${majorCredits}학점을 이수하여 요건을 충족했습니다.`
        : `전공 ${requiredMajorCredits - majorCredits}학점이 더 필요합니다.`,
      sourceRefs: majorCreditRequirement.sourceRefs,
      matchedCourses: majorMatched,
    });

    // ===== 8-1. 전공 필수 (세부 과목 요건: 택1, 택3 등) =====
    const majorMandatoryRules = getMajorMandatoryRulesForContext(userMajor, { entryYear });
    if (majorMandatoryRules.length > 0) {
      const rules = majorMandatoryRules;
      rules.forEach((rule, idx) => {
        // Find matching courses in allCourses (or majorCourses)
        // Rule courses are usually major courses, but searching in allCourses is safer in case of cross-listing
        const matched = findCoursesInSet(allCourses, new Set(rule.courses));
        const matchedInfo = matched.map(toMatchedInfo);
        const matchCount = matched.length; // Count of courses taken
        const satisfied = matchCount >= rule.requiredCount;

        reqs.push({
          id: `major-mandatory-rule-${userMajor}-${idx}`,
          categoryKey: 'major',
          label: creditBasedLabel(rule.label, rule.requiredCount, matchCount, '과목'),
          requiredCredits: rule.requiredCount, // Using count as required unit
          acquiredCredits: matchCount,
          missingCredits: Math.max(0, rule.requiredCount - matchCount),
          unit: 'courses',
          satisfied: satisfied,
          importance: 'must',
          hint: satisfied
            ? `${rule.label} 요건을 충족했습니다.`
            : `${rule.label} 요건을 위해 ${Math.max(0, rule.requiredCount - matchCount)}과목을 더 이수해야 합니다.`,
          sourceRefs: rule.sourceRefs,
          matchedCourses: matchedInfo,
          relatedCoursePatterns: { codePrefixes: [...rule.courses] },
        });
      });
    }
  }

  // ===== 8-2. 부전공 필수 (있는 경우) =====
  if (userMinors?.length) {
    userMinors.forEach((minorCode) => {
      const declarationTerm = getMinorDeclarationTerm(minorCode, minorDeclarationTerms);
      const rules = getMinorMandatoryRulesForContext(minorCode, { entryYear, declarationTerm });
      if (rules) {
        rules.forEach((rule, idx) => {
          const matched = findCoursesInSet(allCourses, new Set(rule.courses));
          const matchedInfo = matched.map(toMatchedInfo);
          const matchCount = matched.length;
          const satisfied = matchCount >= rule.requiredCount;

          reqs.push({
            id: `minor-mandatory-rule-${minorCode}-${idx}`,
            categoryKey: 'minor',
            label: creditBasedLabel(rule.label, rule.requiredCount, matchCount, '과목'),
            requiredCredits: rule.requiredCount, // count based
            acquiredCredits: matchCount,
            missingCredits: Math.max(0, rule.requiredCount - matchCount),
            unit: 'courses',
            satisfied: satisfied,
            importance: 'must',
            hint: satisfied
              ? `${rule.label} 요건을 충족했습니다.`
              : `${rule.label} 요건을 위해 ${Math.max(0, rule.requiredCount - matchCount)}과목을 더 이수해야 합니다.`,
            sourceRefs: rule.sourceRefs,
            matchedCourses: matchedInfo,
            relatedCoursePatterns: { codePrefixes: [...rule.courses] },
          });
        });
      }
    });
  }

  // ===== 9. 학사논문연구 =====
  getThesisRequirements(entryYear).forEach((requirement) => {
    const thesisCourses = findCoursesWithSuffix(allCourses, requirement.suffix);
    const thesisMatched = thesisCourses.map(toMatchedInfo);
    const thesisSatisfied = thesisCourses.length > 0;

    reqs.push({
      id: requirement.id,
      categoryKey: 'etcMandatory',
      label: courseBasedLabel(requirement.label, thesisMatched, thesisSatisfied),
      requiredCredits: requirement.requiredCount,
      acquiredCredits: thesisSatisfied ? requirement.requiredCount : 0,
      missingCredits: thesisSatisfied ? 0 : requirement.requiredCount,
      unit: 'courses',
      satisfied: thesisSatisfied,
      importance: 'must',
      hint: courseBasedHint(
        thesisMatched,
        thesisSatisfied,
        '{year}년 {semester}에 {course}를 이수했습니다.',
        `전공코드+${requirement.suffix} 형태의 ${requirement.label}을 이수해야 합니다.`,
      ),
      sourceRefs: requirement.sourceRefs,
      matchedCourses: thesisMatched,
    });
  });

  return reqs;
}
