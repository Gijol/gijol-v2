import type { NextApiRequest, NextApiResponse } from 'next';

import roadmapHandler from '../pages/api/roadmap/[slug]';
import type { RoadmapData } from '../lib/types/roadmap';

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

describe('roadmap catalog enrichment', () => {
  it('serves preset nodes enriched with catalog course details', async () => {
    const req = {
      method: 'GET',
      query: { slug: 'EECS_AI' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await roadmapHandler(req, res);

    const body = res.body as RoadmapData;
    const automata = body.nodes.find((node) => node.data.courseCode === 'AI3001');

    expect(res.statusCode).toBe(200);
    expect(body.meta.catalog?.enrichedNodeCount).toBeGreaterThan(0);
    expect(automata?.data).toEqual(
      expect.objectContaining({
        label: '오토마타 이론',
        credits: 3,
        catalog: expect.objectContaining({
          courseId: 'AUTOMATA_THEORY',
          primaryCourseCode: 'AI3001',
          aliasCodes: expect.arrayContaining(['AI3001', 'EC3216', 'MM3450']),
          manualListings: expect.arrayContaining([
            expect.objectContaining({ academicYear: 2026, courseCode: 'AI3001', page: 88 }),
          ]),
          offerings: expect.arrayContaining([
            expect.objectContaining({
              term: '2026-1',
              equivalentCourseCodes: ['AI3001', 'EC3216', 'MM3450'],
            }),
          ]),
          offeringGroups: expect.arrayContaining([
            expect.objectContaining({
              term: '2026-1',
              section: '01',
              courseCodes: ['AI3001', 'EC3216', 'MM3450'],
              meetingBadges: expect.arrayContaining([
                expect.objectContaining({ label: '월 13:00' }),
                expect.objectContaining({ label: '수 13:00' }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });

  it('does not enrich roadmap-only pseudo course codes', async () => {
    const req = {
      method: 'GET',
      query: { slug: 'BASIC_HEART' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await roadmapHandler(req, res);

    const body = res.body as RoadmapData;
    const planned = body.nodes.find((node) => node.data.courseCode === '편성예정');

    expect(res.statusCode).toBe(200);
    expect(body.meta.catalog?.unresolvedCourseCodes).toEqual(expect.arrayContaining(['편성예정']));
    expect(planned?.data).toEqual(
      expect.objectContaining({
        label: '인간의 본성: 인간학입문',
        category: '편성예정',
      }),
    );
    expect(planned?.data.catalog).toBeUndefined();
  });

  it('resolves combined math minor codes to catalog-backed courses', async () => {
    const req = {
      method: 'GET',
      query: { slug: 'MATH_MINOR' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await roadmapHandler(req, res);

    const body = res.body as RoadmapData;
    const multivariable = body.nodes.find((node) => node.data.courseCode === 'GS(MM)2001');

    expect(res.statusCode).toBe(200);
    expect(body.meta.catalog?.unresolvedCourseCodes).not.toEqual(expect.arrayContaining(['GS(MM)2001']));
    expect(multivariable?.data.catalog).toEqual(
      expect.objectContaining({
        primaryCourseCode: 'GS2001',
        displayTitleKo: '다변수해석학과 응용',
        aliasCodes: expect.arrayContaining(['GS2001', 'MM2001']),
        offeringGroups: expect.arrayContaining([
          expect.objectContaining({
            term: '2026-1',
            courseCodes: expect.arrayContaining(['GS2001', 'MM2001']),
          }),
        ]),
      }),
    );
  });
});
