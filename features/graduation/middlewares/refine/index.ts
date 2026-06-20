import {
  GradStatusResponseType,
  FineGrainedRequirement,
  GraduationCatalogSelectionSummary,
} from '../../domain/types';
import {
  RecommendationDisplayPolicy,
  RecommendationItem,
  RecommendationSuppression,
} from '../../data';

// Defined locally or imported if shared
export interface GradStatusResponseV2 extends GradStatusResponseType {
  fineGrainedRequirements: FineGrainedRequirement[];
  catalogSelection?: GraduationCatalogSelectionSummary;
}

// UI-Specific ViewModel
export interface UIGradViewModel extends GradStatusResponseType {
  recommendations: RecommendationItem[];
  allRecommendations: RecommendationItem[];
  recommendationSuppressions: RecommendationSuppression[];
  recommendationPolicy?: Required<RecommendationDisplayPolicy>;
  displayMessage: string;
  fineGrainedRequirements: FineGrainedRequirement[];
  catalogSelection?: GraduationCatalogSelectionSummary;
}

/**
 * Refines the strict engine output into a UI-friendly format.
 */
export const refineGradStatusForUI = (
  result: GradStatusResponseType,
  extra?: {
    recommendations?: RecommendationItem[];
    allRecommendations?: RecommendationItem[];
    recommendationSuppressions?: RecommendationSuppression[];
    recommendationPolicy?: Required<RecommendationDisplayPolicy>;
  },
): UIGradViewModel => {
  const { totalCredits, totalSatisfied } = result;
  const overallStatus = result.overallStatus ?? (totalSatisfied ? 'satisfied' : 'unsatisfied');

  // Check if result has fineGrainedRequirements (runtime check or type assertion)
  const fineGrainedRequirements = (result as any).fineGrainedRequirements || [];
  const catalogSelection = (result as any).catalogSelection;

  return {
    ...result,
    recommendations: extra?.recommendations || [],
    allRecommendations: extra?.allRecommendations || extra?.recommendations || [],
    recommendationSuppressions: extra?.recommendationSuppressions || [],
    recommendationPolicy: extra?.recommendationPolicy,
    fineGrainedRequirements,
    catalogSelection,
    displayMessage:
      overallStatus === 'satisfied'
        ? `Conditions met! (${totalCredits} Credits)`
        : overallStatus === 'needs_review'
          ? `Review needed before final decision. (${totalCredits} Credits)`
          : `Conditions not met. (${totalCredits} Credits)`,
  };
};
