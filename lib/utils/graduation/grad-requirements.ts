import { TakenCourseType } from '@lib/types/grad';
import { FineGrainedRequirement } from '@lib/types/grad-requirements';
import { CategoryKey, YearRuleSet } from './grad-rules';

function normalizeCode(code?: string) {
  if (!code) return '';
  return String(code)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function normalizeName(name?: string) {
  return (name || '').toString().toLowerCase();
}

function sumCredits(
  courses: TakenCourseType[],
  predicate?: (c: TakenCourseType) => boolean
): number {
  return courses.reduce((acc, c) => {
    if (!predicate || predicate(c)) {
      return acc + (Number(c.credit) || 0);
    }
    return acc;
  }, 0);
}

function countCourses(
  courses: TakenCourseType[],
  predicate: (c: TakenCourseType) => boolean
): number {
  return courses.reduce((acc, c) => acc + (predicate(c) ? 1 : 0), 0);
}

function codeInSet(c: TakenCourseType, set: Set<string>) {
  return set.has(normalizeCode(c.courseCode));
}

function hasCourseInSet(courses: TakenCourseType[], set: Set<string>) {
  return courses.some((c) => codeInSet(c, set));
}

function hasCourseWithSuffix(courses: TakenCourseType[], suffix: string) {
  return courses.some((c) => normalizeCode(c.courseCode).endsWith(suffix));
}

function hasCodePrefix(c: TakenCourseType, prefix: string) {
  return normalizeCode(c.courseCode).startsWith(prefix);
}

function isCourseType(c: TakenCourseType, type: string) {
  return normalizeCode(c.courseType) === normalizeCode(type);
}

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

const SCIENCE_LAB_KEYWORDS = [
  '실험',
  'lab',
  'biology',
  'physics',
  'chemistry',
  '생물',
  '물리',
  '화학',
];

function isLabCourse(c: TakenCourseType) {
  const name = normalizeName(c.courseName);
  const code = normalizeCode(c.courseCode);
  return (
    SCIENCE_LAB_KEYWORDS.some((kw) => name.includes(kw)) ||
    /[0-9]11$/.test(code) ||
    name.includes('experiment')
  );
}

function isScienceCreditCourse(c: TakenCourseType) {
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

function normalizeMajorCode(major?: string) {
  if (!major) return '';
  return normalizeCode(major).slice(0, 2) || '';
}

interface AnalyzeContext {
  allCourses: TakenCourseType[];
  grouped: Record<CategoryKey, TakenCourseType[]>;
  ruleSet: YearRuleSet;
  entryYear: number;
  userMajor?: string;
}

export function buildFineGrainedRequirements(ctx: AnalyzeContext): FineGrainedRequirement[] {
  const { allCourses, grouped, ruleSet, entryYear, userMajor } = ctx;
  const reqs: FineGrainedRequirement[] = [];

  const totalCredits = sumCredits(allCourses);
  reqs.push({
    id: 'total-credits',
    categoryKey: 'otherUncheckedClass',
    label: '총 이수학점 130학점 이상',
    requiredCredits: ruleSet.minTotalCredits,
    acquiredCredits: totalCredits,
    missingCredits: Math.max(0, ruleSet.minTotalCredits - totalCredits),
    satisfied: totalCredits >= ruleSet.minTotalCredits,
    importance: 'must',
    hint: '졸업을 위해서는 총 130학점 이상이 필요합니다.',
  });

  // 1. 언어의 기초
  const tookEngI = hasCourseInSet(allCourses, SET_ENG_I);
  const tookEngII = hasCourseInSet(allCourses, SET_ENG_II);
  const tookWriting = hasCourseInSet(allCourses, SET_WRITING);

  reqs.push(
    {
      id: 'language-english-i',
      categoryKey: 'languageBasic',
      label: 'English I 필수 (GS1601/GS1603/GS1607 중 1과목)',
      requiredCredits: 1,
      acquiredCredits: tookEngI ? 1 : 0,
      missingCredits: tookEngI ? 0 : 1,
      satisfied: tookEngI,
      importance: 'must',
      hint: 'SET_ENG_I 중 한 과목을 이수해야 합니다.',
      relatedCoursePatterns: { codePrefixes: Array.from(SET_ENG_I) },
    },
    {
      id: 'language-english-ii',
      categoryKey: 'languageBasic',
      label: 'English II 필수 (GS1602/GS1604/GS2652 중 1과목)',
      requiredCredits: 1,
      acquiredCredits: tookEngII ? 1 : 0,
      missingCredits: tookEngII ? 0 : 1,
      satisfied: tookEngII,
      importance: 'must',
      hint: 'SET_ENG_II 중 한 과목을 이수해야 합니다.',
      relatedCoursePatterns: { codePrefixes: Array.from(SET_ENG_II) },
    },
    {
      id: 'language-writing',
      categoryKey: 'languageBasic',
      label: '글쓰기 과목 필수 (GS1511/GS1512/GS1513/GS1531/GS1532/GS1533/GS1534 중 1과목)',
      requiredCredits: 1,
      acquiredCredits: tookWriting ? 1 : 0,
      missingCredits: tookWriting ? 0 : 1,
      satisfied: tookWriting,
      importance: 'must',
      hint: 'SET_WRITING 중 한 과목을 이수해야 합니다.',
      relatedCoursePatterns: { codePrefixes: Array.from(SET_WRITING) },
    }
  );

  // 2. 기초과학 - 수학 필수 과목
  const tookCalculus = hasCourseInSet(allCourses, SET_CALCULUS);
  const tookCoreMath = hasCourseInSet(allCourses, SET_CORE_MATH);

  reqs.push(
    {
      id: 'science-calculus',
      categoryKey: 'scienceBasic',
      label: '미적분학 필수 (GS1001/GS1011 중 1과목)',
      requiredCredits: 1,
      acquiredCredits: tookCalculus ? 1 : 0,
      missingCredits: tookCalculus ? 0 : 1,
      satisfied: tookCalculus,
      importance: 'must',
      hint: 'SET_CALCULUS 중 한 과목을 이수해야 합니다.',
      relatedCoursePatterns: { codePrefixes: Array.from(SET_CALCULUS) },
    },
    {
      id: 'science-core-math',
      categoryKey: 'scienceBasic',
      label: '수학 선택 필수 (해석학/선형대수 등 CORE MATH 집합 중 1과목)',
      requiredCredits: 1,
      acquiredCredits: tookCoreMath ? 1 : 0,
      missingCredits: tookCoreMath ? 0 : 1,
      satisfied: tookCoreMath,
      importance: 'must',
      hint: 'SET_CORE_MATH 중 한 과목을 이수해야 합니다.',
      relatedCoursePatterns: { codePrefixes: Array.from(SET_CORE_MATH) },
    }
  );

  // 3. 기초과학 학점 계산 (컴퓨터 프로그래밍 이수 여부에 따라 17/18)
  const tookCompProg = hasCourseInSet(allCourses, SET_COMP_PROG);
  const scienceCredits = sumCredits(allCourses, isScienceCreditCourse);
  const requiredScienceCredits = tookCompProg ? 17 : 18;

  reqs.push({
    id: 'science-total',
    categoryKey: 'scienceBasic',
    label: '기초과학 학점 (컴프로그 이수 시 17학점, 미이수 시 18학점)',
    requiredCredits: requiredScienceCredits,
    acquiredCredits: scienceCredits,
    missingCredits: Math.max(0, requiredScienceCredits - scienceCredits),
    satisfied: scienceCredits >= requiredScienceCredits,
    importance: 'must',
    hint: '물리/화학/생물 강의 및 실험, 컴퓨터 프로그래밍, SW 기초와 코딩을 포함한 기초과학 학점을 충족해야 합니다.',
  });

  // 4. SW 기초 (컴퓨터 프로그래밍과 별개)
  const swBasicTaken = hasCourseInSet(allCourses, SET_SW_BASIC);
  reqs.push({
    id: 'science-sw-basic',
    categoryKey: 'scienceBasic',
    label: 'SW 기초와 코딩(GS1490) 필수',
    requiredCredits: 1,
    acquiredCredits: swBasicTaken || tookCompProg ? 1 : 0,
    missingCredits: swBasicTaken || tookCompProg ? 0 : 1,
    satisfied: swBasicTaken || tookCompProg,
    importance: 'must',
    hint: '컴퓨터 프로그래밍 이수 시 면제되며, 미이수한 경우 SW 기초와 코딩(GS1490)을 이수해야 합니다.',
    relatedCoursePatterns: { codePrefixes: Array.from(SET_SW_BASIC) },
  });

  // 5. 인문사회
  const husCredits = sumCredits(allCourses, (c) => isCourseType(c, 'HUS'));
  const ppeCredits = sumCredits(allCourses, (c) => isCourseType(c, 'PPE'));
  const humanitiesCredits = sumCredits(grouped.humanities ?? allCourses, () => true);

  reqs.push(
    {
      id: 'humanities-hus',
      categoryKey: 'humanities',
      label: 'HUS 학점 6학점 이상',
      requiredCredits: 6,
      acquiredCredits: husCredits,
      missingCredits: Math.max(0, 6 - husCredits),
      satisfied: husCredits >= 6,
      importance: 'must',
      hint: '이수구분이 HUS인 과목에서 6학점 이상 필요합니다.',
    },
    {
      id: 'humanities-ppe',
      categoryKey: 'humanities',
      label: 'PPE 학점 6학점 이상',
      requiredCredits: 6,
      acquiredCredits: ppeCredits,
      missingCredits: Math.max(0, 6 - ppeCredits),
      satisfied: ppeCredits >= 6,
      importance: 'must',
      hint: '이수구분이 PPE인 과목에서 6학점 이상 필요합니다.',
    },
    {
      id: 'humanities-total',
      categoryKey: 'humanities',
      label: '인문사회 총 24학점 이상',
      requiredCredits: 24,
      acquiredCredits: humanitiesCredits,
      missingCredits: Math.max(0, 24 - humanitiesCredits),
      satisfied: humanitiesCredits >= 24,
      importance: 'must',
      hint: '인문사회 전체 학점이 24학점 이상이어야 합니다.',
    }
  );

  // 6. 공통 필수: 새내기 / 전공탐색 / 콜로퀴움
  const freshmanTaken = hasCourseInSet(allCourses, SET_FRESHMAN);
  const explorationTaken = hasCourseInSet(allCourses, SET_EXPLORATION);
  const colloquiumCount = countCourses(
    allCourses,
    (c) => codeInSet(c, SET_COLLOQUIUM) || normalizeName(c.courseName).includes('콜로퀴움')
  );

  reqs.push({
    id: 'etc-freshman',
    categoryKey: 'etcMandatory',
    label: 'GIST 새내기(또는 GS9301) 1회 이수',
    requiredCredits: 1,
    acquiredCredits: freshmanTaken ? 1 : 0,
    missingCredits: freshmanTaken ? 0 : 1,
    satisfied: freshmanTaken,
    importance: 'must',
    hint: 'SET_FRESHMAN 중 한 과목을 이수해야 합니다.',
    relatedCoursePatterns: { codePrefixes: Array.from(SET_FRESHMAN) },
  });

  if (entryYear >= 2021) {
    reqs.push({
      id: 'etc-major-exploration',
      categoryKey: 'etcMandatory',
      label: '전공탐색(UC0902) 1회 이수',
      requiredCredits: 1,
      acquiredCredits: explorationTaken ? 1 : 0,
      missingCredits: explorationTaken ? 0 : 1,
      satisfied: explorationTaken,
      importance: 'must',
      hint: '2021학번 이후는 UC0902 전공탐색을 필수로 이수해야 합니다.',
      relatedCoursePatterns: { codePrefixes: Array.from(SET_EXPLORATION) },
    });
  }

  reqs.push({
    id: 'etc-colloquium',
    categoryKey: 'etcMandatory',
    label: 'GIST 대학 콜로퀴움 2회 이수',
    requiredCredits: 2,
    acquiredCredits: colloquiumCount,
    missingCredits: Math.max(0, 2 - colloquiumCount),
    satisfied: colloquiumCount >= 2,
    importance: 'must',
    hint: 'UC9331 콜로퀴움을 2회 이상 이수해야 합니다.',
    relatedCoursePatterns: { codePrefixes: Array.from(SET_COLLOQUIUM) },
  });

  // 7. 예체능: 연도별 필요한 이수 횟수
  const requiredArtSportCount = entryYear >= 2020 ? 2 : 4;
  const artCount = countCourses(allCourses, (c) => hasCodePrefix(c, CODE_ART_PREFIX));
  const sportCount = countCourses(allCourses, (c) => hasCodePrefix(c, CODE_SPORT_PREFIX));

  reqs.push(
    {
      id: 'arts',
      categoryKey: 'otherUncheckedClass',
      label: `예술 교양 과목 ${requiredArtSportCount}과목 이상`,
      requiredCredits: requiredArtSportCount,
      acquiredCredits: artCount,
      missingCredits: Math.max(0, requiredArtSportCount - artCount),
      satisfied: artCount >= requiredArtSportCount,
      importance: 'must',
      hint: `${CODE_ART_PREFIX}로 시작하는 예술 교양 과목을 ${requiredArtSportCount}과목 이상 이수해야 합니다.`,
    },
    {
      id: 'sports',
      categoryKey: 'otherUncheckedClass',
      label: `체육 과목 ${requiredArtSportCount}과목 이상`,
      requiredCredits: requiredArtSportCount,
      acquiredCredits: sportCount,
      missingCredits: Math.max(0, requiredArtSportCount - sportCount),
      satisfied: sportCount >= requiredArtSportCount,
      importance: 'must',
      hint: `${CODE_SPORT_PREFIX}로 시작하는 체육 과목을 ${requiredArtSportCount}과목 이상 이수해야 합니다.`,
    }
  );

  // 8. 전공 학점 및 전공필수
  const majorCode = normalizeMajorCode(userMajor);
  const majorCourses =
    majorCode.length > 0
      ? allCourses.filter((c) => hasCodePrefix(c, majorCode))
      : grouped.major ?? [];

  const majorCredits = sumCredits(majorCourses);

  reqs.push({
    id: 'major-credits',
    categoryKey: 'major',
    label: '전공 학점 36학점 이상',
    requiredCredits: 36,
    acquiredCredits: majorCredits,
    missingCredits: Math.max(0, 36 - majorCredits),
    satisfied: majorCredits >= 36,
    importance: 'must',
    hint: '전공 과목 학점을 36학점 이상 이수해야 합니다.',
  });

  const mandatoryList = MAJOR_MANDATORY[majorCode];
  if (mandatoryList?.length) {
    mandatoryList.forEach((courseCode) => {
      const taken = hasCourseInSet(allCourses, new Set([courseCode]));
      reqs.push({
        id: `major-mandatory-${courseCode}`,
        categoryKey: 'major',
        label: `전공 필수 과목 ${courseCode}`,
        requiredCredits: 1,
        acquiredCredits: taken ? 1 : 0,
        missingCredits: taken ? 0 : 1,
        satisfied: taken,
        importance: 'must',
        hint: `${courseCode} 과목을 반드시 이수해야 합니다.`,
        relatedCoursePatterns: { codePrefixes: [courseCode] },
      });
    });
  }

  // 9. 학사논문연구 I/II (9102/9103)
  const thesisI = hasCourseWithSuffix(allCourses, RESEARCH_I_SUFFIX);
  const thesisII = hasCourseWithSuffix(allCourses, RESEARCH_II_SUFFIX);

  reqs.push(
    {
      id: 'thesis-i',
      categoryKey: 'etcMandatory',
      label: '학사논문연구 I (9102) 필수',
      requiredCredits: 1,
      acquiredCredits: thesisI ? 1 : 0,
      missingCredits: thesisI ? 0 : 1,
      satisfied: thesisI,
      importance: 'must',
      hint: '전공 코드 + 9102 형태의 학사논문연구 I을 이수해야 합니다.',
    },
    {
      id: 'thesis-ii',
      categoryKey: 'etcMandatory',
      label: '학사논문연구 II (9103) 필수',
      requiredCredits: 1,
      acquiredCredits: thesisII ? 1 : 0,
      missingCredits: thesisII ? 0 : 1,
      satisfied: thesisII,
      importance: 'must',
      hint: '전공 코드 + 9103 형태의 학사논문연구 II을 이수해야 합니다.',
    }
  );

  return reqs;
}
