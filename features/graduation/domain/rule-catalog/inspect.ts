import type { RequirementSource } from '../types';
import {
  CATALOG_SOURCE_PAGE_AUDITS,
  type CatalogSourcePageAudit,
  type CatalogSourcePageAuditStatus,
} from './catalog-source-page-audit';
import type { CourseEquivalency } from './course-equivalencies';
import type { GraduationCatalogPublishBundle } from './publish-bundle';
import type { RuleCatalogRule } from './schema';

export interface SourceLayerInspection {
  id: string;
  manualYear: number;
  sourcePath: string;
  ruleCount: number;
  courseEquivalencyCount: number;
  pages: readonly number[];
}

export interface SourcePageAuditInspection {
  layerId: string;
  page: number;
  title: string;
  status: CatalogSourcePageAuditStatus;
  reason: string;
  nextAction?: string;
  referenced: boolean;
  ruleCount: number;
  courseEquivalencyCount: number;
}

export interface GraduationCatalogInspection {
  schemaVersion: 1;
  totals: {
    sourceLayers: number;
    rules: number;
    courseEquivalencies: number;
    evaluatorBackedRules: number;
  };
  sourceLayers: readonly SourceLayerInspection[];
  sourcePageAudits: readonly SourcePageAuditInspection[];
  sourcePageAuditByStatus: Readonly<Record<string, number>>;
  rulesByKind: Readonly<Record<string, number>>;
  rulesByScope: Readonly<Record<string, number>>;
  rulesByEvaluatorId: Readonly<Record<string, number>>;
  rulesByApplicabilitySignal: Readonly<Record<string, number>>;
  unreferencedSourceLayerIds: readonly string[];
}

interface LayerUsageAccumulator {
  ruleIds: Set<string>;
  courseEquivalencyIds: Set<string>;
  pages: Set<number>;
  pageUsage: Map<number, {
    ruleIds: Set<string>;
    courseEquivalencyIds: Set<string>;
  }>;
}

