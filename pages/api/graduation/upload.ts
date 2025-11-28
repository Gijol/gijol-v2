import type { NextApiRequest, NextApiResponse } from 'next';
import { parseGradeBuffer } from '../../../lib/api/parse-grad';

// Use require to avoid ESM/CJS interop issues in Next.js runtime.
const formidableImport: any = require('formidable');
const createForm: any = formidableImport?.default ?? formidableImport;
const os = require('os');

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

  // Create form with safe defaults for serverless environments
  const form = createForm({
    multiples: false,
    keepExtensions: true,
    uploadDir: os.tmpdir(),
    maxFileSize: 10 * 1024 * 1024, // 10 MB
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
            // respond with a friendly error instead of throwing
            res.status(422).json({ error: 'Uploaded file path not found' });
            resolve();
            return;
          }

          const buffer: Buffer = fs.readFileSync(filePath);

          // 🔹 엑셀 파싱 + 구조 검증
          const parsed = await parseGradeBuffer(buffer);

          res.status(200).json(parsed);
          resolve();
        } catch (e: any) {
          console.error('parse error', e);

          const code = e?.code || 'PARSING_FAILED';

          if (code === 'INVALID_GRADE_REPORT') {
            res.status(422).json({
              error: 'INVALID_GRADE_REPORT',
              message: 'Uploaded file is not a valid ZEUS Report card(KOR) grade report.',
            });
          } else if (code === 'PARSE_TIMEOUT') {
            res.status(422).json({
              error: 'PARSE_TIMEOUT',
              message: 'Parsing grade report took too long.',
            });
          } else {
            res.status(422).json({
              error: 'PARSING_FAILED',
              message: e?.message || 'Parsing failed',
            });
          }
          resolve();
        }
      });

      // optional: handle form-level errors
      form.on('error', (formErr: any) => {
        console.error('form error', formErr);
        reject(formErr);
      });
    });
  } catch (e: any) {
    console.error('upload error', e);
    return res.status(500).json({
      error: 'UPLOAD_FAILED',
      message: 'Upload failed',
      details: e?.message || String(e),
    });
  }
}
