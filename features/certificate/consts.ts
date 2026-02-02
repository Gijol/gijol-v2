export const SECTION_TITLES = [
  '신청자 정보',
  '기초 및 교양 학점',
  '전공 | 연구 | 자유선택 학점',
  '무학점 필수',
  '해외대학 학점',
  '검토 및 제출',
] as const;

export type SectionTitleType = (typeof SECTION_TITLES)[number];
