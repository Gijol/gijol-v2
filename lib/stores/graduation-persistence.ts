import type { UserStatusType } from '@lib/types/index';
import type { MinorDeclarationTerms, TakenCourseType } from '@lib/types/grad';
import { toTakenCourses } from '@utils/graduation/grad-status-helper';
import { LEGACY_GRADUATION_LOCAL_KEY, LEGACY_GRADUATION_STATE_KEY, PARSED_EDITABLE_STATE_KEY } from './storage-key';

export const GRADUATION_PERSISTENCE_VERSION = 1;
export const GRADUATION_DRAFT_VERSION = 1;

export type DurableGraduationState = {
  parsed: UserStatusType | null;
  userMajor: string;
  userMinors: string[];
  minorDeclarationTerms: MinorDeclarationTerms;
  entryYear: number | null;
  lastUploadDate: string | null;
};

type PersistedGraduationDraft = {
  version: typeof GRADUATION_DRAFT_VERSION;
  draft: UserStatusType;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

export function isParsedUserStatus(value: unknown): value is UserStatusType {
  return Boolean(isRecord(value) && typeof value.studentId === 'string' && Array.isArray(value.userTakenCourseList));
}

function normalizeMinors(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((minor): minor is string => typeof minor === 'string') : [];
}

function normalizeMinorDeclarationTerms(value: unknown): MinorDeclarationTerms {
  return isRecord(value) ? (value as MinorDeclarationTerms) : {};
}

/**
 * Zustand v0 payload와 새 payload를 하나의 canonical durable shape로 정규화한다.
 * takenCourses와 gradStatus는 의도적으로 반환하지 않는다.
 */
export function migratePersistedGraduationState(value: unknown): DurableGraduationState {
  const state = isRecord(value) ? value : {};
  const parsed = isParsedUserStatus(state.parsed) ? state.parsed : null;

  return {
    parsed,
    userMajor: typeof state.userMajor === 'string' ? state.userMajor : '',
    userMinors: normalizeMinors(state.userMinors),
    minorDeclarationTerms: normalizeMinorDeclarationTerms(state.minorDeclarationTerms),
    entryYear: typeof state.entryYear === 'number' && Number.isFinite(state.entryYear) ? state.entryYear : null,
    lastUploadDate: typeof state.lastUploadDate === 'string' ? state.lastUploadDate : null,
  };
}

export function deriveTakenCourses(parsed: UserStatusType | null): TakenCourseType[] {
  return parsed ? toTakenCourses(parsed) : [];
}

export function readGraduationDraft(storage: Storage | undefined = getBrowserStorage()): UserStatusType | null {
  if (!storage) return null;

  const candidates = [PARSED_EDITABLE_STATE_KEY, LEGACY_GRADUATION_LOCAL_KEY, LEGACY_GRADUATION_STATE_KEY];

  for (const key of candidates) {
    const raw = storage.getItem(key);
    if (!raw) continue;

    try {
      const value: unknown = JSON.parse(raw);
      if (isParsedUserStatus(value)) return value; // legacy raw JSON
      if (!isRecord(value)) continue;
      if (value.version === GRADUATION_DRAFT_VERSION && isParsedUserStatus(value.draft)) return value.draft;
      if (isRecord(value.state) && isParsedUserStatus(value.state.parsed)) return value.state.parsed;
    } catch {
      // A corrupt candidate must not prevent recovery from an older valid key.
    }
  }

  return null;
}

export function writeGraduationDraft(draft: UserStatusType, storage: Storage | undefined = getBrowserStorage()): void {
  if (!storage) return;
  const value: PersistedGraduationDraft = { version: GRADUATION_DRAFT_VERSION, draft };
  storage.setItem(PARSED_EDITABLE_STATE_KEY, JSON.stringify(value));
}

export function clearGraduationDraft(storage: Storage | undefined = getBrowserStorage()): void {
  if (!storage) return;
  storage.removeItem(PARSED_EDITABLE_STATE_KEY);
  storage.removeItem(LEGACY_GRADUATION_LOCAL_KEY);
  storage.removeItem(LEGACY_GRADUATION_STATE_KEY);
}

function getBrowserStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}
