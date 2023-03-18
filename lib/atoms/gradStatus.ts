import { atom } from 'recoil';
import { GradStatusType } from '../types/grad';

export const gradStatus = atom<GradStatusType | null>({
  key: 'gradStatus',
  default: null,
});
