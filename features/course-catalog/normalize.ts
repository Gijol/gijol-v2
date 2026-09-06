import type { CourseCatalogSourceRef } from './types';

export function normalizeCourseCode(code: string | undefined | null): string {
  return String(code ?? '')
    .trim()
    .toUpperCase();
}

function uniqueInOrder(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = normalizeCourseCode(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function parseSimpleCourseCode(code: string): { prefix: string; suffix: string } | null {
  const match = normalizeCourseCode(code).match(/^([A-Z]{2,4})(\d+[A-Z]?)$/);
  if (!match) return null;
  return { prefix: match[1], suffix: match[2] };
}

export function expandCourseCodeCandidates(code: string | undefined | null): string[] {
  const normalized = normalizeCourseCode(code);
  if (!normalized) return [];

  const combinedMatch = normalized.match(/^([A-Z]{2,4})\(([A-Z]{2,4})\)(\d+[A-Z]?)$/);
  if (!combinedMatch) return [normalized];

  const [, primaryPrefix, equivalentPrefix, suffix] = combinedMatch;
  return uniqueInOrder([normalized, `${primaryPrefix}${suffix}`, `${equivalentPrefix}${suffix}`]);
}

export function getCourseCodeSearchVariants(codes: readonly string[]): string[] {
  const variants = new Set<string>();
  const simpleBySuffix = new Map<string, string[]>();

  codes.forEach((code) => {
    expandCourseCodeCandidates(code).forEach((candidate) => {
      variants.add(candidate);

      const parsed = parseSimpleCourseCode(candidate);
      if (!parsed) return;

      const prefixes = simpleBySuffix.get(parsed.suffix) ?? [];
      if (!prefixes.includes(parsed.prefix)) {
        simpleBySuffix.set(parsed.suffix, [...prefixes, parsed.prefix]);
      }
    });
  });

  simpleBySuffix.forEach((prefixes, suffix) => {
    if (prefixes.length < 2) return;

    prefixes.forEach((prefix, index) => {
      prefixes.forEach((otherPrefix, otherIndex) => {
        if (index === otherIndex) return;
        variants.add(`${prefix}(${otherPrefix})${suffix}`);
      });
    });
  });

  return uniqueStrings(Array.from(variants));
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
    path: 'docs/bachelor_manual/2026_manual.pdf',
    manualYear: 2026,
    page: 27,
    note: '분야별 부전공 규정. 과목별 원문은 해당 facet의 manual sourceRef 참조.',
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
