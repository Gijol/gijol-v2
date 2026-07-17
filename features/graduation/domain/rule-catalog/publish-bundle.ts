import {
  CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT,
  validateCatalogSourceLayers,
  type CatalogSourceLayerPublishSnapshot,
} from './catalog-source-layers';
import {
  COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT,
  type CourseEquivalencyPublishSnapshot,
} from './course-equivalencies';
import { GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT } from './catalog';
import { type RuleCatalogPublishSnapshot, validateJsonSerializableValue } from './serialization';

export interface GraduationCatalogPublishBundle {
  schemaVersion: 1;
  sourceLayers: CatalogSourceLayerPublishSnapshot;
  ruleCatalog: RuleCatalogPublishSnapshot;
  courseEquivalencies: CourseEquivalencyPublishSnapshot;
}

export type GraduationCatalogPublishBundleValidationIssueCode =
  | 'invalid-schema-version'
  | 'invalid-source-layer-coverage'
  | 'not-json-serializable';

export interface GraduationCatalogPublishBundleValidationIssue {
  path: string;
  code: GraduationCatalogPublishBundleValidationIssueCode;
  message: string;
}

export interface GraduationCatalogPublishBundleValidationResult {
  ok: boolean;
  issues: readonly GraduationCatalogPublishBundleValidationIssue[];
}

export class GraduationCatalogPublishBundleValidationError extends Error {
  constructor(readonly issues: readonly GraduationCatalogPublishBundleValidationIssue[]) {
    const details = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    super(`Invalid graduation catalog publish bundle:\n${details}`);
    this.name = 'GraduationCatalogPublishBundleValidationError';
  }
}

export const GRADUATION_CATALOG_PUBLISH_BUNDLE = createGraduationCatalogPublishBundle(
  CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT,
  GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT,
  COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT,
);

export function createGraduationCatalogPublishBundle(
  sourceLayers: CatalogSourceLayerPublishSnapshot,
  ruleCatalog: RuleCatalogPublishSnapshot,
  courseEquivalencies: CourseEquivalencyPublishSnapshot,
): GraduationCatalogPublishBundle {
  const bundle: GraduationCatalogPublishBundle = {
    schemaVersion: 1,
    sourceLayers,
    ruleCatalog,
    courseEquivalencies,
  };

  const validation = validateGraduationCatalogPublishBundle(bundle);
  if (!validation.ok) {
    throw new GraduationCatalogPublishBundleValidationError(validation.issues);
  }

  return Object.freeze(JSON.parse(JSON.stringify(bundle)) as GraduationCatalogPublishBundle);
}

function pushIssue(
  issues: GraduationCatalogPublishBundleValidationIssue[],
  path: string,
  code: GraduationCatalogPublishBundleValidationIssueCode,
  message: string,
): void {
  issues.push({ path, code, message });
}

function validateSchemaVersion(
  value: unknown,
  path: string,
  issues: GraduationCatalogPublishBundleValidationIssue[],
): void {
  if (value !== 1) {
    pushIssue(issues, path, 'invalid-schema-version', 'schemaVersion must be 1.');
  }
}

export function validateGraduationCatalogPublishBundle(
  bundle: GraduationCatalogPublishBundle,
): GraduationCatalogPublishBundleValidationResult {
  const issues: GraduationCatalogPublishBundleValidationIssue[] = [];

  validateSchemaVersion(bundle.schemaVersion, '$.schemaVersion', issues);
  validateSchemaVersion(bundle.sourceLayers.schemaVersion, '$.sourceLayers.schemaVersion', issues);
  validateSchemaVersion(bundle.ruleCatalog.schemaVersion, '$.ruleCatalog.schemaVersion', issues);
  validateSchemaVersion(bundle.courseEquivalencies.schemaVersion, '$.courseEquivalencies.schemaVersion', issues);

  const sourceLayerValidation = validateCatalogSourceLayers(
    bundle.sourceLayers.layers,
    bundle.ruleCatalog.rules,
    bundle.courseEquivalencies.equivalencies,
  );
  if (!sourceLayerValidation.ok) {
    sourceLayerValidation.issues.forEach((issue) => {
      pushIssue(
        issues,
        '$.sourceLayers',
        'invalid-source-layer-coverage',
        `[${issue.code}] ${issue.layerId}: ${issue.message}`,
      );
    });
  }

  const serialization = validateJsonSerializableValue(bundle, '$');
  if (!serialization.ok) {
    serialization.issues.forEach((issue) => {
      pushIssue(issues, issue.path, 'not-json-serializable', issue.message);
    });
  }

  return { ok: issues.length === 0, issues };
}

export function stringifyGraduationCatalogPublishBundle(
  bundle: GraduationCatalogPublishBundle,
  space = 2,
): string {
  return JSON.stringify(bundle, null, space);
}
