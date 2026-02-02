import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parseCoursesFromCSV, CourseDB, filterCourses } from '@const/course-db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const csvPath = path.join(process.cwd(), 'DB', 'course_db.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const courses = parseCoursesFromCSV(csvContent);

    const { query } = req.query;

    if (query && typeof query === 'string') {
      const filtered = filterCourses(courses, query);
      res.status(200).json(filtered);
    } else {
      res.status(200).json(courses);
    }
  } catch (error) {
    console.error('Failed to load courses:', error);
    res.status(500).json({ error: 'Failed to load courses' });
  }
}
