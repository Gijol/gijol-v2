import type { CourseDB } from '@/lib/const/course-db';
import { normalizeCourseCode, uniqueStrings } from './normalize';
import type { CourseCatalogSearchItem } from './search';

function buildLegacyRowLookup(rows: readonly CourseDB[]): Map<string, CourseDB> {
  const lookup = new Map<string, CourseDB>();

  rows.forEach((row) => {
    [row.courseUid, row.primaryCourseCode, ...row.aliasCodes].forEach((code) => {
      const normalized = normalizeCourseCode(code);
      if (normalized && !lookup.has(normalized)) lookup.set(normalized, row);
    });
  });

  return lookup;
}

function findLegacyRow(item: CourseCatalogSearchItem, lookup: Map<string, CourseDB>): CourseDB | undefined {
  return (
    lookup.get(normalizeCourseCode(item.courseId)) ??
    lookup.get(normalizeCourseCode(item.primaryCourseCode)) ??
    item.aliasCodes.map((code) => lookup.get(normalizeCourseCode(code))).find(Boolean)
  );
}

export function courseCatalogItemToLegacyCourseDb(item: CourseCatalogSearchItem, legacyRow?: CourseDB): CourseDB {
  const aliasCodes = uniqueStrings([item.primaryCourseCode, ...item.aliasCodes, ...(legacyRow?.aliasCodes ?? [])]);

  return {
    courseUid: item.courseId,
    displayTitleKo: item.displayTitleKo || legacyRow?.displayTitleKo || item.primaryCourseCode,
    displayTitleEn: item.displayTitleEn || legacyRow?.displayTitleEn || '',
    primaryCourseCode: item.primaryCourseCode,
    aliasCodes,
    participatingDepartments:
      item.departments.length > 0 ? [...item.departments] : [...(legacyRow?.participatingDepartments ?? [])],
    tags: uniqueStrings([...item.tags, ...(legacyRow?.tags ?? [])]),
    creditHours: item.creditHours,
    lectureHours: item.lectureHours,
    labHours: item.labHours,
    departmentContext: item.departments[0] ?? legacyRow?.departmentContext ?? '',
    offered2025_1: legacyRow?.offered2025_1 ?? false,
    offered2025_2: legacyRow?.offered2025_2 ?? false,
    description: item.description || legacyRow?.description || '',
  };
}

export function createLegacyCourseDbItemsFromCatalog(
  items: readonly CourseCatalogSearchItem[],
  legacyRows: readonly CourseDB[] = [],
): CourseDB[] {
  const lookup = buildLegacyRowLookup(legacyRows);
  return items.map((item) => courseCatalogItemToLegacyCourseDb(item, findLegacyRow(item, lookup)));
}
