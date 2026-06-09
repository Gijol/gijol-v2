import { getMajorRecommendationCoursesByCode } from '../lib/const/course-master';

describe('major recommendation course data', () => {
  it('returns major-specific recommendations when data exists', () => {
    expect(getMajorRecommendationCoursesByCode('EC').map((course) => course.courseCode)).toContain('EC2202');
    expect(getMajorRecommendationCoursesByCode('AI').map((course) => course.courseCode)).toContain('AI2050');
  });

  it('does not fall back to EC recommendations for majors without recommendation data', () => {
    expect(getMajorRecommendationCoursesByCode('FE')).toEqual([]);
    expect(getMajorRecommendationCoursesByCode('SE')).toEqual([]);
    expect(getMajorRecommendationCoursesByCode('PS')).toEqual([]);
  });
});
