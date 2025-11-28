import type { NextApiRequest, NextApiResponse } from 'next';
import { fakeMajorData } from '@const/course';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q = '', limit = '20' } = req.query;
  const qStr = Array.isArray(q) ? q[0] : q;
  const limitNum = parseInt(Array.isArray(limit) ? limit[0] : limit, 10) || 20;

  const normalized = fakeMajorData.map((item, idx) => ({
    id: idx + 1,
    courseCode: item.courseCode,
    courseCredit: 3,
    courseName: item.courseCode,
    courseTags: [],
    prerequisite: '',
    description: item.courseDescription || '',
  }));

  const filtered = qStr
    ? normalized.filter((c) =>
        (c.courseCode + ' ' + c.description).toLowerCase().includes(qStr.toLowerCase())
      )
    : normalized;

  const result = filtered.slice(0, Math.min(limitNum, 20));

  res.status(200).json({ content: result, totalElements: result.length });
}
