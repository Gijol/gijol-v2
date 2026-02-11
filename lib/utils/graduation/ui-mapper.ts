import type { GraduationApiResponseType, GraduationUiViewModel } from '@lib/types/grad';

export function buildGraduationDisplayMessage(status: GraduationApiResponseType): string {
  const { totalSatisfied, totalCredits } = status;
  return totalSatisfied
    ? `졸업요건을 충족했습니다. (${totalCredits}학점)`
    : `졸업요건을 아직 충족하지 못했습니다. (${totalCredits}학점)`;
}

export function toGraduationUiViewModel(status: GraduationApiResponseType): GraduationUiViewModel {
  return {
    ...status,
    displayMessage: buildGraduationDisplayMessage(status),
  };
}
