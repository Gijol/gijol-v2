// lib/classifyCourse.ts
import type { TakenCourseType } from '@lib/types/grad';

// Graduation Category Keys
export type CategoryKey =
  | 'languageBasic' // 언어와 기초 (영어, 글쓰기)
  | 'scienceBasic' // 기초과학 (수학/물리/화학/생명/프로그래밍 등)
  | 'major' // 전공 (userMajor prefix)
  | 'minor' // 부전공 (여기서는 아직 사용 X)
  | 'humanities' // 인문사회 (경제, 정치, 문화, 심리 등)
  | 'etcMandatory' // 연구 및 기타 (새내기, 전공탐색, 과학기술과 경제, 논문연구, 콜로퀴움 등)
  | 'otherUncheckedClass'; // 자유학점

export interface ClassifyOptions {
  entryYear: number; // 학번 기준: 2020, 2021 ...
  userMajor?: string; // 예: 'EC', 'MC' 등 (대문자 2~3글자 prefix)
  userMinors?: string[]; // 부전공 prefix 리스트 (지금은 사용 안 해도 됨)
}

// 공통 유틸: normalize
const normalize = (s: string | undefined | null) => (s ?? '').trim().toUpperCase();

const normalizeName = (s: string | undefined | null) => (s ?? '').trim().toLowerCase();

// ----------------------------
// 상수 테이블 (필요하면 확장 가능)
// ----------------------------

// 언어 기초 과목 코드 (핸드북 + JSON 기준)
const LANGUAGE_BASIC_CODES = new Set<string>([
  'GS1601', // 영어 I: 신입생 영어
  'GS1602', // 영어 II (있을 가능성)
  'GS1603', // 영어 III (있을 가능성)
  'GS2652', // 영어 II: 이공계 글쓰기 입문
  'GS1513', // 글쓰기의 기초: 창의적 글쓰기
]);

// 기초과학 대표 과목 코드 (수학/물리/화학/생명/프로그래밍)
const SCIENCE_BASIC_CODES = new Set<string>([
  'GS1001', // 미적분학과 응용
  'GS1002', // (가정) 미적분학 II
  'GS1101', // 일반물리학 및 연습 I
  'GS1102', // 일반물리학 및 연습 II (가정)
  'GS1111', // 일반물리학 실험 I
  'GS1112', // 일반물리학 실험 II (가정)
  'GS1201', // 일반화학 및 연습 I
  'GS1202', // 일반화학 및 연습 II (가정)
  'GS1301', // 생물학
  'GS1302', // 인간 생물학
  'GS1311', // 일반생물학 실험
  'GS1312', // (가정) 생물학 실험 II
  'GS1401', // 컴퓨터 프로그래밍
  'GS2001', // 다변수해석학과 응용
  'GS2002', // 미분방정식과 응용
  'GS2004', // 선형대수학과 응용
]);

// 연구 및 기타 필수 (새내기, 전공탐색, 과학기술과 경제, 창의함양, 콜로퀴움 등)
const ETC_MANDATORY_EXACT_CODES = new Set<string>([
  'GS1901', // GIST 새내기
  'GS1902', // GIST 전공탐색 (있다고 가정)
  'UC0901', // 과학기술과 경제
  'UC0202', // 창의함양
  'UC9331', // GIST대학 콜로퀴움
]);

// 논문연구 suffix 패턴 (예: XX9101, XX9102)
const THESIS_SUFFIXES = ['9101', '9102'];

// 인문사회 키워드
const HUMANITY_KEYWORDS = [
  '경제',
  '정치',
  '사회',
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
  'social sciences',
];

// 기초과학 키워드
const SCIENCE_KEYWORDS = [
  '미적분',
  '해석학',
  '미분방정식',
  '선형대수',
  '수학',
  '물리',
  '화학',
  '생물',
  '생명',
  '프로그래밍',
  '확률',
  '통계',
  '데이터 과학',
  'data science',
];

/**
 * 분류 우선순위:
 * 1. 연구/기타 필수 (새내기/전공탐색/과학기술과 경제/논문연구/콜로퀴움/창의함양)
 * 2. 언어와 기초 (영어/글쓰기)
 * 3. 전공 (userMajor prefix)
 * 4. 기초과학 (코드 + 이름)
 * 5. 인문사회 (코드 + 이름)
 * 6. 0학점 체육/예체능
 * 7. 나머지: 자유학점
 */

