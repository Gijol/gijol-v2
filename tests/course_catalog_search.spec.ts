import type { NextApiRequest, NextApiResponse } from 'next';

import coursesHandler from '../pages/api/courses';
import searchHandler from '../pages/api/courses/search';
import {
  createCourseCatalogSearchItems,
  filterCourseCatalogSearchItems,
} from '../features/course-catalog/search';

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as NextApiResponse & typeof response;
}

describe('course catalog search', () => {
  it('searches generated catalog data instead of mock course data', () => {
    const items = createCourseCatalogSearchItems();
    const hs4611 = filterCourseCatalogSearchItems(items, { query: 'HS4611' });
    const ai2003 = filterCourseCatalogSearchItems(items, { query: '인공지능을 위한 수학' });
    const recommendation = filterCourseCatalogSearchItems(items, { feature: 'recommendation', query: 'HS4611' });
    const timetable = filterCourseCatalogSearchItems(items, { sourceKind: 'timetable-offering', query: 'HS4611' });
    const mockOnlyCourse = filterCourseCatalogSearchItems(items, { query: 'CSE101' });

    expect(hs4611).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryCourseCode: 'HS4611',
          offerings: expect.arrayContaining([
            expect.objectContaining({ term: '2026-spring' }),
          ]),
        }),
      ]),
    );
    expect(ai2003).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryCourseCode: 'AI2003',
          sourceRefs: expect.arrayContaining([
            expect.objectContaining({ kind: 'course-db' }),
            expect.objectContaining({ kind: 'timetable-offering' }),
          ]),
        }),
      ]),
    );
    expect(recommendation).toHaveLength(1);
    expect(timetable).toHaveLength(1);
    expect(mockOnlyCourse).toEqual([]);
  });

  it('serves catalog-backed course search API with legacy-compatible fields', () => {
    const req = {
      query: { q: 'HS4611', limit: '5' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    searchHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        totalElements: expect.any(Number),
        content: expect.arrayContaining([
          expect.objectContaining({
            courseCode: 'HS4611',
            primaryCourseCode: 'HS4611',
            courseName: expect.any(String),
            creditHours: expect.any(Number),
            offerings: expect.arrayContaining([
              expect.objectContaining({ term: '2026-spring' }),
            ]),
          }),
        ]),
      }),
    );
  });

  it('serves /api/courses from the catalog while preserving roadmap-compatible fields', async () => {
    const req = {
      query: { query: 'HS4611' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await coursesHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          courseUid: 'COURSE:HS4611',
          primaryCourseCode: 'HS4611',
          displayTitleKo: '인생의 의미 찾기 : 동서양철학의 대답들',
          creditHours: 3,
          aliasCodes: expect.arrayContaining(['HS4611']),
          participatingDepartments: expect.arrayContaining(['인문사회과학부']),
        }),
      ]),
    );
  });
});
