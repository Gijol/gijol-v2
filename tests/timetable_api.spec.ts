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
  it('loads deployment data independently of the process working directory', async () => {
    const cwd = jest.spyOn(process, 'cwd').mockReturnValue('/tmp/not-the-project');
    try {
      const res = createMockResponse();
      await timetableTermHandler(
        { method: 'GET', query: { term: '2025-2', q: '물리' } } as unknown as NextApiRequest,
        res,
      );
      expect(res.statusCode).toBe(200);
    } finally {
      cwd.mockRestore();
    }
  });
  it.each([
    ['2026-1', 434, 434],
    ['2026-2', 607, 431],
  ])('serves the published %s timetable data', async (term, count, undergraduateSectionCount) => {
    const req = {
      method: 'GET',
      query: { term },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await timetableTermHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        term,
        count,
        undergraduateSectionCount,
      }),
    );
  });

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
        totalElements: expect.any(Number),
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
    const body = res.body as { content: Array<{ program: string }> };
    body.content.forEach((section) => {
      expect(section.program).toBe('학사');
    });
  });

  it('returns graduate sections when the graduate level is selected', async () => {
    const req = {
      method: 'GET',
      query: { term: '2026-2', level: 'graduate', page: '1' },
    } as unknown as NextApiRequest;
    const res = createMockResponse();

    await timetableTermHandler(req, res);

    expect(res.statusCode).toBe(200);
    const body = res.body as {
      totalElements: number;
      undergraduateSectionCount: number;
      graduateSectionCount: number;
      content: Array<{ program: string }>;
    };
    expect(body.totalElements).toBe(176);
    expect(body.undergraduateSectionCount).toBe(431);
    expect(body.graduateSectionCount).toBe(176);
    body.content.forEach((section) => {
      expect(section.program).toMatch(/대학원|석사|박사|석박/);
    });
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
