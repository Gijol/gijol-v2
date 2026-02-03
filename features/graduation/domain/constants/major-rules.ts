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
  // === Special Minors ===

  // Existing: 지능로봇 (IR) - Take 3 from 5
  IR: [
    {
      label: '부전공 필수 택3 (IR4201, IR4202, IR4203, IR4205, IR4206)',
      requiredCount: 3,
      courses: ['IR4201', 'IR4202', 'IR4203', 'IR4205', 'IR4206'],
    },
  ],

  // NEW: 문화기술 (CT) - Take 3 from 10
  CT: [
    {
      label: '부전공 필수 택3',
      requiredCount: 3,
      courses: ['CT4101', 'CT4102', 'CT4201', 'CT4202', 'CT4203', 'CT4301', 'CT4302', 'CT4303', 'CT4304', 'CT4305'],
    },
  ],

  // NEW: AI융합 - Two groups (필수A, 필수B)
  AI: [
    {
      label: '부전공 필수A 택1 (인공지능 관련)',
      requiredCount: 1,
      courses: ['AI4020', 'AI4021', 'AI4311'],
    },
    {
      label: '부전공 필수B 택1 (프로젝트 관련)',
      requiredCount: 1,
      courses: ['AI4003', 'AI4028', 'AI4501'],
    },
  ],

  // NEW: 의생명 (MD) - Take 1 (must take)
  MD: [
    {
      label: '부전공 필수 (MD2101)',
      requiredCount: 1,
      courses: ['MD2101'],
    },
  ],

  // === Humanities Minors ===

  // NEW: 문학과 역사 - Take all 4
  LH_LIT: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 4,
      courses: ['LH2507', 'LH2509', 'LH2521', 'LH2602'],
    },
  ],

  // NEW: 공공정책 - Take all 4 (same as 문학과 역사)
  LH_PP: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 4,
      courses: ['LH2507', 'LH2509', 'LH2521', 'LH2602'],
    },
  ],

  // NEW: 경제경영 - Take all 3
  LH_EB: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 3,
      courses: ['EB2750', 'EB3722', 'EB3737'],
    },
  ],

  // No mandatory rules for LH_SS (과학기술과 사회) and LH_MB (마음과 행동)

  // === Traditional Department Minors ===

  // NEW: 전기전자컴퓨터 (EC) - Take 1 from 2
  EC: [
    {
      label: '부전공 필수 택1',
      requiredCount: 1,
      courses: ['EC3101', 'EC3102'], // 전자공학실험(3) OR 컴퓨터 시스템 이론 및 실험(4)
    },
  ],

  // NEW: 신소재 (MA) - Take all 6
  MA: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 6,
      courses: ['MA2101', 'MA2102', 'MA2103', 'MA2104', 'MA3104', 'MA3105'],
    },
  ],

  // NEW: 기계 (MC) - Take all 6
  MC: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 6,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106', 'MC3107'],
    },
  ],

  // NEW: 환경·에너지 (EV) - Take all 5 (based on 2024 curriculum)
  EV: [
    {
      label: '부전공 필수 (전체 이수, 2024학번~)',
      requiredCount: 5,
      courses: ['EV3101', 'EV3106', 'EV3111', 'EV4106', 'EV4107'],
    },
  ],
  // Note: 2018~2023 학번은 EV4106 대신 EV3103(지구환경이동현상) 또는 EV4243(열물질전달)/EV3112(환경·에너지과학통계) 대체 가능

  // NEW: 생명과학 (BS) - Take all 5
  BS: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 5,
      courses: ['BS2101', 'BS2102', 'BS2104', 'BS3101', 'BS3105'],
    },
  ],

  // NEW: 물리·광과학 (PS) - Take all 6
  PS: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 6,
      courses: ['PS2101', 'PS2102', 'PS2103', 'PS3103', 'PS3104', 'PS3105'],
    },
  ],

  // NEW: 화학 (CH) - Take all 5
  CH: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 5,
      courses: ['CH2101', 'CH2102', 'CH2104', 'CH2103', 'CH2105'],
    },
  ],

  // NEW: 수리과학 (MM) - Take all core courses
  MM: [
    {
      label: '부전공 필수 (전체 이수)',
      requiredCount: 8,
      courses: [
        'MM2001', // 또는 MM2011 (고급다변수해석학과 응용)
        'MM2002', // 미분방정식과 응용
        'MM2004', // 선형대수학과 응용 1
        'MM3101', // 현대대수학 1
        'MM3201', // 해석학과 응용
        'MM3203', // 복소함수학 및 응용
        'MM4901', // 수학 콜로퀴움
        'MM2701', // 확률과 통계 (또는 대체과목: MM3750/PS3105, MM4750/EC5207, MM4752/EC5423)
      ],
    },
  ],
  // Note: MM2001과 MM2011은 중복 수강 불가, MM2011은 MM2001의 대체과목
  // Note: MM2701 대체과목은 2025-2학기 복수전공 신청자에 한함
};
