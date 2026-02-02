import type { NextApiRequest, NextApiResponse } from 'next';
import type { GradStatusResponseType, TakenCourseType } from '@lib/types/grad';
import { initialValue } from '@const/grad-status-constants';
import { uploadAndEvaluate } from 'features/graduation/usecases/uploadAndEvaluate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: return example/default grad status (useful for development/testing)
  if (req.method === 'GET') {
    try {
      return res.status(200).json(initialValue as GradStatusResponseType);
    } catch (err: any) {
      console.error('grad-status GET error', err);
      return res.status(500).json({ error: err?.message || String(err) });
    }
  }

  // Only allow POST besides GET
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    // We can pass the body directly to uploadAndEvaluate, or do a minimal extraction here if needed.
    // However, uploadAndEvaluate already handles various parsed shapes (UserTakenCourseListType, arrays, etc.)
    // via its internal call to `parseRawToTakenCourses`.
    // We just need to extract the metadata options explicitly if they are at the top level.

    const entryYear = typeof body.entryYear === 'number' ? body.entryYear : undefined;
    const userMajor = typeof body.userMajor === 'string' ? body.userMajor : undefined;
    const userMinors = Array.isArray(body.userMinors) ? (body.userMinors as string[]) : undefined;

    const result = await uploadAndEvaluate(body, {
      entryYear,
      userMajor,
      userMinors,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.errors?.join(', ') || 'Validation failed' });
    }

    // result.data is UIGradViewModel which extends GradStatusResponseType
    // so it's safe to return directly.
    return res.status(200).json(result.data!);
  } catch (err: any) {
    console.error('grad-status POST error', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
