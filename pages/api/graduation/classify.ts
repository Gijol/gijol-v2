import type { NextApiRequest, NextApiResponse } from 'next';
import { calculateGradStatus } from '@utils/graduation/calculate-grad-status';
import type {
  GradStatusRequestBody,
  GradStatusResponseType,
  TakenCourseType,
} from '@lib/types/grad';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GradStatusResponseType | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
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
      return res.status(400).json({ error: 'Invalid payload: takenCourses missing' });
    }

    const requestBody: GradStatusRequestBody = {
      entryYear: typeof body.entryYear === 'number' ? body.entryYear : 2020,
      takenCourses,
      userMajor: typeof body.userMajor === 'string' ? body.userMajor : undefined,
      userMinors: Array.isArray(body.userMinors) ? (body.userMinors as string[]) : undefined,
    };

    const status = calculateGradStatus(requestBody);
    return res.status(200).json(status);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: '졸업요건 계산 중 오류가 발생했습니다.' });
  }
}
