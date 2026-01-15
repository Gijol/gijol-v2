import { GradStatusResponseType, FineGrainedRequirement } from '../../domain/types';
import { RecommendationItem } from '../../data';

// Defined locally or imported if shared
export interface GradStatusResponseV2 extends GradStatusResponseType {
  fineGrainedRequirements: FineGrainedRequirement[];
}

// UI-Specific ViewModel
export interface UIGradViewModel extends GradStatusResponseType {
  recommendations: RecommendationItem[];
  displayMessage: string;
  fineGrainedRequirements: FineGrainedRequirement[];
}

/**
 * Refines the strict engine output into a UI-friendly format.
 */
export const refineGradStatusForUI = (
  result: GradStatusResponseType,
  extra?: { recommendations?: RecommendationItem[] },
): UIGradViewModel => {
  const { totalCredits, totalSatisfied } = result;

  // Check if result has fineGrainedRequirements (runtime check or type assertion)
  const fineGrainedRequirements = (result as any).fineGrainedRequirements || [];

  return {
    ...result,
    recommendations: extra?.recommendations || [],
    fineGrainedRequirements,
    displayMessage: totalSatisfied
      ? `Conditions met! (${totalCredits} Credits)`
      : `Conditions not met. (${totalCredits} Credits)`,
  };
};
