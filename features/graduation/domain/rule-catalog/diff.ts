import type { GraduationCatalogPublishBundle } from './publish-bundle';

export interface CatalogEntityDiff {
  addedIds: readonly string[];
  removedIds: readonly string[];
  changedIds: readonly string[];
}

export interface GraduationCatalogSnapshotDiff {
  ok: boolean;
  schemaVersionChanged: boolean;
  nestedSchemaVersionChanges: readonly string[];
  sourceLayers: CatalogEntityDiff;
  rules: CatalogEntityDiff;
  courseEquivalencies: CatalogEntityDiff;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(',')}}`;
}

function sorted(values: Iterable<string>): readonly string[] {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function diffEntities<T>(
  expected: readonly T[],
  actual: readonly T[],
  getId: (item: T) => string,
): CatalogEntityDiff {
  const expectedById = new Map(expected.map((item) => [getId(item), item]));
  const actualById = new Map(actual.map((item) => [getId(item), item]));

  const expectedIds = new Set(expectedById.keys());
  const actualIds = new Set(actualById.keys());
  const addedIds = sorted(Array.from(actualIds).filter((id) => !expectedIds.has(id)));
  const removedIds = sorted(Array.from(expectedIds).filter((id) => !actualIds.has(id)));
  const changedIds = sorted(
    Array.from(expectedIds).filter((id) => {
      if (!actualIds.has(id)) return false;
      return stableStringify(expectedById.get(id)) !== stableStringify(actualById.get(id));
    }),
  );

  return { addedIds, removedIds, changedIds };
}

function hasEntityChanges(diff: CatalogEntityDiff): boolean {
  return diff.addedIds.length > 0 || diff.removedIds.length > 0 || diff.changedIds.length > 0;
}

function collectNestedSchemaVersionChanges(
  expected: GraduationCatalogPublishBundle,
  actual: GraduationCatalogPublishBundle,
): readonly string[] {
  const changes: string[] = [];
  if (expected.sourceLayers.schemaVersion !== actual.sourceLayers.schemaVersion) {
    changes.push('sourceLayers.schemaVersion');
  }
  if (expected.ruleCatalog.schemaVersion !== actual.ruleCatalog.schemaVersion) {
    changes.push('ruleCatalog.schemaVersion');
  }
  if (expected.courseEquivalencies.schemaVersion !== actual.courseEquivalencies.schemaVersion) {
    changes.push('courseEquivalencies.schemaVersion');
  }
  return changes;
}

function sourceLayerId(layer: { id: string }): string {
  return layer.id;
}

function ruleId(rule: { id: string }): string {
  return rule.id;
}

function courseEquivalencyId(equivalency: { id: string }): string {
  return equivalency.id;
}

export function diffGraduationCatalogPublishBundles(
  expected: GraduationCatalogPublishBundle,
  actual: GraduationCatalogPublishBundle,
): GraduationCatalogSnapshotDiff {
  const sourceLayers = diffEntities(
    expected.sourceLayers.layers,
    actual.sourceLayers.layers,
    sourceLayerId,
  );
  const rules = diffEntities(expected.ruleCatalog.rules, actual.ruleCatalog.rules, ruleId);
  const courseEquivalencies = diffEntities(
    expected.courseEquivalencies.equivalencies,
    actual.courseEquivalencies.equivalencies,
    courseEquivalencyId,
  );
  const nestedSchemaVersionChanges = collectNestedSchemaVersionChanges(expected, actual);
  const schemaVersionChanged = expected.schemaVersion !== actual.schemaVersion;

  return {
    ok:
      !schemaVersionChanged &&
      nestedSchemaVersionChanges.length === 0 &&
      !hasEntityChanges(sourceLayers) &&
      !hasEntityChanges(rules) &&
      !hasEntityChanges(courseEquivalencies),
    schemaVersionChanged,
    nestedSchemaVersionChanges,
    sourceLayers,
    rules,
    courseEquivalencies,
  };
}

function formatEntityDiff(label: string, diff: CatalogEntityDiff): readonly string[] {
  const lines: string[] = [];
  if (diff.addedIds.length > 0) {
    lines.push(`- ${label} added: ${diff.addedIds.join(', ')}`);
  }
  if (diff.removedIds.length > 0) {
    lines.push(`- ${label} removed: ${diff.removedIds.join(', ')}`);
  }
  if (diff.changedIds.length > 0) {
    lines.push(`- ${label} changed: ${diff.changedIds.join(', ')}`);
  }
  return lines;
}

export function formatGraduationCatalogSnapshotDiff(
  diff: GraduationCatalogSnapshotDiff,
): string {
  if (diff.ok) return 'Graduation catalog snapshot matches.\n';

  const lines = ['Graduation catalog snapshot differs.'];
  if (diff.schemaVersionChanged) {
    lines.push('- bundle schemaVersion changed');
  }
  if (diff.nestedSchemaVersionChanges.length > 0) {
    lines.push(`- nested schemaVersion changed: ${diff.nestedSchemaVersionChanges.join(', ')}`);
  }

  lines.push(...formatEntityDiff('source layers', diff.sourceLayers));
  lines.push(...formatEntityDiff('rules', diff.rules));
  lines.push(...formatEntityDiff('course equivalencies', diff.courseEquivalencies));

  return `${lines.join('\n')}\n`;
}
