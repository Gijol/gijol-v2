import type { RequirementSource } from '../types';
import type { CourseEquivalency } from './course-equivalencies';
import type { RuleCatalogRule } from './schema';
import { validateJsonSerializableValue, type RuleCatalogSerializationResult } from './serialization';

export interface CatalogSourceLayer {
  id: string;
  label: string;
  manualYear: number;
  sourcePath: string;
  description?: string;
}

export type CatalogSourceLayerValidationIssueCode =
  | 'duplicate-source-layer-id'
  | 'invalid-source-layer'
  | 'unregistered-source-ref'
  | 'not-json-serializable';

export interface CatalogSourceLayerValidationIssue {
  layerId: string;
  code: CatalogSourceLayerValidationIssueCode;
  message: string;
}

export interface CatalogSourceLayerValidationResult {
  ok: boolean;
  issues: readonly CatalogSourceLayerValidationIssue[];
}

export interface CatalogSourceLayerPublishSnapshot {
  schemaVersion: 1;
  layers: readonly CatalogSourceLayer[];
}

export const CATALOG_SOURCE_LAYERS = defineCatalogSourceLayers([
  {
    id: 'gist-bachelor-manual-2020',
    label: 'GIST 학사편람 2020',
    manualYear: 2020,
    sourcePath: 'docs/bachelor_manual/2020_manual.pdf',
    description: 'MC3212 기계공학실험 I의 과거 이수 인정',
  },
  {
    id: 'gist-bachelor-manual-2023',
    label: 'GIST 학사편람 2023',
    manualYear: 2023,
    sourcePath: 'docs/bachelor_manual/2023_manual.pdf',
    description: 'BS3208(BS4205) 면역학의 명시적 코드 연결',
  },
  {
    id: 'gist-bachelor-manual-2025',
    label: 'GIST 학사편람 2025',
    manualYear: 2025,
    sourcePath: 'docs/bachelor_manual/2025_manual.pdf',
    description: '인문사회 과목의 GS→HS 코드 개편 대조',
  },
  {
    id: 'gist-bachelor-manual-2021',
    label: 'GIST 학사편람 2021',
    manualYear: 2021,
    sourcePath: 'docs/bachelor_manual/2021_manual.pdf',
    description: '영어 I 개편 전 이수 인정 근거: 인쇄 18쪽(PDF 19쪽)의 신입생 영어 또는 발표와 토론',
  },
  {
    id: 'gist-bachelor-manual-2024',
    label: 'GIST 학사편람 2024',
    manualYear: 2024,
    sourcePath: 'docs/bachelor_manual/2024_manual.pdf',
    description: 'AI 부전공 개편 전 필수과목 확인: PDF 55쪽(인쇄 54쪽)',
  },
  {
    id: 'gist-bachelor-manual-2026',
    label: 'GIST 학사편람 2026',
    manualYear: 2026,
    sourcePath: 'docs/bachelor_manual/2026_manual.pdf',
    description: '2026 학사편람에서 추출한 졸업요건 source layer',
  },
] as const);

export const CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT = createCatalogSourceLayerPublishSnapshot(CATALOG_SOURCE_LAYERS);

function pushIssue(
  issues: CatalogSourceLayerValidationIssue[],
  layerId: string,
  code: CatalogSourceLayerValidationIssueCode,
  message: string,
): void {
  issues.push({ layerId, code, message });
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value && value > 0;
}

function sourceLayerKey(
  source: Pick<CatalogSourceLayer, 'manualYear'> & { sourcePath?: string; path?: string },
): string {
  return `${source.manualYear}:${source.sourcePath ?? source.path ?? ''}`;
}

function sourceRefKey(sourceRef: RequirementSource): string {
  return `${sourceRef.manualYear}:${sourceRef.path}`;
}

function validateUniqueLayerIds(
  layers: readonly CatalogSourceLayer[],
  issues: CatalogSourceLayerValidationIssue[],
): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  layers.forEach((layer) => {
    if (seen.has(layer.id)) {
      duplicates.add(layer.id);
    }
    seen.add(layer.id);
  });

  duplicates.forEach((id) => {
    pushIssue(issues, id, 'duplicate-source-layer-id', `Duplicate source layer id: ${id}.`);
  });
}

function validateLayerShape(layer: CatalogSourceLayer, issues: CatalogSourceLayerValidationIssue[]): void {
  if (!layer.id || !layer.label || !isPositiveInteger(layer.manualYear) || !layer.sourcePath) {
    pushIssue(
      issues,
      layer.id || '(missing-id)',
      'invalid-source-layer',
      'Source layers must include id, label, manualYear, and sourcePath.',
    );
  }
}

function collectSourceRefs(
  rules: readonly RuleCatalogRule[],
  courseEquivalencies: readonly CourseEquivalency[],
): readonly RequirementSource[] {
  return [
    ...rules.flatMap((rule) => rule.sourceRefs ?? []),
    ...courseEquivalencies.flatMap((equivalency) => equivalency.sourceRefs ?? []),
  ];
}

export function validateJsonSerializableCatalogSourceLayers(
  layers: readonly CatalogSourceLayer[],
): RuleCatalogSerializationResult {
  return validateJsonSerializableValue(layers, '$.sourceLayers.layers');
}

export function validateCatalogSourceLayers(
  layers: readonly CatalogSourceLayer[],
  rules: readonly RuleCatalogRule[] = [],
  courseEquivalencies: readonly CourseEquivalency[] = [],
): CatalogSourceLayerValidationResult {
  const issues: CatalogSourceLayerValidationIssue[] = [];

  validateUniqueLayerIds(layers, issues);

  layers.forEach((layer) => {
    validateLayerShape(layer, issues);

    const serialization = validateJsonSerializableValue(layer, `$.sourceLayers["${layer.id}"]`);
    if (!serialization.ok) {
      serialization.issues.forEach((issue) => {
        pushIssue(issues, layer.id, 'not-json-serializable', issue.message);
      });
    }
  });

  const layerKeys = new Set(layers.map(sourceLayerKey));
  collectSourceRefs(rules, courseEquivalencies).forEach((sourceRef) => {
    if (!layerKeys.has(sourceRefKey(sourceRef))) {
      pushIssue(
        issues,
        `${sourceRef.manualYear}:${sourceRef.path}`,
        'unregistered-source-ref',
        'Every sourceRef must match a registered catalog source layer.',
      );
    }
  });

  return { ok: issues.length === 0, issues };
}

export function defineCatalogSourceLayers<T extends readonly CatalogSourceLayer[]>(layers: T): T {
  const validation = validateCatalogSourceLayers(layers);
  if (!validation.ok) {
    const details = validation.issues.map((issue) => `${issue.layerId}: ${issue.message}`).join('\n');
    throw new Error(`Invalid catalog source layers:\n${details}`);
  }
  return layers;
}

export function createCatalogSourceLayerPublishSnapshot(
  layers: readonly CatalogSourceLayer[],
): CatalogSourceLayerPublishSnapshot {
  const validation = validateCatalogSourceLayers(layers);
  if (!validation.ok) {
    const details = validation.issues.map((issue) => `${issue.layerId}: ${issue.message}`).join('\n');
    throw new Error(`Invalid catalog source layers:\n${details}`);
  }

  return Object.freeze({
    schemaVersion: 1,
    layers: JSON.parse(JSON.stringify(layers)) as readonly CatalogSourceLayer[],
  });
}
