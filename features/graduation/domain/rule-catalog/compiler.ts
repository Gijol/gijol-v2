import {
  KNOWN_RULE_EVALUATOR_IDS,
  compareAcademicTerms,
  getDeclarationTermForProgramKind,
  getProgramCodesForProgramKind,
  validateRuleCatalog,
  type AcademicTermRange,
  type RequirementCondition,
  type RequirementContext,
  type RuleCatalogScope,
  type RuleCatalogRule,
  type RuleCatalogRuleKind,
  type RuleCatalogValidationIssue,
  type RuleCatalogValidationOptions,
  type RuleProgramKind,
} from './schema';

export type RuleApplicabilityStatus = 'applies' | 'does_not_apply' | 'needs_context';
export type RuleApplicabilityMissingContext = 'program' | 'declarationTerm' | 'evaluationTerm';

export interface RuleApplicability {
  status: RuleApplicabilityStatus;
  missingContext?: readonly RuleApplicabilityMissingContext[];
}

export interface RuleCatalogSelection {
  applicableRules: readonly RuleCatalogRule[];
  needsContext: readonly RuleCatalogNeedsContextItem[];
}

export interface RuleCatalogNeedsContextItem {
  rule: RuleCatalogRule;
  applicability: RuleApplicability;
}

export interface CompiledRuleCatalog {
  rules: readonly RuleCatalogRule[];
  byId: ReadonlyMap<string, RuleCatalogRule>;
  byKind: ReadonlyMap<RuleCatalogRuleKind, readonly RuleCatalogRule[]>;
  byEvaluatorId: ReadonlyMap<string, readonly RuleCatalogRule[]>;
}

export class RuleCatalogCompileError extends Error {
  constructor(readonly issues: readonly RuleCatalogValidationIssue[]) {
    const details = issues.map((issue) => `${issue.ruleId}: ${issue.message}`).join('\n');
    super(`Invalid graduation rule catalog:\n${details}`);
    this.name = 'RuleCatalogCompileError';
  }
}

function addToMapList<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const values = map.get(key);
  if (values) {
    values.push(value);
  } else {
    map.set(key, [value]);
  }
}

function freezeMapLists<K, V>(map: Map<K, V[]>): ReadonlyMap<K, readonly V[]> {
  return new Map(Array.from(map.entries()).map(([key, values]) => [key, Object.freeze([...values])]));
}

function hasTermRange(range: AcademicTermRange | undefined): boolean {
  return !!range && (range.from !== undefined || range.to !== undefined);
}

function evaluateTermRange(
  range: AcademicTermRange | undefined,
  term: RequirementContext['declarationTerm'],
): RuleApplicabilityStatus {
  if (!hasTermRange(range)) return 'applies';
  if (!term) return 'needs_context';
  if (range?.from && compareAcademicTerms(term, range.from) < 0) return 'does_not_apply';
  if (range?.to && compareAcademicTerms(term, range.to) > 0) return 'does_not_apply';
  return 'applies';
}

function getRuleProgramKind(rule: RuleCatalogRule): RuleProgramKind | undefined {
  return rule.scope && rule.scope.type !== 'global' ? rule.scope.programKind : undefined;
}

function normalizeProgramCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9_]/g, '');
}

function evaluateRuleScope(scope: RuleCatalogScope | undefined, context: RequirementContext): RuleApplicability {
  if (!scope || scope.type === 'global') return { status: 'applies' };

  const selectedProgramCodes = getProgramCodesForProgramKind(context, scope.programKind);
  if (!selectedProgramCodes) {
    return {
      status: 'needs_context',
      missingContext: ['program'],
    };
  }

  if (selectedProgramCodes.length === 0) {
    return { status: 'does_not_apply' };
  }

  if (scope.type === 'program-kind') {
    return { status: 'applies' };
  }

  const selected = new Set(selectedProgramCodes.map(normalizeProgramCode));
  const matches = scope.programCodes.some((programCode) => selected.has(normalizeProgramCode(programCode)));
  return matches ? { status: 'applies' } : { status: 'does_not_apply' };
}

