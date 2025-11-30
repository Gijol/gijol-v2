import { TakenCourseType } from "@lib/types/grad";
import { CategoryKey, YearRuleSet } from "./grad-rules";
import { FineGrainedRequirement } from "@lib/types/grad-requirements";

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

function normalizeCode(code?: string) {
  if (!code) return '';
  return String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
}
function normalizeName(name?: string) {
  return (name || '').toString().toLowerCase();
}

// 언어의 기초 세부
const ENGLISH_CODES = new Set(['GS1601']); // Academic English 등 실제 코드로 수정
const WRITING_CODES = new Set(['GS1607', 'GS2652', 'GS1513']);

function isEnglishCourse(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  if (ENGLISH_CODES.has(code)) return true;
  return name.includes('영어') || name.includes('english');
}

function isWritingCourse(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  if (WRITING_CODES.has(code)) return true;
  return name.includes('글쓰기') || name.includes('writing');
}

// SW 기초 vs 컴퓨터 프로그래밍
// 2018학번~: SW 기초와 코딩 / (MOOC)파이썬 기초 중 택1 2학점,
//            단 컴퓨터 프로그래밍 이수 시 면제
const SW_BASIC_CODES = new Set(['GS1490', 'GS1499']); // 'SW 기초와 코딩'
const COMP_PROG_CODES = new Set(['GS1401']); // 컴퓨터 프로그래밍

function isSwBasicCourse(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  if (SW_BASIC_CODES.has(code)) return true;
  return name.includes('sw 기초') || name.includes('코딩');
}

function isComputerProgrammingCourse(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  if (COMP_PROG_CODES.has(code)) return true;
  return name.includes('컴퓨터 프로그래밍') || name.includes('programming');
}

// 인문사회 세부: HUS, PPE
function isHusCourse(c: TakenCourseType) {
  return c.courseType === "HUS"
}
function isPpeCourse(c: TakenCourseType) {
  return c.courseType === "PPE"
}

// 기초과학 세부: 수학 / 과학 분야 / 실험
// 편람의 "수학 6학점" 체크용
const MATH_CODES = new Set(['GS1001', 'GS2001', 'GS2002', 'GS2004']); // 미적분, 해석학, 미분방정식, 선형대수 등

function isMathCourse(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  if (MATH_CODES.has(code)) return true;
  return name.includes('수학') || name.includes('미적분') || name.includes('해석학');
}

// 분야별 기초과학 강의 탐지 (전컴/생명/물리/화학)
function isCsBasicLecture(c: TakenCourseType) {
  // 전컴: 컴퓨터 프로그래밍을 기초과학(전컴)으로 본다
  return isComputerProgrammingCourse(c);
}
function isBioBasicLecture(c: TakenCourseType) {
  const name = normalizeName(c.courseName);
  return name.includes('생물학') || name.includes('인간 생물학');
}
function isPhysicsBasicLecture(c: TakenCourseType) {
  const name = normalizeName(c.courseName);
  return name.includes('일반물리학') || name.includes('고급일반물리학');
}
function isChemBasicLecture(c: TakenCourseType) {
  const name = normalizeName(c.courseName);
  return name.includes('일반화학') || name.includes('고급일반화학');
}

// 실험 여부는 과목명/코드에 '실험', 'lab'이 들어가는지로 근사
function isExperimentCourse(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  return name.includes('실험') || name.includes('lab') || /[0-9]11$/.test(code); // 예: GS1111
}

// 분야별 실험 (강의와 연계 이수 체크용)
function isBioExperiment(c: TakenCourseType) {
  const name = normalizeName(c.courseName);
  return name.includes('생물학실험');
}
function isPhysicsExperiment(c: TakenCourseType) {
  const name = normalizeName(c.courseName);
  return name.includes('물리학실험');
}
function isChemExperiment(c: TakenCourseType) {
  const name = normalizeName(c.courseName);
  return name.includes('화학실험');
}

// 새내기/전공탐색/공통 필수
function isFreshmanSeminar(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  return code === 'GS1901' || name.includes('새내기') || name.includes('신입생 세미나');
}
function isMajorExploration(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  return code === 'GS1902' || name.includes('전공탐색');
}
function isEconomyCourse(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  return code === 'UC0901' || name.includes('과학기술과 경제');
}

// 논문연구
function isThesisI(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  return code.endsWith('9101') || name.includes('학사논문연구 i');
}
function isThesisII(c: TakenCourseType) {
  const code = normalizeCode(c.courseCode);
  const name = normalizeName(c.courseName);
  return code.endsWith('9102') || name.includes('학사논문연구 ii');
}


