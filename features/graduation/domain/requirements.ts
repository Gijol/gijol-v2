/**
 * Fine-Grained Requirements Builder - Embedded from legacy grad-requirements.ts
 * Generates detailed graduation requirement checks based on actual courses taken
 */

import { HUS_COURSES, PPE_COURSES, MAJOR_MANDATORY_RULES } from './constants';
import { matchesMinor } from './classifier';
import type { TakenCourseType, CategoryKey, YearRuleSet, FineGrainedRequirement, MatchedCourseInfo } from './types';

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

  if (normType === 'HUS' && HUS_COURSES.has(code)) return true;
  if (normType === 'PPE' && PPE_COURSES.has(code)) return true;

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

const SET_ENG_I = new Set(['GS1601', 'GS1603', 'GS1607']);
const SET_ENG_II = new Set(['GS1602', 'GS1604', 'GS2652']);
const SET_WRITING = new Set(['GS1511', 'GS1512', 'GS1513', 'GS1531', 'GS1532', 'GS1533', 'GS1534']);

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

const RESEARCH_I_SUFFIX = '9102';
const RESEARCH_II_SUFFIX = '9103';

const CODE_ART_PREFIX = 'GS02';
const CODE_SPORT_PREFIX = 'GS01';

const MAJOR_MANDATORY: Record<string, string[]> = {
  EC: ['EC3101', 'EC3102'],
  MA: ['MA2101', 'MA2102', 'MA2103', 'MA2104', 'MA3104', 'MA3105'],
  MC: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106', 'MC3107'],
};

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

function normalizeMajorCode(major?: string): string {
  if (!major) return '';
  return normalizeCode(major).slice(0, 2) || '';
}

// ===== Main Builder =====

export interface AnalyzeContext {
  allCourses: TakenCourseType[];
  grouped: Record<CategoryKey, TakenCourseType[]>;
  ruleSet: YearRuleSet;
  entryYear: number;
  userMajor?: string;
  userMinors?: string[];
}

