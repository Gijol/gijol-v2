import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createCourseCatalogSearchItems,
  filterCourseCatalogSearchItems,
  type CourseCatalogSearchItem,
} from '@features/course-catalog/search';

type CourseSearchApiItem = CourseCatalogSearchItem & {
  id: number;
  courseCode: string;
  courseCredit: number;
  courseName: string;
  courseTags: readonly string[];
  prerequisite: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    q = '',
    courseSearchString = '',
    courseSearchCode = 'NONE',
    limit = '20',
  } = req.query;
  const qStr = Array.isArray(q) ? q[0] : q;
  const courseSearchStringStr = Array.isArray(courseSearchString) ? courseSearchString[0] : courseSearchString;
  const courseSearchCodeStr = Array.isArray(courseSearchCode) ? courseSearchCode[0] : courseSearchCode;
  const query = qStr || courseSearchStringStr;
  const limitNum = parseInt(Array.isArray(limit) ? limit[0] : limit, 10) || 20;

  const items = createCourseCatalogSearchItems();
  const filtered = filterCourseCatalogSearchItems(items, {
    query,
  }).filter((course) =>
    courseSearchCodeStr === 'NONE'
      ? true
      : course.primaryCourseCode.startsWith(courseSearchCodeStr) ||
        course.aliasCodes.some((code) => code.startsWith(courseSearchCodeStr)),
  );

  const normalized: CourseSearchApiItem[] = filtered.map((item, idx) => ({
    ...item,
    id: idx + 1,
    courseCode: item.primaryCourseCode,
    courseCredit: item.creditHours,
    courseName: item.displayTitleKo,
    courseTags: item.tags,
    prerequisite: '',
  }));
  const resultLimit = Math.min(Math.max(limitNum, 1), 2000);
  const result = normalized.slice(0, resultLimit);

  res.status(200).json({
    content: result,
    empty: result.length === 0,
    first: true,
    last: result.length >= filtered.length,
    number: 0,
    numberOfElements: result.length,
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: resultLimit,
      paged: true,
      sort: { empty: true, sorted: false, unsorted: true },
      unpaged: false,
    },
    size: resultLimit,
    sort: { empty: true, sorted: false, unsorted: true },
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / resultLimit),
  });
}
