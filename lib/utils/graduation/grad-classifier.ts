// 수강한 강의명, 강의 코드 기반으로 언어기초,기초과학,전공,부전공,인문,기타의무,자유학점으로 구분하는 역할

import type {
  TakenCourseType,
} from '@lib/types/grad';


// Helper: normalize code/name
function normalizeCode(code?: string) {
  if (!code) return '';
  return String(code)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}
function normalizeName(name?: string) {
  return (name || '').toString().toLowerCase();
}

type CategoryKey =
  | 'languageBasic'
  | 'scienceBasic'
  | 'major'
  | 'minor'
  | 'humanities'
  | 'etcMandatory'
  | 'otherUncheckedClass';

// === GIST용 상수 테이블 ===

// 언어 기초 (영어, 글쓰기)
const LANGUAGE_BASIC_CODES = new Set(['GS1601', 'GS1607', 'GS2652', 'GS1513']);
const LANGUAGE_KEYWORDS = ['english', 'writing', '영어', '글쓰기'];

// 기초과학 (수학/물리/화학/생명/프로그래밍)
const SCIENCE_BASIC_CODES = new Set([
  'GS1001', // 미적분학과 응용
  'GS1101', // 일반물리학 및 연습 I
  'GS1111', // 일반물리학 실험 I
  'GS1201', // 일반화학 및 연습 I
  'GS1301', // 생물학
  'GS1302', // 인간 생물학
  'GS1311', // 일반생물학 실험
  'GS1401', // 컴퓨터 프로그래밍
  'GS2001', // 다변수해석학과 응용
  'GS2002', // 미분방정식과 응용
  'GS2004', // 선형대수학과 응용
]);
const SCIENCE_KEYWORDS = [
  '수학',
  '미적분',
  '해석학',
  '선형대수',
  '미분방정식',
  '물리',
  '화학',
  '생물',
  '생명',
  '프로그래밍',
  'programming',
  'physics',
  'chemistry',
  'biology',
  'data science',
  '데이터 과학',
];

// 연구 및 기타 필수 (새내기, 전공탐색, 과학기술과 경제, 창의함양, 콜로퀴움, 논문연구)
const ETC_MANDATORY_CODES = new Set([
  'GS1901', // GIST 새내기
  'GS1902', // GIST 전공탐색 (있을 경우)
  'UC0901', // 과학기술과 경제
  'UC0202', // 창의함양
  'UC9331', // GIST대학 콜로퀴움
]);
const THESIS_SUFFIXES = ['9101', '9102']; // 학사논문연구 I, II 등

// 인문사회 키워드: 경제/정치/사회/문화/역사/철학/심리/행복 등
const HUMANITY_KEYWORDS = [
  '인문',
  '사회',
  '경제',
  '정치',
  '문화',
  '역사',
  '철학',
  '심리',
  '마음',
  '행동',
  '행복',
  '문학',
  '예술',
  '콘텐츠',
  '오타쿠',
  'game theory',
];

const ZERO_CREDIT_PE_PREFIX = ['GS01', 'GS02']; // 배드민턴, 테니스 등 0학점 체육

const COMMON_MAJOR_PREFIXES = ['CS', 'EC', 'EE', 'ME', 'CE', 'MC', 'CH', 'MT', 'IS', 'PH'];

export function classifyCourse(
  course: TakenCourseType,
  userMajor?: string,
  userMinors?: string[]
): CategoryKey {
  const code = normalizeCode(course.courseCode);
  const name = normalizeName(course.courseName);
  const alphaMatch = code.match(/^[A-Z]+/);
  const prefix = alphaMatch ? alphaMatch[0] : '';
  const credit = Number(course.credit) || 0;

  // 1) 부전공: userMinors prefix 우선
  if (userMinors && userMinors.length) {
    for (const m of userMinors) {
      const mp = String(m || '')
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      if (mp && prefix.startsWith(mp)) return 'minor';
    }
  }

  // 2) 연구 및 기타 필수 (논문연구/새내기/전공탐색/경제/창의함양/콜로퀴움)
  if (ETC_MANDATORY_CODES.has(code)) return 'etcMandatory';
  if (THESIS_SUFFIXES.some((suf) => code.endsWith(suf))) return 'etcMandatory';
  if (
    /(논문연구|학사논문연구|새내기|전공탐색|과학기술과 경제|콜로퀴움|창의함양|사회봉사|봉사)/.test(
      name
    )
  )
    return 'etcMandatory';
  if (/^UC|^CC|^UR/.test(prefix)) return 'etcMandatory';

  // 3) 언어의 기초 (영어/글쓰기)
  if (LANGUAGE_BASIC_CODES.has(code)) return 'languageBasic';
  if (LANGUAGE_KEYWORDS.some((kw) => name.includes(kw))) return 'languageBasic';

  // 4) 전공: userMajor prefix + 공통 공대 prefix
  if (userMajor) {
    const mj = String(userMajor)
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    if (mj && prefix.startsWith(mj.slice(0, 3))) return 'major';
  }
  if (COMMON_MAJOR_PREFIXES.some((p) => prefix.startsWith(p))) return 'major';

  // 5) 기초과학
  if (SCIENCE_BASIC_CODES.has(code)) return 'scienceBasic';
  if (/^(BS|CH|PH|MA|MM|MT)/.test(prefix)) return 'scienceBasic';
  if (SCIENCE_KEYWORDS.some((kw) => name.includes(kw))) return 'scienceBasic';

  // 6) 인문사회
  if (
    /^(HS|EB|LH|MB|PP|SS)/.test(prefix) || // 인문사회 계열 prefix
    HUMANITY_KEYWORDS.some((kw) => name.includes(kw)) ||
    /^GS2/.test(code) || // GS2xxx / GS3xxx를 인문사회로 많이 사용
    /^GS3/.test(code)
  )
    return 'humanities';

  // 7) 0학점 체육/예체능 → 자유학점
  if (credit === 0 && ZERO_CREDIT_PE_PREFIX.some((p) => code.startsWith(p)))
    return 'otherUncheckedClass';

  // 8) 나머지
  return 'otherUncheckedClass';
}


