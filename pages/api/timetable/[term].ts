import fs from 'fs/promises';
import path from 'path';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getTimetableSourceByTerm } from '@/features/course-catalog/timetable-sources';
import type { SectionOffering } from '@/lib/types/timetable';

type TimetableTermResponse = {
  term: string;
  label: string;
  count: number;
  sections: SectionOffering[];
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TimetableTermResponse | ErrorResponse>,
) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const term = Array.isArray(req.query.term) ? req.query.term[0] : req.query.term;
  if (!term) {
    res.status(400).json({ error: 'Missing term' });
    return;
  }

  const source = getTimetableSourceByTerm(term);
  if (!source) {
    res.status(404).json({ error: 'Unknown term' });
    return;
  }

  try {
    const fileContent = await fs.readFile(path.join(process.cwd(), source.path), 'utf-8');
    const data = JSON.parse(fileContent) as { items?: SectionOffering[] };
    const sections = Array.isArray(data.items) ? data.items : [];

    res.status(200).json({
      term: source.term,
      label: source.label,
      count: sections.length,
      sections,
    });
  } catch (error) {
    console.error(`Failed to load timetable data for ${term}`, error);
    res.status(500).json({ error: 'Failed to load timetable data' });
  }
}