interface AnalyzeContext {
  allCourses: TakenCourseType[];
  grouped: Record<CategoryKey, TakenCourseType[]>;
  ruleSet: YearRuleSet;
  entryYear: number;
}

export function buildFineGrainedRequirements(ctx: AnalyzeContext): FineGrainedRequirement[] {
  const { allCourses, grouped, ruleSet, entryYear } = ctx;
  const reqs: FineGrainedRequirement[] = [];

  // 1) 언어의 기초: 영어 4, 글쓰기 3
  const langCourses = grouped.languageBasic ?? [];
  const englishCredits = sumCredits(langCourses, isEnglishCourse);
  const writingCredits = sumCredits(langCourses, isWritingCourse);

  reqs.push({
    id: 'language-english',
    categoryKey: 'languageBasic',
    label: '언어의 기초 - 영어 4학점',
    requiredCredits: 4,
    acquiredCredits: englishCredits,
    missingCredits: Math.max(0, 4 - englishCredits),
    satisfied: englishCredits >= 4,
    importance: 'must',
    hint: 'Academic English, 영어회화, 영어읽기/쓰기 과목을 통해 4학점을 채워야 합니다.',
    relatedCoursePatterns: {
      nameKeywords: ['영어', 'english'],
    },
  });

  reqs.push({
    id: 'language-writing',
    categoryKey: 'languageBasic',
    label: '언어의 기초 - 글쓰기 3학점',
    requiredCredits: 3,
    acquiredCredits: writingCredits,
    missingCredits: Math.max(0, 3 - writingCredits),
    satisfied: writingCredits >= 3,
    importance: 'must',
    hint: '대학 글쓰기, 과학기술 글쓰기 등 글쓰기 계열 과목을 이수해야 합니다.',
    relatedCoursePatterns: {
      nameKeywords: ['글쓰기', 'writing'],
    },
  });

  // 2) 인문사회: HUS 6, PPE 6
  const humCourses = grouped.humanities ?? [];
  const husCredits = sumCredits(humCourses, isHusCourse);
  const ppeCredits = sumCredits(humCourses, isPpeCourse);

  reqs.push({
    id: 'humanities-hus',
    categoryKey: 'humanities',
    label: '인문사회 - HUS 6학점',
    requiredCredits: 6,
    acquiredCredits: husCredits,
    missingCredits: Math.max(0, 6 - husCredits),
    satisfied: husCredits >= 6,
    importance: 'must',
    hint: 'HUS(인문사회) prefix의 과목에서 6학점을 채워야 합니다.',
    relatedCoursePatterns: {
      codePrefixes: ['HS, GS'],
    },
  });

  reqs.push({
    id: 'humanities-ppe',
    categoryKey: 'humanities',
    label: '인문사회 - PPE 6학점',
    requiredCredits: 6,
    acquiredCredits: ppeCredits,
    missingCredits: Math.max(0, 6 - ppeCredits),
    satisfied: ppeCredits >= 6,
    importance: 'must',
    hint: 'PPE(철학·정치·경제) 계열 과목에서 6학점을 채워야 합니다.',
    relatedCoursePatterns: {
      codePrefixes: ['HS, GS'],
    },
  });

  // 3) 소프트웨어: SW 기초와 코딩 2학점 (컴프로그 이수시 면제)
  // 2018학번 이후만 서비스 대상이므로 별도 하위 학번 분기는 생략
  const swBasicCredits = sumCredits(allCourses, isSwBasicCourse);
  const compProgCredits = sumCredits(allCourses, isComputerProgrammingCourse);
  const swSatisfied = compProgCredits > 0 || swBasicCredits >= 2;
  const swMissing = swSatisfied ? 0 : 2 - swBasicCredits;

  reqs.push({
    id: 'software-basic',
    categoryKey: 'scienceBasic', // or 별도 categoryKey 만들 수도 있음
    label: '소프트웨어 기초 - SW 기초와 코딩 2학점 (또는 컴퓨터 프로그래밍 이수)',
    requiredCredits: 2,
    acquiredCredits: swBasicCredits,
    missingCredits: Math.max(0, swMissing),
    satisfied: swSatisfied,
    importance: 'must',
    hint:
      'SW 기초와 코딩(GS1490) 또는 (MOOC지정)파이썬 기초(GS1499) 2학점을 이수하거나, 컴퓨터 프로그래밍(GS1401)을 이수하면 SW 요건이 충족됩니다.',
    relatedCoursePatterns: {
      nameKeywords: ['sw 기초', '코딩', '컴퓨터 프로그래밍'],
    },
  });

  // 4) 기초과학: 수학 6 + 실험 포함
  const sciCourses = grouped.scienceBasic ?? [];
  const mathCredits = sumCredits(sciCourses, isMathCourse);
  const experimentCredits = sumCredits(sciCourses, isExperimentCourse);

  // 4-1) 수학 6학점
  reqs.push({
    id: 'science-math',
    categoryKey: 'scienceBasic',
    label: '기초과학 - 수학 6학점',
    requiredCredits: 6,
    acquiredCredits: mathCredits,
    missingCredits: Math.max(0, 6 - mathCredits),
    satisfied: mathCredits >= 6,
    importance: 'must',
    hint: '미적분학, 다변수해석학, 미분방정식, 선형대수 등 수학 과목으로 6학점 이상 이수해야 합니다.',
    relatedCoursePatterns: {
      nameKeywords: ['수학', '미적분', '해석학', '선형대수'],
    },
  });

  // 4-2) 실험 총 2학점 이상
  reqs.push({
    id: 'science-experiment',
    categoryKey: 'scienceBasic',
    label: '기초과학 - 실험 과목 (생명/물리/화학 실험)',
    requiredCredits: 2, // 편람상 보통 2~3학점 → 2를 최소로 잡고, 추후 fine tuning
    acquiredCredits: experimentCredits,
    missingCredits: Math.max(0, 2 - experimentCredits),
    satisfied: experimentCredits >= 2,
    importance: 'must',
    hint: '생명/물리/화학 실험 과목(실험, lab 표기가 있는 과목)을 포함해야 합니다.',
    relatedCoursePatterns: {
      nameKeywords: ['실험', 'lab'],
    },
  });

    // 4-3) 전컴/생명/물리/화학 분야별 강의 구성 (9학점 / 3개 분야 규칙 근사 구현)
  const csLectureCredits = sumCredits(sciCourses, isCsBasicLecture);
  const bioLectureCredits = sumCredits(sciCourses, isBioBasicLecture);
  const physLectureCredits = sumCredits(sciCourses, isPhysicsBasicLecture);
  const chemLectureCredits = sumCredits(sciCourses, isChemBasicLecture);

  const basicLectureTotal =
    csLectureCredits + bioLectureCredits + physLectureCredits + chemLectureCredits;

  // 각 분야를 "3학점 이상 이수했는지"로 본다
  const hasCs = csLectureCredits >= 3;
  const hasBio = bioLectureCredits >= 3;
  const hasPhys = physLectureCredits >= 3;
  const hasChem = chemLectureCredits >= 3;

  const fieldsTakenCount = [hasCs, hasBio, hasPhys, hasChem].filter(Boolean).length;

  // 편람 해석:
  // - 전컴 미이수 시: 생명/물리/화학 3개 분야 강의 및 실험 모두 필수
  // - 전컴 이수 시: 생명/물리/화학 중 2개 분야 선택 가능 + 전컴 포함하여 총 3분야
  const hasCompProg = csLectureCredits >= 3;

  // "9학점 이상" 체크
  const lectureTotalSatisfied = basicLectureTotal >= 9;

  // "분야 수" + 전컴 여부 조건
  const fieldsSatisfied = hasCompProg
    ? // 전컴 포함 3개 분야, B/P/C 중 최소 2개
      lectureTotalSatisfied &&
      fieldsTakenCount >= 3 &&
      [hasBio, hasPhys, hasChem].filter(Boolean).length >= 2
    : // 전컴 미이수 시: 생명/물리/화학 3개 분야 모두
      lectureTotalSatisfied && hasBio && hasPhys && hasChem;

  reqs.push({
    id: 'science-basic-lecture-total',
    categoryKey: 'scienceBasic',
    label: '기초과학 - 전컴/생명/물리/화학 강의 9학점 이상',
    requiredCredits: 9,
    acquiredCredits: basicLectureTotal,
    missingCredits: Math.max(0, 9 - basicLectureTotal),
    satisfied: lectureTotalSatisfied,
    importance: 'must',
    hint:
      '컴퓨터 프로그래밍, 생물학/인간 생물학, 일반/고급일반물리학, 일반/고급일반화학 중에서 강의 과목을 합산하여 최소 9학점을 이수해야 합니다.',
  });

  reqs.push({
    id: 'science-basic-fields',
    categoryKey: 'scienceBasic',
    label: '기초과학 - 전컴/생명/물리/화학 3개 분야 강의 구성',
    requiredCredits: 3, // 필요한 분야 수
    acquiredCredits: fieldsTakenCount,
    missingCredits: Math.max(0, 3 - fieldsTakenCount),
    satisfied: fieldsSatisfied,
    importance: 'must',
    hint:
      hasCompProg
        ? '컴퓨터 프로그래밍(전컴) + 생명/물리/화학 중 2개 분야 강의를 포함해 총 3개 분야에서 강의를 이수해야 합니다.'
        : '컴퓨터 프로그래밍을 이수하지 않은 경우, 생명·물리·화학 3개 분야 강의를 모두 이수해야 합니다.',
  });

  // 4-4) 생명/물리/화학 강의와 실험 연계 (강의 이수 시 해당 실험 1학점 이상 필요)
  const bioExperimentCredits = sumCredits(sciCourses, isBioExperiment);
  const physExperimentCredits = sumCredits(sciCourses, isPhysicsExperiment);
  const chemExperimentCredits = sumCredits(sciCourses, isChemExperiment);

  const needsBioExp = hasBio;
  const needsPhysExp = hasPhys;
  const needsChemExp = hasChem;

  if (needsBioExp) {
    reqs.push({
      id: 'science-experiment-bio',
      categoryKey: 'scienceBasic',
      label: '기초과학 - 생명 분야 실험',
      requiredCredits: 1,
      acquiredCredits: bioExperimentCredits,
      missingCredits: Math.max(0, 1 - bioExperimentCredits),
      satisfied: bioExperimentCredits >= 1,
      importance: 'must',
      hint: '생명 분야 강의(생물학/인간 생물학)를 이수한 경우, 일반생물학실험 등 생명실험 과목을 최소 1학점 이상 이수해야 합니다.',
    });
  }

  if (needsPhysExp) {
    reqs.push({
      id: 'science-experiment-physics',
      categoryKey: 'scienceBasic',
      label: '기초과학 - 물리 분야 실험',
      requiredCredits: 1,
      acquiredCredits: physExperimentCredits,
      missingCredits: Math.max(0, 1 - physExperimentCredits),
      satisfied: physExperimentCredits >= 1,
      importance: 'must',
      hint: '물리 강의(일반물리학 및 연습 I, 고급일반물리학 및 연습 I 등)를 이수한 경우, 일반물리학실험 I 등 물리실험 과목을 최소 1학점 이상 이수해야 합니다.',
    });
  }

  if (needsChemExp) {
    reqs.push({
      id: 'science-experiment-chemistry',
      categoryKey: 'scienceBasic',
      label: '기초과학 - 화학 분야 실험',
      requiredCredits: 1,
      acquiredCredits: chemExperimentCredits,
      missingCredits: Math.max(0, 1 - chemExperimentCredits),
      satisfied: chemExperimentCredits >= 1,
      importance: 'must',
      hint: '화학 강의(일반화학 및 연습 I, 고급일반화학 및 연습 I 등)를 이수한 경우, 일반화학실험 I 등 화학실험 과목을 최소 1학점 이상 이수해야 합니다.',
    });
  }

  // 5) 새내기/전공탐색/공통 (과학기술과 경제)
  const freshmanCredits = sumCredits(allCourses, isFreshmanSeminar);
  const majorExplorationCredits = sumCredits(allCourses, isMajorExploration);
  const economyCredits = sumCredits(allCourses, isEconomyCourse);

  reqs.push({
    id: 'etc-freshman',
    categoryKey: 'etcMandatory',
    label: 'GIST 새내기 1학점',
    requiredCredits: 1,
    acquiredCredits: freshmanCredits,
    missingCredits: Math.max(0, 1 - freshmanCredits),
    satisfied: freshmanCredits >= 1,
    importance: 'must',
    hint: '1학년 1학기에 개설되는 GIST 새내기(또는 신입생 세미나)를 반드시 수강해야 합니다.',
  });

  // 전공탐색: 2021학번부터 필수
  if (entryYear >= 2021) {
    reqs.push({
      id: 'etc-major-exploration',
      categoryKey: 'etcMandatory',
      label: 'GIST 전공탐색 1학점',
      requiredCredits: 1,
      acquiredCredits: majorExplorationCredits,
      missingCredits: Math.max(0, 1 - majorExplorationCredits),
      satisfied: majorExplorationCredits >= 1,
      importance: 'must',
      hint: '1학년 가을학기에 개설되는 GIST 전공탐색(UC0902)을 반드시 수강해야 합니다. (반도체공학과 예외는 별도 처리 필요)',
    });
  }

  reqs.push({
    id: 'etc-economy',
    categoryKey: 'etcMandatory',
    label: '과학기술과 경제 1학점',
    requiredCredits: 1,
    acquiredCredits: economyCredits,
    missingCredits: Math.max(0, 1 - economyCredits),
    satisfied: economyCredits >= 1,
    importance: 'must',
    hint: '대학 공통 필수 과목인 「과학기술과 경제」 1학점을 반드시 이수해야 합니다.',
  });

  // 6) 학사논문연구 I/II
  const thesisICredits = sumCredits(allCourses, isThesisI);
  const thesisIICredits = sumCredits(allCourses, isThesisII);
  const thesisTotal = thesisICredits + thesisIICredits;

  reqs.push(
    {
      id: 'thesis-i',
      categoryKey: 'etcMandatory',
      label: '학사논문연구 I 3학점',
      requiredCredits: 3,
      acquiredCredits: thesisICredits,
      missingCredits: Math.max(0, 3 - thesisICredits),
      satisfied: thesisICredits >= 3,
      importance: 'must',
      hint: '학사논문연구 I는 보통 3학점으로, 졸업을 위해 반드시 이수해야 합니다.',
    },
    {
      id: 'thesis-ii',
      categoryKey: 'etcMandatory',
      label: '학사논문연구 II 3학점',
      requiredCredits: 3,
      acquiredCredits: thesisIICredits,
      missingCredits: Math.max(0, 3 - thesisIICredits),
      satisfied: thesisIICredits >= 3,
      importance: 'must',
      hint: '학사논문연구 II는 졸업예정학기에 반드시 수강해야 하는 3학점 과목입니다.',
    },
    {
      id: 'thesis-total',
      categoryKey: 'etcMandatory',
      label: '학사논문연구 총 6학점',
      requiredCredits: 6,
      acquiredCredits: thesisTotal,
      missingCredits: Math.max(0, 6 - thesisTotal),
      satisfied: thesisTotal >= 6,
      importance: 'must',
      hint: '학사논문연구 I/II 합산 6학점을 충족해야 졸업요건을 만족합니다.',
    }
  );

  // 7) 전공 학점 최소/최대
  const majorCredits = sumCredits(grouped.major ?? []);
  // 2018학번 이후 기준: 36~42 (신소재 예외는 ruleSet에서 관리한다고 가정)
  const majorMinRequired = 36;
  const majorMaxAllowed = 42;
  
  reqs.push(
    {
      id: 'major-min',
      categoryKey: 'major',
      label: '전공 학점 최소 36학점',
      requiredCredits: 36,
      acquiredCredits: majorCredits,
      missingCredits: Math.max(0, 36 - majorCredits),
      satisfied: majorCredits >= 36,
      importance: 'must',
      hint: '전공필수/선택 과목을 합해 최소 36학점을 이수해야 합니다.',
    },
    {
      id: 'major-max',
      categoryKey: 'major',
      label: '전공 학점 최대 42학점 (초과분은 자유선택)',
      requiredCredits: 42,
      acquiredCredits: majorCredits,
      missingCredits: 0,
      satisfied: majorCredits <= 42,
      importance: 'should',
      hint:
        '전공학점은 42학점까지만 졸업학점으로 인정됩니다. 초과분은 자유선택 학점으로 처리됩니다.',
    }
  );

  // 8) 부전공 15학점 (실제 필수과목 규칙은 추후 확장)
  const minorCredits = sumCredits(grouped.minor ?? []);
  reqs.push({
    id: 'minor-total',
    categoryKey: 'minor',
    label: '부전공 학점 15학점 이상 (부전공 선언 시)',
    requiredCredits: 15,
    acquiredCredits: minorCredits,
    missingCredits: Math.max(0, 15 - minorCredits),
    satisfied: minorCredits >= 15,
    importance: 'should',
    hint:
      '부전공을 공식적으로 인정받으려면 해당 분야에서 15학점 이상을 이수해야 합니다. 실제 필수과목 규칙은 각 부전공 안내를 참고하세요.',
  });

  return reqs;
}
