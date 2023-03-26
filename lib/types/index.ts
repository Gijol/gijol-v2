import { GradStatusType } from './grad';

export interface LoginProps {
  id: string;
  password: string;
}

export interface TempGradResultType {
  gradResultResponse: GradStatusType;
  overallScoreStatus: unknown;
}
