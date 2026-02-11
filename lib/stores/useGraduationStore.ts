// lib/stores/useGraduationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStatusType } from '@lib/types/index';
import type { GraduationApiResponseType, TakenCourseType } from '@lib/types/grad';
import { PARSED_PROCESSED_STATE_KEY } from './storage-key';

export type GradStatusExtended = GraduationApiResponseType;

type GraduationState = {
  parsed: UserStatusType | null;
  takenCourses: TakenCourseType[];
  gradStatus: GradStatusExtended | null;
  userMajor: string;
  userMinors: string[];
  entryYear: number | null;
  lastUploadDate: string | null; // ISO date string

  setFromParsed: (args: {
    parsed: UserStatusType;
    takenCourses: TakenCourseType[];
    gradStatus: GraduationApiResponseType | null;
    userMajor: string;
    userMinors?: string[];
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
      entryYear: null,
      lastUploadDate: null,

      setFromParsed: ({ parsed, takenCourses, gradStatus, userMajor, userMinors, entryYear }) =>
        set({
          parsed,
          takenCourses,
          gradStatus,
          userMajor,
          userMinors: userMinors ?? [],
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
          entryYear: null,
          lastUploadDate: null,
        }),
    }),
    {
      name: PARSED_PROCESSED_STATE_KEY, // localStorage key
    },
  ),
);
