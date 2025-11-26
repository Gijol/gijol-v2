// pages/api/grad-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GradStatusRequestBody, GradStatusResponseType } from '@lib/types/grad';
import { calculateGradStatus } from '@utils/graduation/calculate-grad-status';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GradStatusResponseType | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body as GradStatusRequestBody;

    if (!body || !Array.isArray(body.takenCourses) || !body.entryYear) {
      return res.status(400).json({ error: 'entryYear와 takenCourses가 필요합니다.' });
    }

    const status = calculateGradStatus(body);
    return res.status(200).json(status);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '졸업요건 계산 중 오류가 발생했습니다.' });
  }
}