export function buildFineGrainedRequirements(ctx: AnalyzeContext): FineGrainedRequirement[] {
  const { allCourses, grouped, ruleSet, entryYear, userMajor, userMinors } = ctx;
  const reqs: FineGrainedRequirement[] = [];

  // ===== 0. Total Credits =====
  const totalCredits = sumCredits(allCourses);
  const totalSatisfied = totalCredits >= ruleSet.minTotalCredits;
  const totalMissing = Math.max(0, ruleSet.minTotalCredits - totalCredits);
  reqs.push({
    id: 'total-credits',
    categoryKey: 'otherUncheckedClass',
    label: creditBasedLabel('총 이수학점', ruleSet.minTotalCredits, totalCredits),
    requiredCredits: ruleSet.minTotalCredits,
    acquiredCredits: totalCredits,
    missingCredits: totalMissing,
    satisfied: totalSatisfied,
    importance: 'must',
    hint: totalSatisfied
      ? `축하합니다! 총 ${totalCredits}학점을 이수하여 요건을 충족했습니다.`
      : `졸업을 위해 ${totalMissing}학점을 더 이수해야 합니다.`,
    matchedCourses: allCourses.map(toMatchedInfo),
  });

  // ===== 1. 언어의 기초 =====
  const engICourses = findCoursesInSet(allCourses, SET_ENG_I);
  const engIMatched = engICourses.map(toMatchedInfo);
  const tookEngI = engICourses.length > 0;

  const engIICourses = findCoursesInSet(allCourses, SET_ENG_II);
  const engIIMatched = engIICourses.map(toMatchedInfo);
  const tookEngII = engIICourses.length > 0;

  const writingCourses = findCoursesInSet(allCourses, SET_WRITING);
  const writingMatched = writingCourses.map(toMatchedInfo);
  const tookWriting = writingCourses.length > 0;

  reqs.push(
    {
      id: 'language-english-i',
      categoryKey: 'languageBasic',
      label: courseBasedLabel('English I', engIMatched, tookEngI),
      requiredCredits: 1,
      acquiredCredits: tookEngI ? 1 : 0,
      missingCredits: tookEngI ? 0 : 1,
      satisfied: tookEngI,
      importance: 'must',
      hint: courseBasedHint(
        engIMatched,
        tookEngI,
        '{year}년 {semester}에 {course}를 이수하여 요건을 충족했습니다.',
        'GS1601, GS1603, GS1607 중 1과목을 이수해야 합니다.',
      ),
      matchedCourses: engIMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_ENG_I) },
    },
    {
      id: 'language-english-ii',
      categoryKey: 'languageBasic',
      label: courseBasedLabel('English II', engIIMatched, tookEngII),
      requiredCredits: 1,
      acquiredCredits: tookEngII ? 1 : 0,
      missingCredits: tookEngII ? 0 : 1,
      satisfied: tookEngII,
      importance: 'must',
      hint: courseBasedHint(
        engIIMatched,
        tookEngII,
        '{year}년 {semester}에 {course}를 이수하여 요건을 충족했습니다.',
        'GS1602, GS1604, GS2652 중 1과목을 이수해야 합니다.',
      ),
      matchedCourses: engIIMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_ENG_II) },
    },
    {
      id: 'language-writing',
      categoryKey: 'languageBasic',
      label: courseBasedLabel('글쓰기', writingMatched, tookWriting),
      requiredCredits: 1,
      acquiredCredits: tookWriting ? 1 : 0,
      missingCredits: tookWriting ? 0 : 1,
      satisfied: tookWriting,
      importance: 'must',
      hint: courseBasedHint(
        writingMatched,
        tookWriting,
        '{year}년 {semester}에 {course}를 이수하여 요건을 충족했습니다.',
        'GS1511~GS1534 중 1과목을 이수해야 합니다.',
      ),
      matchedCourses: writingMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_WRITING) },
    },
  );

  // ===== 2. 기초과학 - 수학 필수 =====
  const calculusCourses = findCoursesInSet(allCourses, SET_CALCULUS);
  const calculusMatched = calculusCourses.map(toMatchedInfo);
  const tookCalculus = calculusCourses.length > 0;

  const coreMathCourses = findCoursesInSet(allCourses, SET_CORE_MATH);
  const coreMathMatched = coreMathCourses.map(toMatchedInfo);
  const tookCoreMath = coreMathCourses.length > 0;

  reqs.push(
    {
      id: 'science-calculus',
      categoryKey: 'scienceBasic',
      label: courseBasedLabel('미적분학', calculusMatched, tookCalculus),
      requiredCredits: 1,
      acquiredCredits: tookCalculus ? 1 : 0,
      missingCredits: tookCalculus ? 0 : 1,
      satisfied: tookCalculus,
      importance: 'must',
      hint: courseBasedHint(
        calculusMatched,
        tookCalculus,
        '{course}를 이수하여 미적분학 요건을 충족했습니다.',
        'GS1001 또는 GS1011 중 1과목을 이수해야 합니다.',
      ),
      matchedCourses: calculusMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_CALCULUS) },
    },
    {
      id: 'science-core-math',
      categoryKey: 'scienceBasic',
      label: courseBasedLabel('수학 선택 필수', coreMathMatched, tookCoreMath),
      requiredCredits: 1,
      acquiredCredits: tookCoreMath ? 1 : 0,
      missingCredits: tookCoreMath ? 0 : 1,
      satisfied: tookCoreMath,
      importance: 'must',
      hint: courseBasedHint(
        coreMathMatched,
        tookCoreMath,
        '{course}를 이수하여 수학 선택 요건을 충족했습니다.',
        '해석학/선형대수 등 CORE MATH 과목 중 1과목을 이수해야 합니다.',
      ),
      matchedCourses: coreMathMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_CORE_MATH) },
    },
  );

  // ===== 3. 기초과학 학점 =====
  const compProgCourses = findCoursesInSet(allCourses, SET_COMP_PROG);
  const tookCompProg = compProgCourses.length > 0;
  const scienceCourses = grouped.scienceBasic ?? [];
  const scienceCredits = sumCredits(scienceCourses);
  const requiredScienceCredits = tookCompProg ? 17 : 18;
  const scienceSatisfied = scienceCredits >= requiredScienceCredits;

  reqs.push({
    id: 'science-total',
    categoryKey: 'scienceBasic',
    label: creditBasedLabel('기초과학 학점', requiredScienceCredits, scienceCredits),
    requiredCredits: requiredScienceCredits,
    acquiredCredits: scienceCredits,
    missingCredits: Math.max(0, requiredScienceCredits - scienceCredits),
    satisfied: scienceSatisfied,
    importance: 'must',
    hint: scienceSatisfied
      ? `기초과학 ${scienceCredits}학점을 이수하여 요건(${requiredScienceCredits}학점)을 충족했습니다.`
      : `기초과학 ${requiredScienceCredits - scienceCredits}학점이 더 필요합니다.`,
    matchedCourses: scienceCourses.map(toMatchedInfo),
  });

  // ===== 4. SW 기초 =====
  const swBasicCourses = findCoursesInSet(allCourses, SET_SW_BASIC);
  const swMatched = [...swBasicCourses, ...compProgCourses].map(toMatchedInfo);
  const swSatisfied = swBasicCourses.length > 0 || tookCompProg;

  reqs.push({
    id: 'science-sw-basic',
    categoryKey: 'scienceBasic',
    label: courseBasedLabel('SW 기초와 코딩', swMatched, swSatisfied),
    requiredCredits: 1,
    acquiredCredits: swSatisfied ? 1 : 0,
    missingCredits: swSatisfied ? 0 : 1,
    satisfied: swSatisfied,
    importance: 'must',
    hint: swSatisfied
      ? tookCompProg
        ? '컴퓨터 프로그래밍(GS1401) 이수로 면제되었습니다.'
        : 'SW 기초와 코딩(GS1490)을 이수하여 요건을 충족했습니다.'
      : 'GS1490을 이수하거나 GS1401로 면제받아야 합니다.',
    matchedCourses: swMatched,
    relatedCoursePatterns: { codePrefixes: Array.from(SET_SW_BASIC) },
  });

  // ===== 5. 인문사회 =====
  const husCourses = allCourses.filter((c) => isCourseType(c, 'HUS'));
  const husCredits = sumCredits(husCourses);
  const husSatisfied = husCredits >= 6;

  const ppeCourses = allCourses.filter((c) => isCourseType(c, 'PPE'));
  const ppeCredits = sumCredits(ppeCourses);
  const ppeSatisfied = ppeCredits >= 6;

  const humanitiesCourses = grouped.humanities ?? [];
  const humanitiesCredits = sumCredits(humanitiesCourses);
  const humanitiesSatisfied = humanitiesCredits >= 24;

  reqs.push(
    {
      id: 'humanities-hus',
      categoryKey: 'humanities',
      label: creditBasedLabel('HUS 학점', 6, husCredits),
      requiredCredits: 6,
      acquiredCredits: husCredits,
      missingCredits: Math.max(0, 6 - husCredits),
      satisfied: husSatisfied,
      importance: 'must',
      hint: husSatisfied
        ? `HUS 과목 ${husCredits}학점을 이수하여 요건을 충족했습니다.`
        : `HUS 이수구분 과목에서 ${6 - husCredits}학점이 더 필요합니다.`,
      matchedCourses: husCourses.map(toMatchedInfo),
    },
    {
      id: 'humanities-ppe',
      categoryKey: 'humanities',
      label: creditBasedLabel('PPE 학점', 6, ppeCredits),
      requiredCredits: 6,
      acquiredCredits: ppeCredits,
      missingCredits: Math.max(0, 6 - ppeCredits),
      satisfied: ppeSatisfied,
      importance: 'must',
      hint: ppeSatisfied
        ? `PPE 과목 ${ppeCredits}학점을 이수하여 요건을 충족했습니다.`
        : `PPE 이수구분 과목에서 ${6 - ppeCredits}학점이 더 필요합니다.`,
      matchedCourses: ppeCourses.map(toMatchedInfo),
    },
    {
      id: 'humanities-total',
      categoryKey: 'humanities',
      label: creditBasedLabel('인문사회 총 학점', 24, humanitiesCredits),
      requiredCredits: 24,
      acquiredCredits: humanitiesCredits,
      missingCredits: Math.max(0, 24 - humanitiesCredits),
      satisfied: humanitiesSatisfied,
      importance: 'must',
      hint: humanitiesSatisfied
        ? `인문사회 ${humanitiesCredits}학점을 이수하여 요건을 충족했습니다.`
        : `인문사회 영역에서 ${24 - humanitiesCredits}학점이 더 필요합니다.`,
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

  const colloquiumCourses = allCourses.filter(
    (c) => codeInSet(c, SET_COLLOQUIUM) || normalizeName(c.courseName).includes('콜로퀴움'),
  );
  const colloquiumMatched = colloquiumCourses.map(toMatchedInfo);
  const colloquiumCount = colloquiumCourses.length;
  const colloquiumSatisfied = colloquiumCount >= 2;

  reqs.push({
    id: 'etc-freshman',
    categoryKey: 'etcMandatory',
    label: courseBasedLabel('GIST 새내기', freshmanMatched, freshmanTaken),
    requiredCredits: 1,
    acquiredCredits: freshmanTaken ? 1 : 0,
    missingCredits: freshmanTaken ? 0 : 1,
    satisfied: freshmanTaken,
    importance: 'must',
    hint: courseBasedHint(
      freshmanMatched,
      freshmanTaken,
      '{year}년 {semester}에 {course}를 이수했습니다.',
      'GS1901 또는 GS9301을 이수해야 합니다.',
    ),
    matchedCourses: freshmanMatched,
    relatedCoursePatterns: { codePrefixes: Array.from(SET_FRESHMAN) },
  });

  if (entryYear >= 2021) {
    reqs.push({
      id: 'etc-major-exploration',
      categoryKey: 'etcMandatory',
      label: courseBasedLabel('전공탐색', explorationMatched, explorationTaken),
      requiredCredits: 1,
      acquiredCredits: explorationTaken ? 1 : 0,
      missingCredits: explorationTaken ? 0 : 1,
      satisfied: explorationTaken,
      importance: 'must',
      hint: courseBasedHint(
        explorationMatched,
        explorationTaken,
        '{year}년 {semester}에 {course}를 이수했습니다.',
        '2021학번 이후는 UC0902 전공탐색을 필수로 이수해야 합니다.',
      ),
      matchedCourses: explorationMatched,
      relatedCoursePatterns: { codePrefixes: Array.from(SET_EXPLORATION) },
    });
  }

  reqs.push({
    id: 'etc-colloquium',
    categoryKey: 'etcMandatory',
    label: creditBasedLabel('GIST대학 콜로퀴움', 2, colloquiumCount, '회'),
    requiredCredits: 2,
    acquiredCredits: colloquiumCount,
    missingCredits: Math.max(0, 2 - colloquiumCount),
    satisfied: colloquiumSatisfied,
    importance: 'must',
    hint: colloquiumSatisfied
      ? `콜로퀴움을 ${colloquiumCount}회 이수하여 요건을 충족했습니다.`
      : `콜로퀴움을 ${2 - colloquiumCount}회 더 이수해야 합니다.`,
    matchedCourses: colloquiumMatched,
    relatedCoursePatterns: { codePrefixes: Array.from(SET_COLLOQUIUM) },
  });

  // ===== 7. 예체능 =====
  const requiredArtSportCount = entryYear >= 2020 ? 2 : 4;
  const artCourses = findCoursesWithPrefix(allCourses, CODE_ART_PREFIX);
  const artMatched = artCourses.map(toMatchedInfo);
  const artCount = artCourses.length;
  const artSatisfied = artCount >= requiredArtSportCount;

  const sportCourses = findCoursesWithPrefix(allCourses, CODE_SPORT_PREFIX);
  const sportMatched = sportCourses.map(toMatchedInfo);
  const sportCount = sportCourses.length;
  const sportSatisfied = sportCount >= requiredArtSportCount;

  reqs.push(
    {
      id: 'arts',
      categoryKey: 'otherUncheckedClass',
      label: creditBasedLabel('예술 교양', requiredArtSportCount, artCount, '과목'),
      requiredCredits: requiredArtSportCount,
      acquiredCredits: artCount,
      missingCredits: Math.max(0, requiredArtSportCount - artCount),
      satisfied: artSatisfied,
      importance: 'must',
      hint: artSatisfied
        ? `예술 교양 ${artCount}과목을 이수하여 요건을 충족했습니다.`
        : `예술 교양 ${requiredArtSportCount - artCount}과목이 더 필요합니다.`,
      matchedCourses: artMatched,
    },
    {
      id: 'sports',
      categoryKey: 'otherUncheckedClass',
      label: creditBasedLabel('체육', requiredArtSportCount, sportCount, '과목'),
      requiredCredits: requiredArtSportCount,
      acquiredCredits: sportCount,
      missingCredits: Math.max(0, requiredArtSportCount - sportCount),
      satisfied: sportSatisfied,
      importance: 'must',
      hint: sportSatisfied
        ? `체육 ${sportCount}과목을 이수하여 요건을 충족했습니다.`
        : `체육 ${requiredArtSportCount - sportCount}과목이 더 필요합니다.`,
      matchedCourses: sportMatched,
    },
  );

  // ===== 7-1. 부전공 학점 (15학점) =====
  if (userMinors?.length) {
    userMinors.forEach((minorCode) => {
      const minorCourses = (grouped.minor ?? []).filter((c) => matchesMinor(c.courseCode, minorCode));
      const minorMatched = minorCourses.map(toMatchedInfo);
      const minorCredits = sumCredits(minorCourses);
      const minorSatisfied = minorCredits >= 15;

      reqs.push({
        id: `minor-credits-${minorCode}`,
        categoryKey: 'minor',
        label: creditBasedLabel(`${minorCode} 부전공`, 15, minorCredits),
        requiredCredits: 15,
        acquiredCredits: minorCredits,
        missingCredits: Math.max(0, 15 - minorCredits),
        satisfied: minorSatisfied,
        importance: 'must',
        hint: minorSatisfied
          ? `${minorCode} 부전공 ${minorCredits}학점을 이수하여 요건을 충족했습니다.`
          : `${minorCode} 부전공 ${Math.max(0, 15 - minorCredits)}학점이 더 필요합니다.`,
        matchedCourses: minorMatched,
      });
    });
  }

  // ===== 8. 전공 학점 및 필수 =====
  const majorCode = normalizeMajorCode(userMajor);
  const majorCourses = grouped.major ?? [];
  const majorMatched = majorCourses.map(toMatchedInfo);
  const majorCredits = sumCredits(majorCourses);
  const majorSatisfied = majorCredits >= 36;

  reqs.push({
    id: 'major-credits',
    categoryKey: 'major',
    label: creditBasedLabel('전공 학점', 36, majorCredits),
    requiredCredits: 36,
    acquiredCredits: majorCredits,
    missingCredits: Math.max(0, 36 - majorCredits),
    satisfied: majorSatisfied,
    importance: 'must',
    hint: majorSatisfied
      ? `전공 ${majorCredits}학점을 이수하여 요건을 충족했습니다.`
      : `전공 ${36 - majorCredits}학점이 더 필요합니다.`,
    matchedCourses: majorMatched,
  });

  // ===== 8-1. 전공 필수 (세부 과목 요건: 택1, 택3 등) =====
  if (userMajor && MAJOR_MANDATORY_RULES[userMajor]) {
    const rules = MAJOR_MANDATORY_RULES[userMajor];
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
        satisfied: satisfied,
        importance: 'must',
        hint: satisfied
          ? `${rule.label} 요건을 충족했습니다.`
          : `${rule.label} 요건을 위해 ${Math.max(0, rule.requiredCount - matchCount)}과목을 더 이수해야 합니다.`,
        matchedCourses: matchedInfo,
        relatedCoursePatterns: { codePrefixes: rule.courses },
      });
    });
  }

  // ===== 9. 학사논문연구 =====
  const thesisICourses = findCoursesWithSuffix(allCourses, RESEARCH_I_SUFFIX);
  const thesisIMatched = thesisICourses.map(toMatchedInfo);
  const thesisI = thesisICourses.length > 0;

  const thesisIICourses = findCoursesWithSuffix(allCourses, RESEARCH_II_SUFFIX);
  const thesisIIMatched = thesisIICourses.map(toMatchedInfo);
  const thesisII = thesisIICourses.length > 0;

  reqs.push(
    {
      id: 'thesis-i',
      categoryKey: 'etcMandatory',
      label: courseBasedLabel('학사논문연구 I', thesisIMatched, thesisI),
      requiredCredits: 1,
      acquiredCredits: thesisI ? 1 : 0,
      missingCredits: thesisI ? 0 : 1,
      satisfied: thesisI,
      importance: 'must',
      hint: courseBasedHint(
        thesisIMatched,
        thesisI,
        '{year}년 {semester}에 {course}를 이수했습니다.',
        '전공코드+9102 형태의 학사논문연구 I을 이수해야 합니다.',
      ),
      matchedCourses: thesisIMatched,
    },
    {
      id: 'thesis-ii',
      categoryKey: 'etcMandatory',
      label: courseBasedLabel('학사논문연구 II', thesisIIMatched, thesisII),
      requiredCredits: 1,
      acquiredCredits: thesisII ? 1 : 0,
      missingCredits: thesisII ? 0 : 1,
      satisfied: thesisII,
      importance: 'must',
      hint: courseBasedHint(
        thesisIIMatched,
        thesisII,
        '{year}년 {semester}에 {course}를 이수했습니다.',
        '전공코드+9103 형태의 학사논문연구 II을 이수해야 합니다.',
      ),
      matchedCourses: thesisIIMatched,
    },
  );

  return reqs;
}
