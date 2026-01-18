// pages/api/roadmap/[slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import type { RoadmapData } from '@/types/roadmap';

type ErrorResponse = {
  error: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<RoadmapData | ErrorResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug parameter' });
  }

  // Sanitize slug to prevent directory traversal
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '');

  const filePath = path.join(process.cwd(), 'DB', 'roadmap', 'presets', `${sanitizedSlug}.json`);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const roadmapData: RoadmapData = JSON.parse(fileContent);

    return res.status(200).json(roadmapData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return res.status(404).json({ error: `Roadmap preset '${sanitizedSlug}' not found` });
    }

    console.error('Error reading roadmap file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
