// pages/api/roadmap/presets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export interface PresetInfo {
  slug: string;
  name: string;
  major: string;
  track?: string;
}

type ErrorResponse = {
  error: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<PresetInfo[] | ErrorResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const presetsDir = path.join(process.cwd(), 'DB', 'roadmap', 'presets');

  try {
    const files = await fs.readdir(presetsDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const presets: PresetInfo[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const slug = file.replace('.json', '');
        const filePath = path.join(presetsDir, file);

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);

          return {
            slug,
            name: slug.replace(/_/g, ' '),
            major: data.meta?.major || '',
            track: data.meta?.track,
          };
        } catch {
          return {
            slug,
            name: slug.replace(/_/g, ' '),
            major: '',
          };
        }
      }),
    );

    // Sort by major then by track
    presets.sort((a, b) => {
      if (a.major !== b.major) return a.major.localeCompare(b.major);
      return (a.track || '').localeCompare(b.track || '');
    });

    return res.status(200).json(presets);
  } catch (error) {
    console.error('Error reading presets:', error);
    return res.status(500).json({ error: 'Failed to read presets' });
  }
}
