import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerCourseDiscovery } from '@features/course-catalog/server-catalog-query';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const courseId = Array.isArray(req.query.courseId) ? req.query.courseId[0] : req.query.courseId;
  if (!courseId) return res.status(400).json({ error: 'courseId is required' });

  const detail = getServerCourseDiscovery().getDetail(courseId);
  if (!detail) return res.status(404).json({ error: 'Course not found' });

  return res.status(200).json(detail);
}
