// lib/stores/useGraduationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStatusType } from '@lib/types/index';
import type { GradStatusResponseType, MinorDeclarationTerms, TakenCourseType } from '@lib/types/grad';
import { FineGrainedRequirement } from '@lib/types/grad-requirements';
import type {
  RecommendationDisplayPolicy,
  RecommendationItem,
  RecommendationSuppression,
} from '@features/graduation/data';
import { PARSED_PROCESSED_STATE_KEY } from './storage-key';

export type GradStatusExtended = GradStatusResponseType & {
  fineGrainedRequirements?: FineGrainedRequirement[];
  recommendations?: RecommendationItem[];
  allRecommendations?: RecommendationItem[];
  recommendationSuppressions?: RecommendationSuppression[];
  recommendationPolicy?: Required<RecommendationDisplayPolicy>;
};

type GraduationState = {
  parsed: UserStatusType | null;
  takenCourses: TakenCourseType[];
  gradStatus: GradStatusExtended | null;
  userMajor: string;
  userMinors: string[];
  minorDeclarationTerms: MinorDeclarationTerms;
  entryYear: number | null;
  lastUploadDate: string | null; // ISO date string

  setFromParsed: (args: {
    parsed: UserStatusType;
    takenCourses: TakenCourseType[];
    gradStatus: GradStatusExtended | null;
    userMajor: string;
    userMinors?: string[];
    minorDeclarationTerms?: MinorDeclarationTerms;
    entryYear?: number;
  }) => void;

  reset: () => void;
};

export const useGraduationStore = create<GraduationState>()(
  persist(
    (set) => ({
      parsed: null,
      takenCourses: [],
      gradStatus: null,
      userMajor: '',
      userMinors: [],
      minorDeclarationTerms: {},
      entryYear: null,
      lastUploadDate: null,

      setFromParsed: ({ parsed, takenCourses, gradStatus, userMajor, userMinors, minorDeclarationTerms, entryYear }) =>
        set({
          parsed,
          takenCourses,
          gradStatus,
          userMajor,
          userMinors: userMinors ?? [],
          minorDeclarationTerms: minorDeclarationTerms ?? {},
          entryYear: entryYear ?? null,
          lastUploadDate: new Date().toISOString(),
        }),

      reset: () =>
        set({
          parsed: null,
          takenCourses: [],
          gradStatus: null,
          userMajor: '',
          userMinors: [],
          minorDeclarationTerms: {},
          entryYear: null,
          lastUploadDate: null,
        }),
    }),
    {
      name: PARSED_PROCESSED_STATE_KEY, // localStorage key
    },
  ),
);
