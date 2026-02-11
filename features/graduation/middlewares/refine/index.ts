import { GradStatusResponseType, FineGrainedRequirement } from '../../domain/types';
import { RecommendationItem } from '../../data';

export interface GraduationApiResponse extends GradStatusResponseType {
  fineGrainedRequirements: FineGrainedRequirement[];
  recommendations: RecommendationItem[];
}

/**
 * Composes API response from strict engine output.
 * UI-only presentation (display strings, badges, etc.) must be created on the client side.
 */
export const toGraduationApiResponse = (
  result: GradStatusResponseType,
  extra?: { recommendations?: RecommendationItem[] },
): GraduationApiResponse => {
  const fineGrainedRequirements = (result as { fineGrainedRequirements?: FineGrainedRequirement[] })
    .fineGrainedRequirements || [];

  return {
    ...result,
    recommendations: extra?.recommendations || [],
    fineGrainedRequirements,
  };
};
