// lib/stores/useGraduationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStatusType } from '@lib/types/index';
import type { GradStatusResponseType, TakenCourseType } from '@lib/types/grad';
import { FineGrainedRequirement } from '@lib/types/grad-requirements';

export type GradStatusExtended = GradStatusResponseType & {
  fineGrainedRequirements?: FineGrainedRequirement[];
};


type GraduationState = {
  parsed: UserStatusType | null;
  takenCourses: TakenCourseType[];
  gradStatus: GradStatusExtended | null;

  setFromParsed: (args: {
    parsed: UserStatusType;
    takenCourses: TakenCourseType[];
    gradStatus: GradStatusResponseType | null;
  }) => void;

  reset: () => void;
};

export const useGraduationStore = create<GraduationState>()(
  persist(
    (set) => ({
      parsed: null,
      takenCourses: [],
      gradStatus: null,

      setFromParsed: ({ parsed, takenCourses, gradStatus }) =>
        set({ parsed, takenCourses, gradStatus }),

      reset: () => set({ parsed: null, takenCourses: [], gradStatus: null }),
    }),
    {
      name: 'gijol_grad_state_v1', // localStorage key
    }
  )
);
