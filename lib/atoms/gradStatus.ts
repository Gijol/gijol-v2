import { atom, selector } from 'recoil';
import { GradStatusType } from '../types/grad';
import { recoilPersist } from 'recoil-persist';
import { initialValue } from '../const/grad';

const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : undefined;

const { persistAtom } = recoilPersist({
  key: 'gradStatus',
  storage: sessionStorage,
});

export const gradStatus = atom<GradStatusType>({
  key: 'gradStatus',
  default: initialValue,
  effects_UNSTABLE: [persistAtom],
});

export const overallScoreStatus = atom<unknown | null>({
  key: 'gradStatusFile',
  default: null,
});
