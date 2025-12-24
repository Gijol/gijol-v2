// lib/stores/useGraduationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStatusType } from '@lib/types/index';
import type { GradStatusResponseType, TakenCourseType } from '@lib/types/grad';
import { FineGrainedRequirement } from '@lib/types/grad-requirements';
import { PARSED_PROCESSED_STATE_KEY } from './storage-key';

export type GradStatusExtended = GradStatusResponseType & {
  fineGrainedRequirements?: FineGrainedRequirement[];
};


type GraduationState = {
  parsed: UserStatusType | null;
  takenCourses: TakenCourseType[];
  gradStatus: GradStatusExtended | null;
  userMajor: string;

  setFromParsed: (args: {
    parsed: UserStatusType;
    takenCourses: TakenCourseType[];
    gradStatus: GradStatusResponseType | null;
    userMajor: string;
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

      setFromParsed: ({ parsed, takenCourses, gradStatus, userMajor }) =>
        set({ parsed, takenCourses, gradStatus, userMajor }),

      reset: () => set({ parsed: null, takenCourses: [], gradStatus: null, userMajor: '' }),
    }),
    {
      name: PARSED_PROCESSED_STATE_KEY, // localStorage key
    }
  )
);
