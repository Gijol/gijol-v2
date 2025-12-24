import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  GradStatusRequestBody,
  GradStatusResponseType,
  TakenCourseType,
} from '@lib/types/grad';
import { initialValue } from '@const/grad-status-constants';
import { calculateGradStatusV2 } from '@utils/graduation/calculate-grad-status';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Extract takenCourses from several possible shapes
    let takenCourses: TakenCourseType[] = [];
    if (Array.isArray(body.takenCourses)) takenCourses = body.takenCourses as TakenCourseType[];
    else if (Array.isArray(body.courses)) takenCourses = body.courses as TakenCourseType[];
    else if (Array.isArray(body.userTakenCourseList))
      takenCourses = body.userTakenCourseList as TakenCourseType[];
    else if (
      body.userTakenCourseList?.takenCourses &&
      Array.isArray(body.userTakenCourseList.takenCourses)
    )
      takenCourses = body.userTakenCourseList.takenCourses as TakenCourseType[];

    if (!Array.isArray(takenCourses)) {
      return res.status(400).json({ error: 'Invalid payload: courses/takenCourses missing' });
    }

    const requestBody: GradStatusRequestBody = {
      entryYear: typeof body.entryYear === 'number' ? body.entryYear : 2020,
      takenCourses,
      userMajor: typeof body.userMajor === 'string' ? body.userMajor : undefined,
      userMinors: Array.isArray(body.userMinors) ? (body.userMinors as string[]) : undefined,
    };

    const status = calculateGradStatusV2(requestBody);
    return res.status(200).json(status as GradStatusResponseType);
  } catch (err: any) {
    console.error('grad-status POST error', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
