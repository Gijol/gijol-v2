import { atom } from 'recoil';
import { GradStatusType } from '../types/grad';
import { recoilPersist } from 'recoil-persist';

const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : undefined;
const isServer = typeof window !== 'undefined';

const { persistAtom } = recoilPersist({
  key: 'grad-status',
  storage: sessionStorage,
});

export const gradStatus = atom<GradStatusType | null>({
  key: 'grad-status',
  default: null,
  effects_UNSTABLE: [persistAtom],
});
