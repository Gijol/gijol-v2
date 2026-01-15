/**
 * 과목 마스터 데이터
 * - courses_master_from_handbooks_2020_2025.csv 기준
 * - course_applicability_2018-2020_vs_2021plus.csv에서 is_offered=TRUE 기준 추천 대상
 */

export interface CourseMaster {
  courseCode: string;
  courseNameKo: string;
  courseNameEn?: string;
  credits: number;
  level: number; // 1000, 2000, 3000, 4000
  department?: string;
  isOffered: boolean; // 현재 개설 여부 (2021+ 기준)
}

/**
 * 졸업요건 영역별 추천 과목 매핑
 * 우선순위: 1) Hard Mandatory 2) Language 3) HUS/PPE 4) Software 5) Science 6) Major
 */
export type RequirementDomain =
  | 'etcMandatory' // 과학기술과경제, 새내기, 전공탐색, 콜로퀴움, 학사논문연구
  | 'languageBasic' // 영어I/II, 글쓰기
  | 'humanities' // HUS + PPE
  | 'software' // SW기초와코딩, 컴퓨터프로그래밍
  | 'scienceBasic' // 수학, 물리, 화학, 생물, 실험
  | 'major'; // 전공별

// ============================================================
// 1. 기타 필수 (Hard Mandatory)
// ============================================================
export const ETC_MANDATORY_COURSES: CourseMaster[] = [
  // 과학기술과 경제 (1학점, 필수)
  { courseCode: 'UC0901', courseNameKo: '과학기술과 경제', credits: 1, level: 0, isOffered: true },
  // GIST 새내기 / 전공탐색
  { courseCode: 'GS1901', courseNameKo: 'GIST 새내기', credits: 0, level: 1000, isOffered: true },
  { courseCode: 'UC0902', courseNameKo: 'GIST 전공탐색', credits: 1, level: 0, isOffered: true },
  // 콜로퀴움
  { courseCode: 'UC9331', courseNameKo: 'GIST 대학 콜로퀴움', credits: 0, level: 9000, isOffered: true },
];