// 언어 기초 키워드
const LANGUAGE_KEYWORDS = ['영어', '글쓰기'];

// 0학점 체육/예체능 코드 (자유 혹은 기타)
const ZERO_CREDIT_PE_CODES_PREFIX = ['GS01', 'GS02']; // 배드민턴(GS0104), 드로잉(GS0211) 등

// CT 계열 (아트&테크, 서비스러닝 등) → 인문사회 쪽으로 치우쳐 처리
const CT_HUMANITY_PREFIX = ['CT']; // 영상 커뮤니케이션, 아트앤테크놀로지 등

// ----------------------------
// 메인 분류 함수
// ----------------------------

export function classifyCourseToCategory(
  course: TakenCourseType,
  opts: ClassifyOptions
): CategoryKey {
  const code = normalize(course.courseCode); // 예: GS1001
  const name = normalizeName(course.courseName); // 예: '미적분학과 응용'
  const userMajor = normalize(opts.userMajor);
  const credit = course.credit ?? 0;

  // 1) 연구 및 기타 필수 (새내기/전공탐색/과학기술과 경제/창의함양/콜로퀴움/논문연구 등)
  if (ETC_MANDATORY_EXACT_CODES.has(code)) {
    return 'etcMandatory';
  }

  // 논문연구 (코드 suffix 9101/9102 or 과목명에 '논문연구')
  if (
    THESIS_SUFFIXES.some((suf) => code.endsWith(suf)) ||
    name.includes('논문연구') ||
    name.includes('학사논문연구')
  ) {
    return 'etcMandatory';
  }

  // 콜로퀴움 계열 (코드 UC933*, 이름에 콜로퀴움 포함)
  if (code.startsWith('UC933') || name.includes('콜로퀴움')) {
    return 'etcMandatory';
  }

  // GIST 새내기 / 전공탐색 (혹시 코드를 새로 추가해도 이름으로 한번 더 방어)
  if (name.includes('gist 새내기') || name.includes('전공탐색')) {
    return 'etcMandatory';
  }

  // 2) 언어의 기초 (영어/글쓰기)
  if (LANGUAGE_BASIC_CODES.has(code)) {
    return 'languageBasic';
  }
  if (LANGUAGE_KEYWORDS.some((kw) => name.includes(kw))) {
    return 'languageBasic';
  }

  // 3) 전공 (사용자 전공 prefix와 코드 prefix가 일치할 때)
  if (userMajor && code.startsWith(userMajor)) {
    return 'major';
  }

  // 4) 기초과학 (정확 코드 + 이름/코드 패턴)
  if (SCIENCE_BASIC_CODES.has(code)) {
    return 'scienceBasic';
  }

  // BS/CH/PH/MA 계열 기초과학 코드 (이번 JSON에도 BS2204처럼 생명계열 과목 존재)
  if (/^(BS|CH|PH|MA)/.test(code)) {
    return 'scienceBasic';
  }

  // 이름에 과학 키워드가 포함되어 있으면 기초과학으로 본다.
  if (SCIENCE_KEYWORDS.some((kw) => name.includes(kw))) {
    return 'scienceBasic';
  }

  // 5) 인문사회 (GS2xxx/GS3xxx 인문사회 + CT 계열 + 인문 키워드)
  if (HUMANITY_KEYWORDS.some((kw) => name.includes(kw))) {
    return 'humanities';
  }

  // GS2***, GS3*** 중에서 아직 분류 안 된 것들은 인문사회로 본다.
  if (/^GS2/.test(code) || /^GS3/.test(code)) {
    return 'humanities';
  }

  // CT 계열 과목은 이름을 보면 거의 인문/예술/프로젝트 수업이라 인문사회로 취급
  if (CT_HUMANITY_PREFIX.some((prefix) => code.startsWith(prefix))) {
    return 'humanities';
  }

  // 6) 0학점 체육/예체능 과목 → 자유학점 (또는 별도 카테고리로 빼고 싶으면 여기서 수정)
  if (credit === 0 && ZERO_CREDIT_PE_CODES_PREFIX.some((prefix) => code.startsWith(prefix))) {
    return 'otherUncheckedClass';
  }

  // 7) 부전공: 지금은 userMinors 정보를 안 쓰고 있으므로, 필요해지면 여기서 추가
  // if (opts.userMinors && opts.userMinors.length > 0) { ... }

  // 8) 그 외는 자유학점으로 처리
  return 'otherUncheckedClass';
}
