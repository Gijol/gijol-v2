import type { RequirementSource } from '../types';

/** 2026 bachelor manual p.18: software basics is separate from the programming field. */
export const SCIENCE_SOURCE: RequirementSource = {
  manualYear: 2026,
  page: 18,
  path: 'docs/bachelor_manual/2026_manual.pdf',
  note: '수학 6학점과 전컴/생명/물리/화학 중 3분야; 선택한 자연과학 분야는 연계 실험 필수',
};

export const CALCULUS_CODES = ['GS1001', 'GS1011'] as const;
export const CORE_MATH_CODES = [
  'GS1002',
  'GS2001',
  'MM2001',
  'MM2011',
  'GS1012',
  'GS2004',
  'GS2013',
  'MM2004',
  'GS2002',
  'MM2002',
] as const;
export const PROBABILITY_CODES = ['GS2008', 'MM2701'] as const;
export const SOFTWARE_BASIC_CODES = ['GS1490', 'GS1499'] as const;
export const SCIENCE_FIELD_COURSES = {
  physics: { lectures: ['GS1101', 'GS1103'], labs: ['GS1111'] },
  chemistry: { lectures: ['GS1201', 'GS1203'], labs: ['GS1211'] },
  biology: { lectures: ['GS1301', 'GS1302', 'GS1303'], labs: ['GS1311'] },
  sw: { lectures: ['GS1401'], labs: [] },
} as const;

export function getCoreMathCodes(entryYear: number): readonly string[] {
  return entryYear >= 2026 ? [...CORE_MATH_CODES, ...PROBABILITY_CODES] : [...CORE_MATH_CODES, 'GS2003'];
}

export function isBasicScienceCode(code: string, entryYear: number): boolean {
  return (
    ([...CALCULUS_CODES, ...getCoreMathCodes(entryYear)] as readonly string[]).includes(code) ||
    Object.values(SCIENCE_FIELD_COURSES).some((field) =>
      ([...field.lectures, ...field.labs] as readonly string[]).includes(code),
    )
  );
}
