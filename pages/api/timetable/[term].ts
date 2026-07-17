import type { NextApiRequest, NextApiResponse } from 'next';
import { getTimetableSourceByTerm } from '@/features/course-catalog/timetable-sources';
import { getServerTimetableSectionCatalog } from '@/features/timetable/server-section-catalog';
import type { SectionBrowsingPage, SectionProgramLevel } from '@/features/timetable/section-browsing';

type TimetableTermResponse = SectionBrowsingPage & {
  term: string;
  label: string;
  count: number;
};

type ErrorResponse = { error: string };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function integer(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function programLevel(value: string | undefined): SectionProgramLevel {
  if (value === 'all') return 'all';
  return value === 'graduate' ? 'graduate' : 'undergraduate';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TimetableTermResponse | ErrorResponse>,
) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const term = first(req.query.term);
  if (!term) return res.status(400).json({ error: 'Missing term' });

  const source = getTimetableSourceByTerm(term);
  if (!source) return res.status(404).json({ error: 'Unknown term' });

  try {
    const page = await getServerTimetableSectionCatalog().browse(term, {
      query: first(req.query.q) ?? '',
      department: first(req.query.department),
      programLevel: programLevel(first(req.query.level)),
      courseCodes: list(req.query.courseCode),
      page: integer(first(req.query.page)),
      pageSize: integer(first(req.query.pageSize)),
    });
    if (!page) return res.status(404).json({ error: 'Unknown term' });

    return res.status(200).json({ ...page, term, label: source.label, count: source.count });
  } catch (error) {
    console.error(`Failed to browse timetable data for ${term}`, error);
    return res.status(500).json({ error: 'Failed to load timetable data' });
  }
}
