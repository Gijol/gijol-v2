import type { CourseCatalogSourceRef } from './types';

export function normalizeCourseCode(code: string | undefined | null): string {
  return String(code ?? '').trim().toUpperCase();
}

export function sourceRefKey(sourceRef: CourseCatalogSourceRef): string {
  return [
    sourceRef.kind,
    sourceRef.sourceId,
    sourceRef.path ?? '',
    sourceRef.manualYear ?? '',
    sourceRef.page ?? '',
    sourceRef.note ?? '',
  ].join('|');
}

export function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort();
}

export function uniqueSourceRefs(sourceRefs: readonly CourseCatalogSourceRef[]): CourseCatalogSourceRef[] {
  const byKey = new Map<string, CourseCatalogSourceRef>();
  sourceRefs.forEach((sourceRef) => byKey.set(sourceRefKey(sourceRef), sourceRef));
  return Array.from(byKey.values()).sort((a, b) => sourceRefKey(a).localeCompare(sourceRefKey(b)));
}

export function courseDbSourceRef(path = 'DB/course_db.csv'): CourseCatalogSourceRef {
  return {
    kind: 'course-db',
    sourceId: 'course-db',
    path,
  };
}

export function timetableSourceRef(path: string): CourseCatalogSourceRef {
  return {
    kind: 'timetable-offering',
    sourceId: path,
    path,
  };
}

export function manualListingSourceRef(options: {
  academicYear: number;
  path: string;
  page?: number;
}): CourseCatalogSourceRef {
  return {
    kind: 'manual',
    sourceId: `${options.academicYear}:${options.path}${options.page ? `:p${options.page}` : ''}`,
    path: options.path,
    manualYear: options.academicYear,
    page: options.page,
  };
}

export function minorCatalogSourceRef(minorCode: string): CourseCatalogSourceRef {
  return {
    kind: 'minor-catalog',
    sourceId: minorCode,
    path: `DB/minor/${minorCode}.json`,
  };
}

export function roadmapPresetSourceRef(slug: string): CourseCatalogSourceRef {
  return {
    kind: 'roadmap-preset',
    sourceId: slug,
    path: `DB/roadmap/presets/${slug}.json`,
  };
}

export function recommendationSourceRef(): CourseCatalogSourceRef {
  return {
    kind: 'graduation-recommendation',
    sourceId: 'lib/const/course-master.ts',
    path: 'lib/const/course-master.ts',
  };
}
