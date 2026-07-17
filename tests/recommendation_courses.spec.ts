import { createCourseCatalogRecommendationIndex } from '../features/course-catalog/recommendations';
import { COURSE_CATALOG_SNAPSHOT } from '../features/course-catalog/generated';

describe('catalog-backed major recommendation course data', () => {
  const recommendationIndex = createCourseCatalogRecommendationIndex(COURSE_CATALOG_SNAPSHOT);

  it('returns major-specific recommendations when data exists', () => {
    expect(recommendationIndex.getMajorRecommendationCourses('EC').map((course) => course.courseCode)).toContain(
      'EC2202',
    );
    expect(recommendationIndex.getMajorRecommendationCourses('AI').map((course) => course.courseCode)).toContain(
      'AI2050',
    );
  });

  it('does not fall back to EC recommendations for majors without recommendation data', () => {
    expect(recommendationIndex.getMajorRecommendationCourses('FE')).toEqual([]);
    expect(recommendationIndex.getMajorRecommendationCourses('SE')).toEqual([]);
    expect(recommendationIndex.getMajorRecommendationCourses('PS')).toEqual([]);
  });
});
