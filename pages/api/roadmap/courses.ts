import type { NextApiRequest, NextApiResponse } from 'next';
import type { RoadmapCourseCandidatePage } from '@/features/course-catalog/roadmap';
import { getServerRoadmapCatalog } from '@/features/course-catalog/server-catalog-query';

type ErrorResponse = { error: string };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function integer(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<RoadmapCourseCandidatePage | ErrorResponse>) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json(
    getServerRoadmapCatalog().searchCandidates({
      query: first(req.query.q) ?? '',
      page: integer(first(req.query.page)),
      pageSize: integer(first(req.query.pageSize)),
    }),
  );
}
