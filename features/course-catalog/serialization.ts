import type { CourseCatalogSnapshot } from './types';

export function stringifyCourseCatalogSnapshot(snapshot: CourseCatalogSnapshot, space = 2): string {
  return JSON.stringify(snapshot, null, space);
}