function incrementCount(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function sortedRecord(counts: Record<string, number>): Readonly<Record<string, number>> {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
}

function sourceLayerKey(source: { manualYear: number; sourcePath: string }): string {
  return `${source.manualYear}:${source.sourcePath}`;
}

function sourceLayerKeyFromId(bundle: GraduationCatalogPublishBundle, layerId: string): string | undefined {
  const layer = bundle.sourceLayers.layers.find((candidate) => candidate.id === layerId);
  return layer ? sourceLayerKey(layer) : undefined;
}

function sourceRefKey(sourceRef: RequirementSource): string {
  return `${sourceRef.manualYear}:${sourceRef.path}`;
}

function scopeKey(rule: RuleCatalogRule): string {
  if (!rule.scope) return 'missing';
  if (rule.scope.type === 'global') return 'global';
  if (rule.scope.type === 'program-kind') return `program-kind:${rule.scope.programKind}`;
  return `program:${rule.scope.programKind}`;
}

function collectApplicabilitySignals(rule: RuleCatalogRule): readonly string[] {
  const appliesTo = rule.appliesTo;
  if (!appliesTo) return ['missing'];

  const signals: string[] = [];
  if (appliesTo.allCohorts === true) signals.push('allCohorts');
  if (appliesTo.entryYear) signals.push('entryYear');
  if (appliesTo.declarationTerm) signals.push('declarationTerm');
  if (appliesTo.effectiveFrom) signals.push('effectiveFrom');

  return signals.length > 0 ? signals : ['missing'];
}

function collectLayerUsageFromSourceRefs(
  sourceRefs: readonly RequirementSource[] | undefined,
  layerUsageByKey: Map<string, LayerUsageAccumulator>,
  itemId: string,
  itemKind: 'rule' | 'courseEquivalency',
): void {
  sourceRefs?.forEach((sourceRef) => {
    const usage = layerUsageByKey.get(sourceRefKey(sourceRef));
    if (!usage) return;

    const pageUsage = getPageUsage(usage, sourceRef.page);
    if (itemKind === 'rule') {
      usage.ruleIds.add(itemId);
      pageUsage.ruleIds.add(itemId);
    } else {
      usage.courseEquivalencyIds.add(itemId);
      pageUsage.courseEquivalencyIds.add(itemId);
    }
    usage.pages.add(sourceRef.page);
  });
}

function getPageUsage(usage: LayerUsageAccumulator, page: number): {
  ruleIds: Set<string>;
  courseEquivalencyIds: Set<string>;
} {
  const existing = usage.pageUsage.get(page);
  if (existing) return existing;

  const created = {
    ruleIds: new Set<string>(),
    courseEquivalencyIds: new Set<string>(),
  };
  usage.pageUsage.set(page, created);
  return created;
}

function createLayerUsageMap(
  bundle: GraduationCatalogPublishBundle,
): Map<string, LayerUsageAccumulator> {
  return new Map(
    bundle.sourceLayers.layers.map((layer) => [
      sourceLayerKey(layer),
      {
        ruleIds: new Set<string>(),
        courseEquivalencyIds: new Set<string>(),
        pages: new Set<number>(),
        pageUsage: new Map(),
      },
    ]),
  );
}

function inspectSourceLayers(
  bundle: GraduationCatalogPublishBundle,
  layerUsageByKey: Map<string, LayerUsageAccumulator>,
): readonly SourceLayerInspection[] {
  return bundle.sourceLayers.layers.map((layer) => {
    const usage = layerUsageByKey.get(sourceLayerKey(layer));

    return Object.freeze({
      id: layer.id,
      manualYear: layer.manualYear,
      sourcePath: layer.sourcePath,
      ruleCount: usage?.ruleIds.size ?? 0,
      courseEquivalencyCount: usage?.courseEquivalencyIds.size ?? 0,
      pages: Array.from(usage?.pages ?? []).sort((a, b) => a - b),
    });
  });
}

function collectRuleCounts(
  rules: readonly RuleCatalogRule[],
): Pick<
  GraduationCatalogInspection,
  'rulesByKind' | 'rulesByScope' | 'rulesByEvaluatorId' | 'rulesByApplicabilitySignal'
> {
  const byKind: Record<string, number> = {};
  const byScope: Record<string, number> = {};
  const byEvaluatorId: Record<string, number> = {};
  const byApplicabilitySignal: Record<string, number> = {};

  rules.forEach((rule) => {
    incrementCount(byKind, rule.kind);
    incrementCount(byScope, scopeKey(rule));

    if (rule.evaluatorId) {
      incrementCount(byEvaluatorId, rule.evaluatorId);
    }

    collectApplicabilitySignals(rule).forEach((signal) => {
      incrementCount(byApplicabilitySignal, signal);
    });
  });

  return {
    rulesByKind: sortedRecord(byKind),
    rulesByScope: sortedRecord(byScope),
    rulesByEvaluatorId: sortedRecord(byEvaluatorId),
    rulesByApplicabilitySignal: sortedRecord(byApplicabilitySignal),
  };
}

function collectLayerUsage(
  bundle: GraduationCatalogPublishBundle,
  layerUsageByKey: Map<string, LayerUsageAccumulator>,
): void {
  bundle.ruleCatalog.rules.forEach((rule) => {
    collectLayerUsageFromSourceRefs(rule.sourceRefs, layerUsageByKey, rule.id, 'rule');
  });

  bundle.courseEquivalencies.equivalencies.forEach((equivalency: CourseEquivalency) => {
    collectLayerUsageFromSourceRefs(
      equivalency.sourceRefs,
      layerUsageByKey,
      equivalency.id,
      'courseEquivalency',
    );
  });
}

function inspectSourcePageAudits(
  bundle: GraduationCatalogPublishBundle,
  layerUsageByKey: Map<string, LayerUsageAccumulator>,
): readonly SourcePageAuditInspection[] {
  return CATALOG_SOURCE_PAGE_AUDITS.map((audit: CatalogSourcePageAudit) => {
    const key = sourceLayerKeyFromId(bundle, audit.layerId);
    const usage = key ? layerUsageByKey.get(key) : undefined;
    const pageUsage = usage?.pageUsage.get(audit.page);
    const ruleCount = pageUsage?.ruleIds.size ?? 0;
    const courseEquivalencyCount = pageUsage?.courseEquivalencyIds.size ?? 0;
    const inspection: SourcePageAuditInspection = {
      layerId: audit.layerId,
      page: audit.page,
      title: audit.title,
      status: audit.status,
      reason: audit.reason,
      referenced: ruleCount > 0 || courseEquivalencyCount > 0,
      ruleCount,
      courseEquivalencyCount,
    };

    if (audit.nextAction) {
      inspection.nextAction = audit.nextAction;
    }

    return Object.freeze(inspection);
  }).sort((a, b) => {
    if (a.layerId !== b.layerId) return a.layerId.localeCompare(b.layerId);
    return a.page - b.page;
  });
}

function countSourcePageAuditStatuses(
  pageAudits: readonly SourcePageAuditInspection[],
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  pageAudits.forEach((audit) => {
    incrementCount(counts, audit.status);
  });
  return sortedRecord(counts);
}

export function inspectGraduationCatalogPublishBundle(
  bundle: GraduationCatalogPublishBundle,
): GraduationCatalogInspection {
  const layerUsageByKey = createLayerUsageMap(bundle);
  collectLayerUsage(bundle, layerUsageByKey);

  const sourceLayers = inspectSourceLayers(bundle, layerUsageByKey);
  const sourcePageAudits = inspectSourcePageAudits(bundle, layerUsageByKey);
  const ruleCounts = collectRuleCounts(bundle.ruleCatalog.rules);

  return Object.freeze({
    schemaVersion: 1,
    totals: Object.freeze({
      sourceLayers: bundle.sourceLayers.layers.length,
      rules: bundle.ruleCatalog.rules.length,
      courseEquivalencies: bundle.courseEquivalencies.equivalencies.length,
      evaluatorBackedRules: Object.values(ruleCounts.rulesByEvaluatorId).reduce((sum, count) => sum + count, 0),
    }),
    sourceLayers,
    sourcePageAudits,
    sourcePageAuditByStatus: countSourcePageAuditStatuses(sourcePageAudits),
    ...ruleCounts,
    unreferencedSourceLayerIds: sourceLayers
      .filter((layer) => layer.ruleCount === 0 && layer.courseEquivalencyCount === 0)
      .map((layer) => layer.id),
  });
}

function formatCountRecord(counts: Readonly<Record<string, number>>, emptyLabel: string): readonly string[] {
  const entries = Object.entries(counts);
  if (entries.length === 0) return [`  - ${emptyLabel}: 0`];
  return entries.map(([key, count]) => `  - ${key}: ${count}`);
}

export function formatGraduationCatalogInspection(
  inspection: GraduationCatalogInspection,
): string {
  const lines = [
    'Graduation catalog inspect',
    `- source layers: ${inspection.totals.sourceLayers}`,
    ...inspection.sourceLayers.map((layer) => {
      const pages = layer.pages.length > 0 ? layer.pages.join(', ') : 'none';
      return [
        `  - ${layer.id}:`,
        `${layer.ruleCount} rules,`,
        `${layer.courseEquivalencyCount} course equivalencies,`,
        `pages ${pages}`,
      ].join(' ');
    }),
    `- rules: ${inspection.totals.rules}`,
    ...formatCountRecord(inspection.rulesByKind, 'rule kinds'),
    '- rules by scope:',
    ...formatCountRecord(inspection.rulesByScope, 'rule scopes'),
    '- applicability signals:',
    ...formatCountRecord(inspection.rulesByApplicabilitySignal, 'applicability signals'),
    `- evaluator-backed rules: ${inspection.totals.evaluatorBackedRules}`,
    ...formatCountRecord(inspection.rulesByEvaluatorId, 'evaluatorIds'),
    '- source page audit:',
    ...formatCountRecord(inspection.sourcePageAuditByStatus, 'source page audit statuses'),
    `- course equivalencies: ${inspection.totals.courseEquivalencies}`,
    `- unreferenced source layers: ${
      inspection.unreferencedSourceLayerIds.length > 0
        ? inspection.unreferencedSourceLayerIds.join(', ')
        : 'none'
    }`,
  ];

  return `${lines.join('\n')}\n`;
}
