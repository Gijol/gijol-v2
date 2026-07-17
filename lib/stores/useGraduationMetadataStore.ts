import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { GRADUATION_METADATA_STATE_KEY, PARSED_PROCESSED_STATE_KEY } from './storage-key';

type GraduationMetadataState = {
  hasData: boolean;
  lastUploadDate: string | null;
  markUploaded: (uploadedAt: string) => void;
  clear: () => void;
};

function metadataStorage(): StateStorage {
  if (typeof window === 'undefined') throw new Error('Browser storage is unavailable during server rendering.');

  return {
    getItem: (name) => {
      const current = window.localStorage.getItem(name);
      if (current) return current;

      // 기존 사용자는 한 번만 큰 legacy payload를 읽고 이후부터 작은 메타데이터 키만 hydration한다.
      const legacy = window.localStorage.getItem(PARSED_PROCESSED_STATE_KEY);
      if (!legacy) return null;

      try {
        const parsed = JSON.parse(legacy);
        const legacyState = parsed?.state;
        const migrated = JSON.stringify({
          state: {
            hasData: Boolean(legacyState?.parsed),
            lastUploadDate: typeof legacyState?.lastUploadDate === 'string' ? legacyState.lastUploadDate : null,
          },
          version: 1,
        });
        window.localStorage.setItem(name, migrated);
        return migrated;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => window.localStorage.setItem(name, value),
    removeItem: (name) => window.localStorage.removeItem(name),
  };
}

export const useGraduationMetadataStore = create<GraduationMetadataState>()(
  persist(
    (set) => ({
      hasData: false,
      lastUploadDate: null,
      markUploaded: (uploadedAt) => set({ hasData: true, lastUploadDate: uploadedAt }),
      clear: () => set({ hasData: false, lastUploadDate: null }),
    }),
    {
      name: GRADUATION_METADATA_STATE_KEY,
      version: 1,
      storage: createJSONStorage(metadataStorage),
      partialize: ({ hasData, lastUploadDate }) => ({ hasData, lastUploadDate }),
    },
  ),
);
