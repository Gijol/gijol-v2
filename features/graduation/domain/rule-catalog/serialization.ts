import { validateRuleCatalog, type RuleCatalogRule, type RuleCatalogValidationOptions } from './schema';

export type RuleCatalogJsonPrimitive = string | number | boolean | null;
export type RuleCatalogJsonValue =
  | RuleCatalogJsonPrimitive
  | readonly RuleCatalogJsonValue[]
  | { readonly [key: string]: RuleCatalogJsonValue };

export type RuleCatalogSerializationIssueCode =
  | 'undefined-value'
  | 'non-finite-number'
  | 'non-json-value'
  | 'non-plain-object'
  | 'circular-reference';

export interface RuleCatalogSerializationIssue {
  path: string;
  code: RuleCatalogSerializationIssueCode;
  message: string;
}

export interface RuleCatalogSerializationResult {
  ok: boolean;
  issues: readonly RuleCatalogSerializationIssue[];
}

export interface RuleCatalogPublishSnapshot {
  schemaVersion: 1;
  rules: readonly RuleCatalogRule[];
}

export class RuleCatalogSerializationError extends Error {
  constructor(readonly issues: readonly RuleCatalogSerializationIssue[]) {
    const details = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    super(`Graduation rule catalog is not JSON serializable:\n${details}`);
    this.name = 'RuleCatalogSerializationError';
  }
}

export function validateJsonSerializableValue(
  value: unknown,
  path = '$',
): RuleCatalogSerializationResult {
  const issues: RuleCatalogSerializationIssue[] = [];
  validateJsonValue(value, path, issues, new WeakSet<object>());
  return { ok: issues.length === 0, issues };
}

function pushIssue(
  issues: RuleCatalogSerializationIssue[],
  path: string,
  code: RuleCatalogSerializationIssueCode,
  message: string,
): void {
  issues.push({ path, code, message });
}

function formatPropertyPath(path: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

function validateJsonValue(
  value: unknown,
  path: string,
  issues: RuleCatalogSerializationIssue[],
  ancestors: WeakSet<object>,
): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      pushIssue(issues, path, 'non-finite-number', 'JSON numbers must be finite.');
    }
    return;
  }

  if (value === undefined) {
    pushIssue(issues, path, 'undefined-value', 'JSON serialization would omit this value.');
    return;
  }

  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') {
    pushIssue(issues, path, 'non-json-value', `JSON cannot represent ${typeof value} values.`);
    return;
  }

  if (typeof value !== 'object') {
    pushIssue(issues, path, 'non-json-value', 'JSON cannot represent this value.');
    return;
  }

  if (ancestors.has(value)) {
    pushIssue(issues, path, 'circular-reference', 'JSON serialization cannot represent circular references.');
    return;
  }

  ancestors.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      validateJsonValue(item, `${path}[${index}]`, issues, ancestors);
    });
    ancestors.delete(value);
    return;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    pushIssue(issues, path, 'non-plain-object', 'Rule catalog JSON must use plain objects.');
    ancestors.delete(value);
    return;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    validateJsonValue(item, formatPropertyPath(path, key), issues, ancestors);
  });

  ancestors.delete(value);
}

export function validateJsonSerializableRuleCatalog(
  rules: readonly RuleCatalogRule[],
): RuleCatalogSerializationResult {
  return validateJsonSerializableValue(rules, '$.rules');
}

export function createRuleCatalogPublishSnapshot(
  rules: readonly RuleCatalogRule[],
  options: RuleCatalogValidationOptions = { publishable: true },
): RuleCatalogPublishSnapshot {
  const validation = validateRuleCatalog(rules, options);
  if (!validation.ok) {
    const details = validation.issues.map((issue) => `${issue.ruleId}: ${issue.message}`).join('\n');
    throw new Error(`Invalid graduation rule catalog:\n${details}`);
  }

  const serialization = validateJsonSerializableRuleCatalog(rules);
  if (!serialization.ok) {
    throw new RuleCatalogSerializationError(serialization.issues);
  }

  return Object.freeze({
    schemaVersion: 1,
    rules: JSON.parse(JSON.stringify(rules)) as readonly RuleCatalogRule[],
  });
}

export function stringifyRuleCatalogPublishSnapshot(snapshot: RuleCatalogPublishSnapshot, space = 2): string {
  return JSON.stringify(snapshot, null, space);
}