function collectMissingContext(
  rule: RuleCatalogRule,
  appliesTo: RequirementCondition,
  context: RequirementContext,
): RuleApplicabilityMissingContext[] {
  const missing: RuleApplicabilityMissingContext[] = [];
  const declarationTerm = getDeclarationTermForProgramKind(context, getRuleProgramKind(rule));
  if (hasTermRange(appliesTo.declarationTerm) && !declarationTerm) {
    missing.push('declarationTerm');
  }
  if (appliesTo.effectiveFrom && !context.evaluationTerm) {
    missing.push('evaluationTerm');
  }
  return missing;
}

export function evaluateRuleApplicability(rule: RuleCatalogRule, context: RequirementContext): RuleApplicability {
  const appliesTo = rule.appliesTo;
  if (!appliesTo) return evaluateRuleScope(rule.scope, context);

  if (appliesTo.entryYear) {
    const { from, to } = appliesTo.entryYear;
    if (from !== undefined && context.entryYear < from) return { status: 'does_not_apply' };
    if (to !== undefined && context.entryYear > to) return { status: 'does_not_apply' };
  }

  const scopeApplicability = evaluateRuleScope(rule.scope, context);
  if (scopeApplicability.status !== 'applies') {
    return scopeApplicability;
  }

  const programKind = getRuleProgramKind(rule);
  const declarationTerm = getDeclarationTermForProgramKind(context, programKind);
  const missingContext = collectMissingContext(rule, appliesTo, context);
  if (missingContext.length > 0) {
    return { status: 'needs_context', missingContext };
  }

  const declarationTermStatus = evaluateTermRange(appliesTo.declarationTerm, declarationTerm);
  if (declarationTermStatus !== 'applies') return { status: declarationTermStatus };

  if (appliesTo.effectiveFrom && context.evaluationTerm) {
    return compareAcademicTerms(context.evaluationTerm, appliesTo.effectiveFrom) >= 0
      ? { status: 'applies' }
      : { status: 'does_not_apply' };
  }

  return { status: 'applies' };
}

export function compileRuleCatalog(
  rules: readonly RuleCatalogRule[],
  options: RuleCatalogValidationOptions = { publishable: true, evaluatorIds: KNOWN_RULE_EVALUATOR_IDS },
): CompiledRuleCatalog {
  const validation = validateRuleCatalog(rules, options);
  if (!validation.ok) {
    throw new RuleCatalogCompileError(validation.issues);
  }

  const byId = new Map<string, RuleCatalogRule>();
  const byKind = new Map<RuleCatalogRuleKind, RuleCatalogRule[]>();
  const byEvaluatorId = new Map<string, RuleCatalogRule[]>();

  rules.forEach((rule) => {
    byId.set(rule.id, rule);
    addToMapList(byKind, rule.kind, rule);
    if (rule.evaluatorId) {
      addToMapList(byEvaluatorId, rule.evaluatorId, rule);
    }
  });

  return {
    rules: Object.freeze([...rules]),
    byId,
    byKind: freezeMapLists(byKind),
    byEvaluatorId: freezeMapLists(byEvaluatorId),
  };
}

export function selectRulesForContext(
  catalog: CompiledRuleCatalog,
  context: RequirementContext,
): RuleCatalogSelection {
  const applicableRules: RuleCatalogRule[] = [];
  const needsContext: RuleCatalogNeedsContextItem[] = [];

  catalog.rules.forEach((rule) => {
    const applicability = evaluateRuleApplicability(rule, context);
    if (applicability.status === 'applies') {
      applicableRules.push(rule);
    } else if (applicability.status === 'needs_context') {
      needsContext.push({ rule, applicability });
    }
  });

  return {
    applicableRules,
    needsContext,
  };
}
