export type MandatoryRule = {
  label: string;
  requiredCount: number;
  courses: string[];
};

export const MAJOR_MANDATORY_RULES: Record<string, MandatoryRule[]> = {
  EC: [
    {
      label: '전공필수 택1 (EC3101, EC3102)',
      requiredCount: 1,
      courses: ['EC3101', 'EC3102'],
    },
  ],
  MC: [
    {
      label: '전공필수 택3 (MC2100, MC2101, MC2102, MC2103, MC3106)',
      requiredCount: 3,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106'],
    },
  ],
};

export const MINOR_MANDATORY_RULES: Record<string, MandatoryRule[]> = {
  // ====== 융합/특수 부전공 ======

  // 지능로봇 (IR) - MINOR_RULES.md: 필수 목록 중 3과목 포함
  // HCI(IR4203), 메카트로닉스(IR4202), 딥러닝(IR4201), 로봇공학(IR4205), 인공지능 기반 창의적 로봇융합 시스템 설계(IR4206)
  IR: [
    {
      label: '부전공 필수 택3 (HCI, 메카트로닉스, 딥러닝, 로봇공학, 로봇융합시스템설계)',
      requiredCount: 3,
      courses: ['IR4201', 'IR4202', 'IR4203', 'IR4205', 'IR4206'],
    },
  ],
  // 경과조치 (2024-2학기 이전 선언자): 동역학(IR2202), 로봇 운동학(IR4208), 인간-AI 상호작용(IR4310) 필수 학점 인정

  // 문화기술 (CT) - MINOR_RULES.md: 필수 목록 중 3과목 포함
  CT: [
    {
      label: '부전공 필수 택3',
      requiredCount: 3,
      courses: [
        'CT4101', // 아이디어와 디지털 표현
        'CT4102', // 정보 시각화 방법과 디자인 사고
        'CT4201', // 컴퓨터 그래픽스
        'CT4202', // 영상 커뮤니케이션
        'CT4203', // 아트앤테크놀로지
        'CT4301', // 인간-컴퓨터 상호작용
        'CT4302', // 문화기술을 위한 인공지능 설계
        'CT4303', // 게임 인공지능
        'CT4304', // 피지컬 컴퓨팅 스튜디오
        'CT4305', // 서비스러닝 프로젝트(서비스러닝 캡스톤 디자인)
      ],
    },
  ],

  // AI융합 - MINOR_RULES.md: 필수A (택1) + 필수B (택1)
  AI: [
    {
      label: '부전공 필수A 택1 (인공지능/기계학습/딥러닝)',
      requiredCount: 1,
      courses: [
        'EC4209', // 인공지능
        'AI4020', // 인공지능 (AI 코드)
        'AI4021', // 기계학습 및 딥러닝
        'AI4311', // 딥러닝
      ],
    },
    {
      label: '부전공 필수B 택1 (프로젝트/경험랩)',
      requiredCount: 1,
      courses: [
        'AI4003', // 인공지능 경험 랩
        'AI4028', // AI 산업 전략과 실증 프로젝트
        'AI4501', // 게임 인공지능
      ],
    },
  ],
  // 경과조치 (2024-2학기 이전 선언자): AI핵심기술 기반 실무 프로젝트 1, 2는 필수B 인정

  // 의생명 (MD) - MINOR_RULES.md: 2025학번~ MD2101 필수 (이전 학번은 권고)
  MD: [
    {
      label: '부전공 필수 (MD2101 의공학 개론)',
      requiredCount: 1,
      courses: ['MD2101'],
    },
  ],

  // 에너지 (FE) - MINOR_RULES.md: 5개 과목(15학점) 이상 (필수규칙 없음)
  // 필수 규칙 없음, 학점 요건만 적용

  // ====== 인문사회 부전공 ======
  // MINOR_RULES.md: 2021학번~ 분야별 이수체계도에 따라 18학점 이상

  // 문학과 역사 (LH_LIT) - 필수과목 1과목 포함
  // 현재 구현은 4과목 전체 이수로 되어 있음 (보수적 적용)
  LH_LIT: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 4,
      courses: ['LH2507', 'LH2509', 'LH2521', 'LH2602'],
    },
  ],

  // 공공정책 (LH_PP) - 필수과목 1과목 포함
  LH_PP: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 4,
      courses: ['LH2507', 'LH2509', 'LH2521', 'LH2602'],
    },
  ],

  // 경제경영 (LH_EB) - 필수과목 (경영학원론, 미시경제론, 거시경제론)
  LH_EB: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 3,
      courses: [
        'EB2750', // 경영학원론
        'GS2750', // 경영학원론 (GS 코드)
        'EB3722', // 미시경제론
        'GS3722', // 미시경제론 (GS 코드)
        'EB3737', // 거시경제론
        'GS3737', // 거시경제론 (GS 코드)
      ],
    },
  ],

  // 과학기술과 사회 (LH_SS), 마음과 행동 (LH_MB) - 필수규칙 없음, 학점 요건만 적용

  // ====== 자연과학/공학 부전공 (학과 기반) ======

  // 전기전자컴퓨터 (EC) - MINOR_RULES.md: 전공필수 중 1과목 포함
  EC: [
    {
      label: '부전공 필수 택1 (전자공학실험 또는 컴퓨터시스템이론및실험)',
      requiredCount: 1,
      courses: ['EC3101', 'EC3102'],
    },
  ],
  // 추가 요건: EC 2천번대 6학점 이상, EC 3~4천번대 12학점 이상 (buildFineGrainedRequirements에서 처리)

  // 신소재 (MA) - MINOR_RULES.md: 전공필수 2과목 + MA 3~4천번대 3과목 포함
  MA: [
    {
      label: '부전공 전공필수 택2',
      requiredCount: 2,
      courses: ['MA2101', 'MA2102', 'MA2103', 'MA2104', 'MA3104', 'MA3105'],
    },
  ],
  // Note: 2천번대 전공필수 과목도 부전공 이수학점으로 인정

  // 기계로봇 (MC) - MINOR_RULES.md: 전공필수 중 3과목 포함
  MC: [
    {
      label: '부전공 전공필수 택3',
      requiredCount: 3,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106', 'MC3107'],
    },
  ],
  // Note: 2천번대 전공필수 과목도 부전공 이수학점으로 인정

  // 환경·에너지 (EV) - MINOR_RULES.md: 전공필수 중 3과목 포함 (실험제외, 환경에너지공학 필수)
  EV: [
    {
      label: '부전공 필수 (환경에너지공학)',
      requiredCount: 1,
      courses: ['EV3101'], // 환경에너지공학 필수
    },
    {
      label: '부전공 전공필수 택2 (실험과목 제외)',
      requiredCount: 2,
      courses: ['EV3111', 'EV3112'], // 지구시스템과학, 환경·에너지과학통계 (실험과목 제외)
    },
  ],

  // 생명과학 (BS) - MINOR_RULES.md: 전공필수 중 3과목 포함 (교과목 2 + 실험 1), BS2101 유기화학 제외
  BS: [
    {
      label: '부전공 전공필수 택3 (교과목2+실험1, 유기화학 제외)',
      requiredCount: 3,
      courses: [
        // BS2101 유기화학 제외
        'BS2102', // 분자생물학
        'BS2104', // 생화학 I
        'BS3101', // 생화학 II
        'BS3105', // 세포생물학
        'BS2103', // 생화학/분자생물학 실험
        'BS3111', // 분자생물학 실험
        'BS3112', // 세포·발생생물실험
      ],
    },
  ],

  // 물리·광과학 (PS) - MINOR_RULES.md:
  // 2021학번~: 각 그룹에서 1과목씩 필수
  // ~2020학번: 전공필수 중 3과목
  PS: [
    {
      label: '고전역학 택1 (PS2101/PS2202)',
      requiredCount: 1,
      courses: ['PS2101', 'PS2202'], // 고전역학 I / II
    },
    {
      label: '전자기학 택1 (PS2102/PS2103)',
      requiredCount: 1,
      courses: ['PS2102', 'PS2103'], // 전자기학 I / II
    },
    {
      label: '양자물리 택1 (PS3103/PS3104)',
      requiredCount: 1,
      courses: ['PS3103', 'PS3104'], // 양자물리 I / II
    },
  ],
  // Note: 2020학번 이전은 전공필수 중 3과목으로 대체 가능

  // 화학 (CH) - MINOR_RULES.md: 전공필수 중 3과목(9학점) 포함
  CH: [
    {
      label: '부전공 전공필수 택3',
      requiredCount: 3,
      courses: [
        'CH2101', // 분석화학
        'CH2102', // 물리화학A
        'CH2103', // 유기화학I
        'CH2104', // 물리화학B
        'CH2105', // 화학합성실험
      ],
    },
  ],
  // Note: 2천번대 전공교과목 인정
  // Note: 2018학번~ 21학점 이상, ~2017학번 15학점 이상

  // 수리과학 (MM) - MINOR_RULES.md: 복잡한 학번별 규칙
  // 2021~2025학번: 필수 4과목 + 선택 2과목 (18학점)
  // ~2020학번: 필수 4과목 + 선택 1과목 (15학점)
  MM: [
    {
      label: '부전공 필수 택3 (다변수해석학, 미분방정식, 선형대수학 중 도전탐색 필수과목 제외)',
      requiredCount: 3,
      courses: [
        'MM2001', // 다변수해석학과 응용
        'GS2001', // 다변수해석학과 응용 (GS)
        'MM2011', // 고급다변수해석학과 응용 (대체)
        'MM2002', // 미분방정식과 응용
        'GS2002', // 미분방정식과 응용 (GS)
        'MM2004', // 선형대수학과 응용 1
        'GS2004', // 선형대수학과 응용 (GS)
        'MM3101', // 현대대수학 1
      ],
    },
    {
      label: '부전공 필수 택1 (해석학/복소함수학)',
      requiredCount: 1,
      courses: [
        'MM3201', // 해석학과 응용
        'GS3001', // 해석학과 응용 (GS)
        'MM3203', // 복소함수학 및 응용
        'GS4002', // 복소함수학과 응용 (GS)
      ],
    },
  ],
  // Note: 졸업 전 4과목(다변수해석학, 미분방정식, 선형대수학, 현대대수학) 모두 이수 필요
  // Note: MM2001과 MM2011은 중복 수강 불가
};
