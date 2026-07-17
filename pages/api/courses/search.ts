import type { NextApiRequest, NextApiResponse } from 'next';
import type { CourseDiscoveryQuery } from '@features/course-catalog/discovery';
import { getServerCourseDiscovery } from '@features/course-catalog/server-catalog-query';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

function integer(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function boolean(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

function parseQuery(req: NextApiRequest): CourseDiscoveryQuery {
  const level = first(req.query.level);
  const credit = first(req.query.credit);

  return {
    query: first(req.query.q) ?? first(req.query.courseSearchString) ?? '',
    courseCodes: list(req.query.courseCode),
    category: first(req.query.category) as CourseDiscoveryQuery['category'],
    departments: list(req.query.department),
    terms: list(req.query.term),
    level: level === 'other' ? 'other' : level ? integer(level) : 'all',
    credit: credit === '4+' ? '4+' : credit ? integer(credit) : 'all',
    labOnly: boolean(first(req.query.labOnly)),
    moocOnly: boolean(first(req.query.moocOnly)),
    feature: first(req.query.feature) as CourseDiscoveryQuery['feature'],
    sourceKind: first(req.query.sourceKind) as CourseDiscoveryQuery['sourceKind'],
    program: first(req.query.program) as CourseDiscoveryQuery['program'],
    page: integer(first(req.query.page)),
    pageSize: integer(first(req.query.pageSize) ?? first(req.query.limit)),
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json(getServerCourseDiscovery().search(parseQuery(req)));
}
