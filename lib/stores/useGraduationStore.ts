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
import { gradStatusFetchFn, inferEntryYear } from '@utils/graduation/grad-status-helper';
import { PARSED_PROCESSED_STATE_KEY } from './storage-key';
import {
  deriveTakenCourses,
  GRADUATION_PERSISTENCE_VERSION,
  migratePersistedGraduationState,
  type DurableGraduationState,
} from './graduation-persistence';
import { useGraduationMetadataStore } from './useGraduationMetadataStore';

export type GradStatusExtended = GradStatusResponseType & {
  fineGrainedRequirements?: FineGrainedRequirement[];
  recommendations?: RecommendationItem[];
  allRecommendations?: RecommendationItem[];
  recommendationSuppressions?: RecommendationSuppression[];
  recommendationPolicy?: Required<RecommendationDisplayPolicy>;
};

type GraduationState = DurableGraduationState & {
  // 아래 두 필드는 canonical input에서 재생성되며 localStorage에 저장하지 않는다.
  takenCourses: TakenCourseType[];
  gradStatus: GradStatusExtended | null;
  isRegeneratingOutcome: boolean;
  outcomeRegenerationError: string | null;

  commitTranscript: (args: {
    parsed: UserStatusType;
    outcome: GradStatusExtended | null;
    userMajor: string;
    userMinors?: string[];
    minorDeclarationTerms?: MinorDeclarationTerms;
    entryYear?: number;
  }) => void;
  updateAcademicContext: (args: {
    gradStatus: GradStatusExtended;
    userMajor: string;
    userMinors: string[];
    minorDeclarationTerms: MinorDeclarationTerms;
    entryYear: number;
  }) => void;
  regenerateOutcome: () => Promise<void>;
  reset: () => void;
};

const durableInitialState: DurableGraduationState = {
  parsed: null,
  userMajor: '',
  userMinors: [],
  minorDeclarationTerms: {},
  entryYear: null,
  lastUploadDate: null,
};

export const useGraduationStore = create<GraduationState>()(
  persist(
    (set, get) => ({
      ...durableInitialState,
      takenCourses: [],
      gradStatus: null,
      isRegeneratingOutcome: false,
      outcomeRegenerationError: null,

      commitTranscript: ({ parsed, outcome, userMajor, userMinors, minorDeclarationTerms, entryYear }) => {
        const uploadedAt = new Date().toISOString();
        set({
          parsed,
          takenCourses: deriveTakenCourses(parsed),
          gradStatus: outcome,
          userMajor,
          userMinors: userMinors ?? [],
          minorDeclarationTerms: minorDeclarationTerms ?? {},
          entryYear: entryYear ?? null,
          lastUploadDate: uploadedAt,
          isRegeneratingOutcome: false,
          outcomeRegenerationError: null,
        });
        useGraduationMetadataStore.getState().markUploaded(uploadedAt);
      },

      updateAcademicContext: ({ gradStatus, userMajor, userMinors, minorDeclarationTerms, entryYear }) =>
        set({
          gradStatus,
          userMajor,
          userMinors,
          minorDeclarationTerms,
          entryYear,
          outcomeRegenerationError: null,
        }),

      regenerateOutcome: async () => {
        const snapshot = get();
        if (!snapshot.parsed || snapshot.takenCourses.length === 0 || snapshot.isRegeneratingOutcome) return;

        const entryYear = snapshot.entryYear ?? inferEntryYear(snapshot.parsed);
        if (!entryYear) {
          set({ outcomeRegenerationError: '입학년도를 확인할 수 없어 졸업 판정을 재계산하지 못했습니다.' });
          return;
        }

        const sourceRevision = snapshot.lastUploadDate;
        set({ isRegeneratingOutcome: true, outcomeRegenerationError: null });

        try {
          const outcome = await gradStatusFetchFn({
            entryYear,
            takenCourses: snapshot.takenCourses,
            userMajor: snapshot.userMajor || undefined,
            userMinors: snapshot.userMinors,
            minorDeclarationTerms: snapshot.minorDeclarationTerms,
          });

          // hydration 중 새 업로드가 들어오면 오래된 응답으로 덮어쓰지 않는다.
          if (get().lastUploadDate === sourceRevision) {
            set({ gradStatus: outcome, isRegeneratingOutcome: false });
          }
        } catch (error) {
          if (get().lastUploadDate === sourceRevision) {
            set({
              isRegeneratingOutcome: false,
              outcomeRegenerationError: error instanceof Error ? error.message : '졸업 판정을 재계산하지 못했습니다.',
            });
          }
        }
      },

      reset: () => {
        set({
          ...durableInitialState,
          takenCourses: [],
          gradStatus: null,
          isRegeneratingOutcome: false,
          outcomeRegenerationError: null,
        });
        useGraduationMetadataStore.getState().clear();
      },
    }),
    {
      name: PARSED_PROCESSED_STATE_KEY,
      version: GRADUATION_PERSISTENCE_VERSION,
      migrate: (persistedState) => migratePersistedGraduationState(persistedState),
      partialize: ({ parsed, userMajor, userMinors, minorDeclarationTerms, entryYear, lastUploadDate }) => ({
        parsed,
        userMajor,
        userMinors,
        minorDeclarationTerms,
        entryYear,
        lastUploadDate,
      }),
      merge: (persistedState, currentState) => {
        const durable = migratePersistedGraduationState(persistedState);
        return {
          ...currentState,
          ...durable,
          takenCourses: deriveTakenCourses(durable.parsed),
          gradStatus: null,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.parsed) void state.regenerateOutcome();
      },
    },
  ),
);
