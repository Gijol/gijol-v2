import { CategoryKey } from '@features/graduation/domain';

// 세부 요건 단위: 그래프/다이어그램/시간표 추천에 공통으로 쓸 수 있는 정보
export type RequirementImportance = 'must' | 'should';

export interface FineGrainedRequirement {
  id: string; // 'language-english', 'science-math' 등
  categoryKey: CategoryKey; // languageBasic / scienceBasic ...
  label: string; // UI에 보여줄 이름 (예: '언어의 기초 - 영어 4학점')
  requiredCredits: number;
  acquiredCredits: number;
  missingCredits: number;
  satisfied: boolean;
  importance: RequirementImportance;
  // UI/추천용 힌트
  hint?: string;
  relatedCoursePatterns?: {
    codePrefixes?: string[];
    nameKeywords?: string[];
  };
}