// ============================================================
// 2. 언어의 기초 (7학점: 영어 4 + 글쓰기 3)
// ============================================================
export const LANGUAGE_BASIC_COURSES: CourseMaster[] = [
  // 영어 I (2학점) - 택1
  { courseCode: 'GS1607', courseNameKo: '학술영어', credits: 2, level: 1000, isOffered: true },
  { courseCode: 'GS1601', courseNameKo: '영어 I: 신입생 영어', credits: 2, level: 1000, isOffered: false },
  { courseCode: 'GS1603', courseNameKo: '영어 I: 발표와 토론', credits: 2, level: 1000, isOffered: false },
  { courseCode: 'GS1605', courseNameKo: '실용적 대화법', credits: 2, level: 1000, isOffered: true },
  { courseCode: 'GS1606', courseNameKo: '과학 기사 읽기', credits: 2, level: 1000, isOffered: true },
  // 영어 II (2학점) - 택1
  { courseCode: 'GS2652', courseNameKo: '영어 II : 이공계 글쓰기 입문', credits: 2, level: 2000, isOffered: true },
  { courseCode: 'GS2653', courseNameKo: '연구 윤리의 이해와 토론', credits: 2, level: 2000, isOffered: true },
  {
    courseCode: 'GS2655',
    courseNameKo: '디지털 시대의 저널리즘과 과학 기사 쓰기',
    credits: 2,
    level: 2000,
    isOffered: true,
  },
  // 글쓰기 (3학점) - 택1
  { courseCode: 'GS1512', courseNameKo: '글쓰기의 기초: 학술적 글쓰기', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1513', courseNameKo: '글쓰기의 기초: 창의적 글쓰기', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1532', courseNameKo: '심화 글쓰기: 고전 읽기와 글쓰기', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1533', courseNameKo: '심화 글쓰기: 비평적 글쓰기', credits: 3, level: 1000, isOffered: true },
  {
    courseCode: 'GS1535',
    courseNameKo: '심화 글쓰기: AI 시대의 글쓰기와 나',
    credits: 3,
    level: 1000,
    isOffered: true,
  },
];

// ============================================================
// 3. 인문사회 (24학점: HUS 6 + PPE 6 포함)
// ============================================================
export const HUS_COURSES: CourseMaster[] = [
  { courseCode: 'HS2502', courseNameKo: '한국문학사의 쟁점', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2503', courseNameKo: '한국현대소설의 이해', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2506', courseNameKo: '한국현대시인론', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2511', courseNameKo: '현대시 읽기', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2512', courseNameKo: '한국소설 속의 여성들', credits: 3, level: 2000, isOffered: true },
  {
    courseCode: 'HS2521',
    courseNameKo: '영웅과 반영웅 : 서구근대문학의 이해Ⅰ',
    credits: 3,
    level: 2000,
    isOffered: true,
  },
  { courseCode: 'HS2526', courseNameKo: '문학과 연인들', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2544', courseNameKo: '문화콘텐츠의 이해', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2601', courseNameKo: '동아시아의 전통과 현대', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2602', courseNameKo: '한국사의 이해', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2605', courseNameKo: '한국의 문화유산', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2612', courseNameKo: '서양 고대와 중세 문명', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2613', courseNameKo: '현대서양의 형성과 전개', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2614', courseNameKo: '초기 근대의 서양', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2656', courseNameKo: '상품의 역사', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS3501', courseNameKo: '이상(李箱)문학과 과학', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3502', courseNameKo: '시창작 특강', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3802', courseNameKo: '과학자 문학', credits: 3, level: 3000, isOffered: true },
];

export const PPE_COURSES: CourseMaster[] = [
  { courseCode: 'HS2620', courseNameKo: '철학의 근본 문제들', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2661', courseNameKo: '논리학 입문', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2702', courseNameKo: '미국사회의 이해', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2704', courseNameKo: '기업과 사회 Ⅰ', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2707', courseNameKo: '오타쿠 대중문화론', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2724', courseNameKo: '거시경제학원론', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2726', courseNameKo: '글로벌 경제의 이해', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2734', courseNameKo: '행복의 조건', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2742', courseNameKo: '인간의 마음과 행동 1', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2743', courseNameKo: '인간의 마음과 행동 2', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2749', courseNameKo: '심리학과 삶', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2750', courseNameKo: '경영학원론', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2787', courseNameKo: '한국정치론', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2788', courseNameKo: '민주주의론', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2789', courseNameKo: '안보와 무기체계', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2795', courseNameKo: '문명으로 보는 21세기', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2797', courseNameKo: '꿈의 사회학', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2833', courseNameKo: '비판적 디자인', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2834', courseNameKo: '역사 속의 과학', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS2839', courseNameKo: '인간의 미래', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'HS3632', courseNameKo: '합리적 판단과 선택', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3722', courseNameKo: '(MOOC 지정)미시경제론', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3725', courseNameKo: '사회복지와 재정', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3735', courseNameKo: '한국의 경제발전', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3736', courseNameKo: '통일독일과 남북통일', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3752', courseNameKo: '전략경영 II', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3766', courseNameKo: '(MOOC 지정) 인지심리학 및 실험', credits: 3, level: 3000, isOffered: true },
  { courseCode: 'HS3785', courseNameKo: '국가와 시민사회론', credits: 3, level: 3000, isOffered: true },
  {
    courseCode: 'HS3831',
    courseNameKo: '과학기술학의 이해: 과학사회논쟁의 쟁점과 윤리',
    credits: 3,
    level: 3000,
    isOffered: true,
  },
  { courseCode: 'HS3839', courseNameKo: '질병과 사회', credits: 3, level: 3000, isOffered: true },
  {
    courseCode: 'HS4611',
    courseNameKo: '인생의 의미 찾기 : 동서양철학의 대답들',
    credits: 3,
    level: 4000,
    isOffered: true,
  },
  { courseCode: 'HS4710', courseNameKo: '복잡계분석과 AI정책전략', credits: 3, level: 4000, isOffered: true },
  { courseCode: 'HS4741', courseNameKo: '기술정보사회의 심리학', credits: 3, level: 4000, isOffered: true },
  { courseCode: 'HS4762', courseNameKo: '인공지능 로봇의 법', credits: 3, level: 4000, isOffered: true },
];

// ============================================================
// 4. SW 필수 (컴퓨터 프로그래밍 이수 시 면제)
// ============================================================
export const SOFTWARE_COURSES: CourseMaster[] = [
  { courseCode: 'GS1490', courseNameKo: 'SW기초와 코딩', credits: 2, level: 1000, isOffered: true },
  { courseCode: 'GS1401', courseNameKo: '컴퓨터 프로그래밍', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1499', courseNameKo: '(MOOC 지정) 파이썬 기초', credits: 2, level: 1000, isOffered: true },
  { courseCode: 'GS1421', courseNameKo: '인공지능 입문', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1491', courseNameKo: 'SW코딩과 AI활용', credits: 1, level: 1000, isOffered: true },
  { courseCode: 'GS2408', courseNameKo: '객체 지향 프로그래밍', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'GS2409', courseNameKo: '(MOOC 지정)풀스택 자바스크립트', credits: 2, level: 2000, isOffered: true },
  {
    courseCode: 'GS2421',
    courseNameKo: '(MOOC 지정) 알고리즘 기반 논리적 사고 - 심화',
    credits: 1,
    level: 2000,
    isOffered: true,
  },
  { courseCode: 'GS2422', courseNameKo: '(MOOC지정) 기계학습: 예측 및 분류', credits: 1, level: 2000, isOffered: true },
  { courseCode: 'GS3401', courseNameKo: '(MOOC 지정) 프론트엔드 웹 개발', credits: 2, level: 3000, isOffered: true },
  { courseCode: 'GS3402', courseNameKo: '(MOOC 지정) 알고리즘 응용 및 실습', credits: 1, level: 3000, isOffered: true },
];

// ============================================================
// 5. 기초과학 (17~18학점: 수학 6 + 물/화/생/전컴 9이상 + 실험)
// ============================================================
export const MATH_COURSES: CourseMaster[] = [
  { courseCode: 'GS1001', courseNameKo: '미적분학과 응용', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS2001', courseNameKo: '다변수해석학과 응용', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'GS2002', courseNameKo: '미분방정식과 응용', credits: 3, level: 2000, isOffered: true },
  { courseCode: 'GS2004', courseNameKo: '선형대수학과 응용', credits: 3, level: 2000, isOffered: true },
];

export const PHYSICS_COURSES: CourseMaster[] = [
  { courseCode: 'GS1101', courseNameKo: '일반물리학 및 연습 I', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1103', courseNameKo: '고급일반물리학 및 연습 I', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1102', courseNameKo: '일반물리학 및 연습 Ⅱ', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1104', courseNameKo: '고급일반물리학 및 연습 Ⅱ', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1111', courseNameKo: '일반물리학 실험 I', credits: 1, level: 1000, isOffered: true },
  { courseCode: 'GS1112', courseNameKo: '일반물리학 실험 Ⅱ', credits: 1, level: 1000, isOffered: true },
];

export const CHEMISTRY_COURSES: CourseMaster[] = [
  { courseCode: 'GS1201', courseNameKo: '일반화학 및 연습 I', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1202', courseNameKo: '일반화학 및 연습 Ⅱ', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1211', courseNameKo: '일반화학실험 Ⅰ', credits: 1, level: 1000, isOffered: true },
  { courseCode: 'GS1212', courseNameKo: '일반화학실험 Ⅱ', credits: 1, level: 1000, isOffered: true },
];

export const BIOLOGY_COURSES: CourseMaster[] = [
  { courseCode: 'GS1301', courseNameKo: '생물학', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1302', courseNameKo: '인간 생물학', credits: 3, level: 1000, isOffered: true },
  { courseCode: 'GS1304', courseNameKo: '현대 생명과학의 이해', credits: 1, level: 1000, isOffered: true },
  { courseCode: 'GS1311', courseNameKo: '일반생물학 실험', credits: 1, level: 1000, isOffered: true },
  { courseCode: 'GS1322', courseNameKo: '생명과학속 이야기들', credits: 3, level: 1000, isOffered: true },
];

// ============================================================
// 6. 전공별 추천 과목 (주요 학과)
// ============================================================
export const MAJOR_EC_COURSES: CourseMaster[] = [
  {
    courseCode: 'EC2107',
    courseNameKo: '기초공학수학 Ⅰ',
    credits: 3,
    level: 2000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC2201',
    courseNameKo: '회로이론',
    credits: 3,
    level: 2000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC2202',
    courseNameKo: '자료 구조',
    credits: 3,
    level: 2000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC2203',
    courseNameKo: '디지털 설계',
    credits: 3,
    level: 2000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC2204',
    courseNameKo: '컴퓨터 구조',
    credits: 3,
    level: 2000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC3102',
    courseNameKo: '컴퓨터 시스템 이론 및 실험',
    credits: 4,
    level: 3000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC3207',
    courseNameKo: '전자회로',
    credits: 3,
    level: 3000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC3215',
    courseNameKo: '시스템 프로그래밍',
    credits: 3,
    level: 3000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC3216',
    courseNameKo: '오토마타 이론',
    credits: 3,
    level: 3000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC4205',
    courseNameKo: '운영체제',
    credits: 3,
    level: 4000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC4209',
    courseNameKo: '인공 지능',
    credits: 3,
    level: 4000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
  {
    courseCode: 'EC4213',
    courseNameKo: '기계학습 및 딥러닝',
    credits: 3,
    level: 4000,
    department: '전기전자컴퓨터공학과',
    isOffered: true,
  },
];

export const MAJOR_MA_COURSES: CourseMaster[] = [
  {
    courseCode: 'MA2101',
    courseNameKo: '재료과학',
    credits: 3,
    level: 2000,
    department: '신소재공학과',
    isOffered: true,
  },
  {
    courseCode: 'MA2102',
    courseNameKo: '열역학',
    credits: 3,
    level: 2000,
    department: '신소재공학과',
    isOffered: true,
  },
  {
    courseCode: 'MA2103',
    courseNameKo: '유기재료화학',
    credits: 3,
    level: 2000,
    department: '신소재공학과',
    isOffered: true,
  },
  {
    courseCode: 'MA2104',
    courseNameKo: '고분자과학',
    credits: 3,
    level: 2000,
    department: '신소재공학과',
    isOffered: true,
  },
  {
    courseCode: 'MA3104',
    courseNameKo: '전자재료실험',
    credits: 3,
    level: 3000,
    department: '신소재공학과',
    isOffered: true,
  },
  {
    courseCode: 'MA3105',
    courseNameKo: '유기재료실험',
    credits: 3,
    level: 3000,
    department: '신소재공학과',
    isOffered: true,
  },
];

export const MAJOR_MC_COURSES: CourseMaster[] = [
  {
    courseCode: 'MC2100',
    courseNameKo: '기계공학입문',
    credits: 3,
    level: 2000,
    department: '기계공학과',
    isOffered: true,
  },
  { courseCode: 'MC2101', courseNameKo: '정역학', credits: 3, level: 2000, department: '기계공학과', isOffered: true },
  {
    courseCode: 'MC2102',
    courseNameKo: '재료역학',
    credits: 3,
    level: 2000,
    department: '기계공학과',
    isOffered: true,
  },
  { courseCode: 'MC2103', courseNameKo: '열역학', credits: 3, level: 2000, department: '기계공학과', isOffered: true },
  {
    courseCode: 'MC3201',
    courseNameKo: '유체역학',
    credits: 3,
    level: 3000,
    department: '기계공학과',
    isOffered: true,
  },
];

export const MAJOR_BS_COURSES: CourseMaster[] = [
  {
    courseCode: 'BS2101',
    courseNameKo: '유기화학 Ⅰ',
    credits: 3,
    level: 2000,
    department: '생명과학과',
    isOffered: true,
  },
  {
    courseCode: 'BS2102',
    courseNameKo: '분자생물학',
    credits: 3,
    level: 2000,
    department: '생명과학과',
    isOffered: true,
  },
  {
    courseCode: 'BS2103',
    courseNameKo: '생화학·분자생물학 실험',
    credits: 3,
    level: 2000,
    department: '생명과학과',
    isOffered: true,
  },
  {
    courseCode: 'BS2104',
    courseNameKo: '생화학 I',
    credits: 3,
    level: 2000,
    department: '생명과학과',
    isOffered: true,
  },
  { courseCode: 'BS2202', courseNameKo: '유전학', credits: 3, level: 2000, department: '생명과학과', isOffered: true },
  {
    courseCode: 'BS3105',
    courseNameKo: '세포생물학',
    credits: 3,
    level: 3000,
    department: '생명과학과',
    isOffered: true,
  },
];

export const MAJOR_EV_COURSES: CourseMaster[] = [
  {
    courseCode: 'EV2208',
    courseNameKo: '분석화학',
    credits: 4,
    level: 2000,
    department: '환경·에너지공학과',
    isOffered: true,
  },
  {
    courseCode: 'EV2209',
    courseNameKo: '환경모니터링',
    credits: 3,
    level: 2000,
    department: '환경·에너지공학과',
    isOffered: true,
  },
  {
    courseCode: 'EV3101',
    courseNameKo: '환경에너지공학',
    credits: 3,
    level: 3000,
    department: '환경·에너지공학과',
    isOffered: true,
  },
  {
    courseCode: 'EV3106',
    courseNameKo: '환경분석실험 I',
    credits: 3,
    level: 3000,
    department: '환경·에너지공학과',
    isOffered: true,
  },
];

export const MAJOR_AI_COURSES: CourseMaster[] = [
  {
    courseCode: 'AI2004',
    courseNameKo: '시스템 프로그래밍',
    credits: 3,
    level: 2000,
    department: 'AI융합학과',
    isOffered: true,
  },
  {
    courseCode: 'AI2050',
    courseNameKo: '자료 구조',
    credits: 3,
    level: 2000,
    department: 'AI융합학과',
    isOffered: true,
  },
  {
    courseCode: 'AI2051',
    courseNameKo: '알고리즘 개론',
    credits: 3,
    level: 2000,
    department: 'AI융합학과',
    isOffered: true,
  },
  {
    courseCode: 'AI3001',
    courseNameKo: '오토마타 이론',
    credits: 3,
    level: 3000,
    department: 'AI융합학과',
    isOffered: true,
  },
  {
    courseCode: 'AI3004',
    courseNameKo: '운영체제',
    credits: 3,
    level: 3000,
    department: 'AI융합학과',
    isOffered: true,
  },
  {
    courseCode: 'AI4004',
    courseNameKo: '컴퓨터 비전',
    credits: 3,
    level: 4000,
    department: 'AI융합학과',
    isOffered: true,
  },
  {
    courseCode: 'AI4020',
    courseNameKo: '인공지능',
    credits: 3,
    level: 4000,
    department: 'AI융합학과',
    isOffered: true,
  },
  {
    courseCode: 'AI4021',
    courseNameKo: '기계학습 및 딥러닝',
    credits: 3,
    level: 4000,
    department: 'AI융합학과',
    isOffered: true,
  },
  { courseCode: 'AI4311', courseNameKo: '딥러닝', credits: 3, level: 4000, department: 'AI융합학과', isOffered: true },
];

// ============================================================
// 헬퍼 함수
// ============================================================

/**
 * 전체 과목 마스터 데이터 반환
 */
export function getAllCourses(): CourseMaster[] {
  return [
    ...ETC_MANDATORY_COURSES,
    ...LANGUAGE_BASIC_COURSES,
    ...HUS_COURSES,
    ...PPE_COURSES,
    ...SOFTWARE_COURSES,
    ...MATH_COURSES,
    ...PHYSICS_COURSES,
    ...CHEMISTRY_COURSES,
    ...BIOLOGY_COURSES,
    ...MAJOR_EC_COURSES,
    ...MAJOR_MA_COURSES,
    ...MAJOR_MC_COURSES,
    ...MAJOR_BS_COURSES,
    ...MAJOR_EV_COURSES,
    ...MAJOR_AI_COURSES,
  ];
}

/**
 * 현재 개설된 과목만 필터링
 */
export function getOfferedCourses(courses: CourseMaster[]): CourseMaster[] {
  return courses.filter((c) => c.isOffered);
}

/**
 * 과목 코드로 과목 조회
 */
export function getCourseByCode(courseCode: string): CourseMaster | undefined {
  return getAllCourses().find((c) => c.courseCode === courseCode);
}

/**
 * 요건 도메인별 추천 과목 반환 (개설 과목만)
 */
export function getRecommendedCoursesByDomain(domain: RequirementDomain): CourseMaster[] {
  switch (domain) {
    case 'etcMandatory':
      return getOfferedCourses(ETC_MANDATORY_COURSES);
    case 'languageBasic':
      return getOfferedCourses(LANGUAGE_BASIC_COURSES);
    case 'humanities':
      return getOfferedCourses([...HUS_COURSES, ...PPE_COURSES]);
    case 'software':
      return getOfferedCourses(SOFTWARE_COURSES);
    case 'scienceBasic':
      return getOfferedCourses([...MATH_COURSES, ...PHYSICS_COURSES, ...CHEMISTRY_COURSES, ...BIOLOGY_COURSES]);
    case 'major':
      return getOfferedCourses([
        ...MAJOR_EC_COURSES,
        ...MAJOR_MA_COURSES,
        ...MAJOR_MC_COURSES,
        ...MAJOR_BS_COURSES,
        ...MAJOR_EV_COURSES,
        ...MAJOR_AI_COURSES,
      ]);
    default:
      return [];
  }
}
