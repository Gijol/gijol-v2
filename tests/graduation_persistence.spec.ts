import type { UserStatusType } from '@lib/types/index';
import {
  clearGraduationDraft,
  deriveTakenCourses,
  GRADUATION_DRAFT_VERSION,
  migratePersistedGraduationState,
  readGraduationDraft,
  writeGraduationDraft,
} from '@/lib/stores/graduation-persistence';
import { LEGACY_GRADUATION_STATE_KEY, PARSED_EDITABLE_STATE_KEY } from '@/lib/stores/storage-key';

const transcript: UserStatusType = {
  studentId: '20201234',
  userTakenCourseList: [
    {
      courseCode: 'GS1001',
      courseName: '테스트 과목',
      courseType: '기초',
      credit: 3,
      grade: 'A+',
      semester: '봄',
      year: 2020,
    },
  ],
};

describe('graduation persistence', () => {
  beforeEach(() => window.localStorage.clear());

  it('keeps only canonical transcript and academic context when migrating the legacy Zustand payload', () => {
    const migrated = migratePersistedGraduationState({
      parsed: transcript,
      takenCourses: [{ courseCode: 'duplicated-derived-course' }],
      gradStatus: { totalSatisfied: true, recommendations: [{ courseCode: 'derived-recommendation' }] },
      userMajor: 'EC',
      userMinors: ['AI'],
      minorDeclarationTerms: { AI: { year: 2024, semester: '가을' } },
      entryYear: 2020,
      lastUploadDate: '2026-07-16T00:00:00.000Z',
    });

    expect(migrated).toEqual({
      parsed: transcript,
      userMajor: 'EC',
      userMinors: ['AI'],
      minorDeclarationTerms: { AI: { year: 2024, semester: '가을' } },
      entryYear: 2020,
      lastUploadDate: '2026-07-16T00:00:00.000Z',
    });
    expect(migrated).not.toHaveProperty('takenCourses');
    expect(migrated).not.toHaveProperty('gradStatus');
  });

  it('falls back to an empty valid state for corrupt or structurally invalid persisted data', () => {
    expect(migratePersistedGraduationState(null)).toEqual({
      parsed: null,
      userMajor: '',
      userMinors: [],
      minorDeclarationTerms: {},
      entryYear: null,
      lastUploadDate: null,
    });
    expect(migratePersistedGraduationState({ parsed: { studentId: '2020' } }).parsed).toBeNull();
  });

  it('regenerates the normalized course projection from the canonical transcript', () => {
    expect(deriveTakenCourses(transcript)).toEqual([
      {
        year: 2020,
        semester: '봄',
        courseType: '기초',
        courseName: '테스트 과목',
        courseCode: 'GS1001',
        credit: 3,
      },
    ]);
  });

  it('reads legacy raw drafts and rewrites drafts in the versioned envelope', () => {
    window.localStorage.setItem(PARSED_EDITABLE_STATE_KEY, JSON.stringify(transcript));
    expect(readGraduationDraft()).toEqual(transcript);

    writeGraduationDraft(transcript);
    expect(JSON.parse(window.localStorage.getItem(PARSED_EDITABLE_STATE_KEY) ?? '')).toEqual({
      version: GRADUATION_DRAFT_VERSION,
      draft: transcript,
    });
    expect(readGraduationDraft()).toEqual(transcript);
  });

  it('recovers from a corrupt current draft through the historical Zustand envelope', () => {
    window.localStorage.setItem(PARSED_EDITABLE_STATE_KEY, '{broken-json');
    window.localStorage.setItem(
      LEGACY_GRADUATION_STATE_KEY,
      JSON.stringify({ state: { parsed: transcript, gradStatus: { totalSatisfied: true } }, version: 0 }),
    );

    expect(readGraduationDraft()).toEqual(transcript);
  });

  it('contains malformed drafts and clears the draft lifecycle centrally', () => {
    window.localStorage.setItem(PARSED_EDITABLE_STATE_KEY, '{broken-json');
    expect(readGraduationDraft()).toBeNull();

    clearGraduationDraft();
    expect(window.localStorage.getItem(PARSED_EDITABLE_STATE_KEY)).toBeNull();
  });
});
