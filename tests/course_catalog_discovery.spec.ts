import { createCourseDiscovery } from '../features/course-catalog/discovery';
import { COURSE_CATALOG_SNAPSHOT } from '../features/course-catalog/generated';
import { createCourseCatalogSearchItems } from '../features/course-catalog/search';

describe('course discovery', () => {
  const discovery = createCourseDiscovery(createCourseCatalogSearchItems(COURSE_CATALOG_SNAPSHOT));

  it('returns stable, non-overlapping pages', () => {
    const first = discovery.search({ page: 1, pageSize: 24 });
    const second = discovery.search({ page: 2, pageSize: 24 });
    const firstIds = first.content.map((course) => course.courseId);
    const secondIds = second.content.map((course) => course.courseId);

    expect(first.content).toHaveLength(24);
    expect(second.content).toHaveLength(24);
    expect(secondIds.some((courseId) => firstIds.includes(courseId))).toBe(false);
    expect(firstIds).toEqual(
      [...firstIds].sort((a, b) => {
        const firstCourse = first.content.find((course) => course.courseId === a)!;
        const secondCourse = first.content.find((course) => course.courseId === b)!;
        return firstCourse.primaryCourseCode.localeCompare(secondCourse.primaryCourseCode) || a.localeCompare(b);
      }),
    );
  });

  it('keeps list responses below the serialized byte budget and excludes detail history', () => {
    const page = discovery.search({ page: 1, pageSize: 24 });
    const bytes = Buffer.byteLength(JSON.stringify(page), 'utf8');

    expect(bytes).toBeLessThan(64 * 1024);
    page.content.forEach((course) => {
      expect(course).not.toHaveProperty('description');
      expect(course).not.toHaveProperty('offerings');
      expect(course).not.toHaveProperty('offeringGroups');
      expect(course).not.toHaveProperty('manualListings');
      expect(course).not.toHaveProperty('facets');
      expect(course).not.toHaveProperty('matchText');
      expect(course).not.toHaveProperty('sourceRefs');
    });
  });

  it('owns program filtering and returns detail only on demand', () => {
    const graduate = discovery.search({ query: 'AI5003', program: 'graduate' });
    const undergraduate = discovery.search({ query: 'AI5003', program: 'undergraduate' });
    const listItem = graduate.content[0];
    const detail = discovery.getDetail(listItem.courseId);

    expect(graduate.totalElements).toBeGreaterThan(0);
    expect(undergraduate.totalElements).toBe(0);
    expect(listItem.offeringPrograms).toContain('graduate');
    expect(detail).toEqual(
      expect.objectContaining({
        courseId: listItem.courseId,
        offeringGroups: expect.arrayContaining([expect.objectContaining({ program: 'graduate' })]),
      }),
    );
  });

  it('filters an exact personalized recommendation code set including aliases', () => {
    const page = discovery.search({ courseCodes: ['EC3216', 'HS4611'], pageSize: 100 });
    const codes = page.content.map((course) => course.primaryCourseCode);

    expect(codes).toEqual(expect.arrayContaining(['AI3001', 'HS4611']));
    expect(page.totalElements).toBe(2);
  });
});
