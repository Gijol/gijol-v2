import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { parseGradeBuffer } from '../../../lib/api/parse-grad';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({
    multiples: false,
    keepExtensions: true,
  });

  try {
    await new Promise<void>((resolve, reject) => {
      form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
          reject(err);
          return;
        }

        const uploaded = files?.file || files?.File || files?.upload || null;
        if (!uploaded) {
          res.status(400).json({ error: 'No file provided' });
          resolve();
          return;
        }

        const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

        try {
          const fs = require('fs');
          // formidable v2 uses 'filepath', older versions use 'path'
          const filePath = file.filepath || file.path;
          if (!filePath) {
            throw new Error('Uploaded file path not found');
          }
          const buffer: Buffer = fs.readFileSync(filePath);
          const parsed = await parseGradeBuffer(buffer);
          res.status(200).json(parsed);
          resolve();
        } catch (e: any) {
          console.error('parse error', e);
          res.status(422).json({ error: 'Parsing failed', details: e?.message || String(e) });
          resolve();
        }
      });
    });
  } catch (e: any) {
    console.error('upload error', e);
    return res.status(500).json({ error: 'Upload failed', details: e?.message || String(e) });
  }
}
