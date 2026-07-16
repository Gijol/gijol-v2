import type { NextApiRequest, NextApiResponse } from 'next';

import timetableTermHandler from '../pages/api/timetable/[term]';

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

describe('timetable term API', () => {
  it('serves normalized registration timetable sections by term', async () => {
    const req = {
      method: 'GET',
      query: { term: '2024-2' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await timetableTermHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        term: '2024-2',
        label: '2024 2학기',
        count: 388,
        page: 1,
        pageSize: 30,
        totalElements: 388,
        content: expect.arrayContaining([
          expect.objectContaining({
            course_code: expect.any(String),
            section: expect.any(String),
            title: expect.any(String),
          }),
        ]),
      }),
    );
    expect(Buffer.byteLength(JSON.stringify(res.body), 'utf8')).toBeLessThan(64 * 1024);
  });

  it('searches and pages term sections on the server', async () => {
    const req = {
      method: 'GET',
      query: { term: '2024-2', q: '물리', page: '1', pageSize: '5' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await timetableTermHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        page: 1,
        pageSize: 5,
        departments: expect.any(Array),
        content: expect.any(Array),
      }),
    );
    const body = res.body as { content: Array<{ title: string; course_code: string }> };
    expect(body.content.length).toBeLessThanOrEqual(5);
    body.content.forEach((section) => {
      expect(`${section.title} ${section.course_code}`).toMatch(/물리/i);
    });
  });

  it('rejects terms that are not in the generated timetable manifest', async () => {
    const req = {
      method: 'GET',
      query: { term: '1999-1' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await timetableTermHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Unknown term' });
  });
});
