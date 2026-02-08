// ✅ 2025 학사편람 기준(대략) 전공 리스트
export const MAJOR_OPTIONS = [
  { value: 'NONE', label: '전공 없음 (기초교육학부)' },
  { value: 'EC', label: '전기전자컴퓨터공학부' },
  { value: 'MA', label: '신소재공학과' },
  { value: 'MC', label: '기계로봇공학과' },
  { value: 'EV', label: '환경·에너지공학과' },
  { value: 'BS', label: '생명과학과' },
  { value: 'FE', label: '의생명공학과' },
  { value: 'PS', label: '물리·광과학과' },
  { value: 'CH', label: '화학과' },
  { value: 'MM', label: '수리과학과' },
  { value: 'AI', label: 'AI융합학과' },
  { value: 'SE', label: '반도체공학과' },
];

// GIST 기준 예시 부전공 목록 (필요하면 수정/추가)
export const MINOR_OPTIONS = [
  // Traditional departments that can be both majors and minors
  { value: 'EC', label: '전기전자컴퓨터공학' },
  { value: 'MA', label: '신소재공학' },
  { value: 'MC', label: '기계공학' },
  { value: 'EV', label: '환경·에너지공학' },
  { value: 'BS', label: '생명과학' },
  { value: 'PS', label: '물리·광과학' },
  { value: 'CH', label: '화학' },
  { value: 'MM', label: '수리과학' },

  // Special minors
  { value: 'CT', label: '문화기술' },
  { value: 'LH_LIT', label: '인문사회-문학과 역사' },
  { value: 'LH_PP', label: '인문사회-공공정책' },
  { value: 'LH_EB', label: '인문사회-경제경영' },
  { value: 'LH_SS', label: '인문사회-과학기술과 사회' },
  { value: 'LH_MB', label: '인문사회-마음과 행동' },
  { value: 'IR', label: '지능로봇' },
  { value: 'AI', label: 'AI융합' },
  { value: 'FE', label: '에너지' },
  { value: 'MD', label: '의생명' },
  { value: 'SE', label: '반도체공학' },
];
