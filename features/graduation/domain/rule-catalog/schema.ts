import type { AcademicTerm, RequirementSource } from '../types';
import { RULE_EVALUATOR_REGISTRY, type RuleEvaluatorRegistry } from './rule-evaluator-registry';

export type RuleEvaluatorId = 'ir-ai-code-course-limit';

export const KNOWN_RULE_EVALUATOR_IDS = Object.freeze(
  Object.keys(RULE_EVALUATOR_REGISTRY),
) as readonly RuleEvaluatorId[];

export const RULE_PROGRAM_KINDS = ['major', 'minor', 'double-major', 'advanced-major'] as const;

export type RuleProgramKind = (typeof RULE_PROGRAM_KINDS)[number];

export type RequirementContextProgramCodes = Partial<Record<RuleProgramKind, readonly string[]>>;

export type RuleCatalogScope =
  | { type: 'global' }
  | { type: 'program-kind'; programKind: RuleProgramKind }
  | { type: 'program'; programKind: RuleProgramKind; programCodes: readonly string[] };

export interface EntryYearRange {
  from?: number;
  to?: number;
}

export interface AcademicTermRange {
  from?: AcademicTerm;
  to?: AcademicTerm;
}

export interface RequirementCondition {
  allCohorts?: boolean;
  entryYear?: EntryYearRange;
  declarationTerm?: AcademicTermRange;
  effectiveFrom?: AcademicTerm;
  note?: string;
}

export interface RequirementContext {
  entryYear: number;
  programCodes?: RequirementContextProgramCodes;
  declarationTerm?: AcademicTerm;
  declarationTerms?: Partial<Record<RuleProgramKind, AcademicTerm | undefined>>;
  evaluationTerm?: AcademicTerm;
}

export type RuleCatalogRuleKind =
  | 'gpa-minimum'
  | 'credit-minimum'
  | 'conditional-credit-minimum'
  | 'course-credit'
  | 'course-count'
  | 'activity-count'
  | 'course-limit'
  | 'declaration-term-required'
  | 'thesis-research'
  | (string & {});

export interface RuleCatalogRule {
  id: string;
  kind: RuleCatalogRuleKind;
  label?: string;
  scope?: RuleCatalogScope;
  parameters?: RuleCatalogParameters;
  sourceRefs?: readonly RequirementSource[];
  appliesTo?: RequirementCondition;
  evaluatorId?: string;
}

export interface CreditMinimumRuleParameters {
  requiredCredits: number;
  unit: 'credits';
}

export interface ConditionalCreditMinimumRuleParameters {
  defaultRequiredCredits: number;
  unit: 'credits';
  variants: readonly {
    conditionKey: string;
    requiredCredits: number;
  }[];
}

export interface GpaMinimumRuleParameters {
  minimumGpa: number;
  scale: number;
}

export interface CourseCreditRuleParameters {
  requiredCredits: number;
  unit: 'credits';
  courses: readonly string[];
  legacyPairCodes?: readonly string[];
}

export interface LegacyCourseCountAlternative {
  triggerCourseCode: string;
  requiredCount: number;
  courses: readonly string[];
}

export interface CourseCountRuleParameters {
  legacyAlternative?: LegacyCourseCountAlternative;
  requiredCount: number;
  unit: 'courses';
  courses: readonly string[];
  courseNames?: readonly string[];
}

export interface ActivityCountRuleParameters {
  requiredCount: number;
  unit: 'courses' | 'occurrences' | 'semesters';
}

export interface CourseLimitRuleParameters {
  maxCourses: number;
  unit: 'courses';
  reason: string;
}

export interface DeclarationTermRequiredRuleParameters {
  missingContext: 'declarationTerm';
  missingTermRequirementId: string;
  missingTermLabel: string;
  missingTermHint: string;
}

export interface ThesisResearchRuleParameters {
  suffix: string;
  requiredCount: number;
  unit: 'courses';
  sourceRequiredCredits: number;
}

export type RuleCatalogParameters =
  | GpaMinimumRuleParameters
  | CreditMinimumRuleParameters
  | ConditionalCreditMinimumRuleParameters
  | CourseCreditRuleParameters
  | CourseCountRuleParameters
  | ActivityCountRuleParameters
  | CourseLimitRuleParameters
  | DeclarationTermRequiredRuleParameters
  | ThesisResearchRuleParameters
  | Record<string, unknown>;

export interface SourceBackedRule {
  id: string;
  sourceRefs: readonly RequirementSource[];
  appliesTo: RequirementCondition;
  evaluatorId?: string;
}

export type RuleCatalogValidationIssueCode =
  | 'duplicate-rule-id'
  | 'missing-source-ref'
  | 'invalid-source-ref'
  | 'missing-scope'
  | 'invalid-scope'
  | 'missing-parameters'
  | 'invalid-parameters'
  | 'missing-applies-to'
  | 'conflicting-applies-to'
  | 'invalid-entry-year-range'
  | 'invalid-declaration-term-range'
  | 'invalid-effective-from'
  | 'unknown-evaluator-id'
  | 'invalid-evaluator-contract';

export interface RuleCatalogValidationIssue {
  ruleId: string;
  code: RuleCatalogValidationIssueCode;
  message: string;
}

export interface RuleCatalogValidationResult {
  ok: boolean;
  issues: readonly RuleCatalogValidationIssue[];
}

export interface RuleCatalogValidationOptions {
  publishable?: boolean;
  evaluatorIds?: readonly string[];
  evaluatorRegistry?: RuleEvaluatorRegistry;
}

function getSemesterOrder(semester: string): number {
  const normalized = String(semester).trim().toLowerCase();
  if (['1', '1학기', 'spring', '봄'].includes(normalized)) return 1;
  if (['summer', '여름', '여름학기'].includes(normalized)) return 2;
  if (['2', '2학기', 'fall', 'autumn', '가을'].includes(normalized)) return 3;
  if (['winter', '겨울', '겨울학기'].includes(normalized)) return 4;
  return 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value && value > 0;
}

function isValidAcademicTerm(term: AcademicTerm | undefined): term is AcademicTerm {
  return !!term && isPositiveInteger(term.year) && getSemesterOrder(term.semester) > 0;
}

function hasEntryYearBoundary(range: EntryYearRange | undefined): boolean {
  return !!range && (range.from !== undefined || range.to !== undefined);
}

function hasAcademicTermBoundary(range: AcademicTermRange | undefined): boolean {
  return !!range && (range.from !== undefined || range.to !== undefined);
}

function hasExplicitApplicability(condition: RequirementCondition | undefined): boolean {
  return (
    !!condition &&
    (condition.allCohorts === true ||
      hasEntryYearBoundary(condition.entryYear) ||
      hasAcademicTermBoundary(condition.declarationTerm) ||
      condition.effectiveFrom !== undefined)
  );
}

function pushIssue(
  issues: RuleCatalogValidationIssue[],
  ruleId: string,
  code: RuleCatalogValidationIssueCode,
  message: string,
): void {
  issues.push({ ruleId, code, message });
}

function validateUniqueRuleIds(rules: readonly RuleCatalogRule[], issues: RuleCatalogValidationIssue[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  rules.forEach((rule) => {
    if (seen.has(rule.id)) {
      duplicates.add(rule.id);
    }
    seen.add(rule.id);
  });

  duplicates.forEach((ruleId) => {
    pushIssue(issues, ruleId, 'duplicate-rule-id', `Duplicate rule id: ${ruleId}.`);
  });
}

export function compareAcademicTerms(a: AcademicTerm, b: AcademicTerm): number {
  if (a.year !== b.year) return a.year - b.year;
  return getSemesterOrder(a.semester) - getSemesterOrder(b.semester);
}

export function appliesToEntryYearRange(range: EntryYearRange | undefined, entryYear: number): boolean {
  if (!range) return true;
  return (range.from === undefined || entryYear >= range.from) && (range.to === undefined || entryYear <= range.to);
}

export function appliesToTermRange(range: AcademicTermRange | undefined, term: AcademicTerm | undefined): boolean {
  if (!range) return true;
  if (!term) return false;
  if (range.from && compareAcademicTerms(term, range.from) < 0) return false;
  if (range.to && compareAcademicTerms(term, range.to) > 0) return false;
  return true;
}

export function getDeclarationTermForProgramKind(
  context: RequirementContext,
  programKind: RuleProgramKind | undefined,
): AcademicTerm | undefined {
  return (programKind ? context.declarationTerms?.[programKind] : undefined) ?? context.declarationTerm;
}

export function getProgramCodesForProgramKind(
  context: RequirementContext,
  programKind: RuleProgramKind,
): readonly string[] | undefined {
  return context.programCodes?.[programKind];
}

export function appliesToRequirementCondition(
  appliesTo: RequirementCondition | undefined,
  context: RequirementContext,
  programKind?: RuleProgramKind,
): boolean {
  if (!appliesTo) return true;
  if (!appliesToEntryYearRange(appliesTo.entryYear, context.entryYear)) return false;
  if (!appliesToTermRange(appliesTo.declarationTerm, getDeclarationTermForProgramKind(context, programKind))) {
    return false;
  }
  if (appliesTo.effectiveFrom) {
    return !!context.evaluationTerm && compareAcademicTerms(context.evaluationTerm, appliesTo.effectiveFrom) >= 0;
  }
  return true;
}

function validateSourceRefs(rule: RuleCatalogRule, issues: RuleCatalogValidationIssue[], publishable: boolean): void {
  if (!rule.sourceRefs || rule.sourceRefs.length === 0) {
    if (publishable) {
      pushIssue(issues, rule.id, 'missing-source-ref', 'Publishable catalog rules must include sourceRefs.');
    }
    return;
  }

  rule.sourceRefs.forEach((sourceRef, index) => {
    if (!isPositiveInteger(sourceRef.manualYear) || !isPositiveInteger(sourceRef.page) || !sourceRef.path) {
      pushIssue(issues, rule.id, 'invalid-source-ref', `sourceRefs[${index}] must include manualYear, page, and path.`);
    }
  });
}

function hasNonEmptyStrings(values: readonly unknown[] | undefined): values is readonly string[] {
  return !!values && values.length > 0 && values.every((value) => typeof value === 'string' && value.trim().length > 0);
}

function validateScope(rule: RuleCatalogRule, issues: RuleCatalogValidationIssue[], publishable: boolean): void {
  if (!rule.scope) {
    if (publishable) {
      pushIssue(issues, rule.id, 'missing-scope', 'Publishable catalog rules must include scope.');
    }
    return;
  }

  if (rule.scope.type === 'global') return;

  if (!RULE_PROGRAM_KINDS.includes(rule.scope.programKind)) {
    pushIssue(issues, rule.id, 'invalid-scope', `programKind must be one of: ${RULE_PROGRAM_KINDS.join(', ')}.`);
  }

  if (rule.scope.type === 'program' && !hasNonEmptyStrings(rule.scope.programCodes)) {
    pushIssue(issues, rule.id, 'invalid-scope', 'program scope must include non-empty programCodes.');
  }
}

function validateParameters(rule: RuleCatalogRule, issues: RuleCatalogValidationIssue[], publishable: boolean): void {
  if (!rule.parameters) {
    if (publishable) {
      pushIssue(issues, rule.id, 'missing-parameters', 'Publishable catalog rules must include parameters.');
    }
    return;
  }

  if (rule.kind === 'credit-minimum') {
    const parameters = rule.parameters as Partial<CreditMinimumRuleParameters>;
    if (!isPositiveInteger(parameters.requiredCredits) || parameters.unit !== 'credits') {
      pushIssue(issues, rule.id, 'invalid-parameters', 'credit-minimum parameters require credits.');
    }
  }

  if (rule.kind === 'conditional-credit-minimum') {
    const parameters = rule.parameters as Partial<ConditionalCreditMinimumRuleParameters>;
    const variants = parameters.variants ?? [];
    if (!isPositiveInteger(parameters.defaultRequiredCredits) || parameters.unit !== 'credits') {
      pushIssue(
        issues,
        rule.id,
        'invalid-parameters',
        'conditional-credit-minimum parameters require default credits.',
      );
    }
    if (
      variants.length === 0 ||
      variants.some((variant) => !variant.conditionKey || !isPositiveInteger(variant.requiredCredits))
    ) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'conditional-credit-minimum parameters require valid variants.');
    }
  }

  if (rule.kind === 'gpa-minimum') {
    const parameters = rule.parameters as Partial<GpaMinimumRuleParameters>;
    if (
      typeof parameters.minimumGpa !== 'number' ||
      parameters.minimumGpa < 0 ||
      typeof parameters.scale !== 'number' ||
      parameters.scale <= 0
    ) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'gpa-minimum parameters require GPA and scale.');
    }
  }

  if (rule.kind === 'course-credit') {
    const parameters = rule.parameters as Partial<CourseCreditRuleParameters>;
    if (!isPositiveInteger(parameters.requiredCredits) || parameters.unit !== 'credits') {
      pushIssue(issues, rule.id, 'invalid-parameters', 'course-credit parameters require credits.');
    }
    if (!hasNonEmptyStrings(parameters.courses)) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'course-credit parameters require courses.');
    }
    if (parameters.legacyPairCodes !== undefined && !hasNonEmptyStrings(parameters.legacyPairCodes)) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'course-credit legacyPairCodes must be non-empty strings.');
    }
  }

  if (rule.kind === 'course-count') {
    const parameters = rule.parameters as Partial<CourseCountRuleParameters>;
    if (!isPositiveInteger(parameters.requiredCount) || parameters.unit !== 'courses') {
      pushIssue(issues, rule.id, 'invalid-parameters', 'course-count parameters require course count.');
    }
    if (!hasNonEmptyStrings(parameters.courses)) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'course-count parameters require courses.');
    }
    if (parameters.legacyAlternative !== undefined) {
      const alternative = parameters.legacyAlternative;
      if (
        !alternative ||
        !isPositiveInteger(alternative.requiredCount) ||
        !hasNonEmptyStrings(alternative.courses) ||
        !alternative.triggerCourseCode ||
        !alternative.courses.includes(alternative.triggerCourseCode) ||
        alternative.requiredCount > alternative.courses.length
      ) {
        pushIssue(
          issues,
          rule.id,
          'invalid-parameters',
          'course-count legacyAlternative requires a trigger within its courses and a valid count.',
        );
      }
    }
  }

  if (rule.kind === 'activity-count') {
    const parameters = rule.parameters as Partial<ActivityCountRuleParameters>;
    if (
      !isPositiveInteger(parameters.requiredCount) ||
      !['courses', 'occurrences', 'semesters'].includes(String(parameters.unit))
    ) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'activity-count parameters require count and unit.');
    }
  }

  if (rule.kind === 'course-limit') {
    const parameters = rule.parameters as Partial<CourseLimitRuleParameters>;
    if (!isPositiveInteger(parameters.maxCourses) || parameters.unit !== 'courses' || !parameters.reason) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'course-limit parameters require maxCourses and reason.');
    }
  }

  if (rule.kind === 'declaration-term-required') {
    const parameters = rule.parameters as Partial<DeclarationTermRequiredRuleParameters>;
    if (
      parameters.missingContext !== 'declarationTerm' ||
      !parameters.missingTermRequirementId ||
      !parameters.missingTermLabel ||
      !parameters.missingTermHint
    ) {
      pushIssue(
        issues,
        rule.id,
        'invalid-parameters',
        'declaration-term-required parameters require declaration term metadata.',
      );
    }
  }

  if (rule.kind === 'thesis-research') {
    const parameters = rule.parameters as Partial<ThesisResearchRuleParameters>;
    if (
      typeof parameters.suffix !== 'string' ||
      parameters.suffix.trim().length === 0 ||
      !isPositiveInteger(parameters.requiredCount) ||
      parameters.unit !== 'courses' ||
      !isPositiveInteger(parameters.sourceRequiredCredits)
    ) {
      pushIssue(issues, rule.id, 'invalid-parameters', 'thesis-research parameters require suffix and counts.');
    }
  }
}

function validateEntryYearRange(
  rule: RuleCatalogRule,
  range: EntryYearRange | undefined,
  issues: RuleCatalogValidationIssue[],
): void {
  if (!range) return;

  if (!hasEntryYearBoundary(range)) {
    pushIssue(issues, rule.id, 'invalid-entry-year-range', 'entryYear must include from or to.');
    return;
  }

  if (range.from !== undefined && !isPositiveInteger(range.from)) {
    pushIssue(issues, rule.id, 'invalid-entry-year-range', 'entryYear.from must be a positive integer.');
  }
  if (range.to !== undefined && !isPositiveInteger(range.to)) {
    pushIssue(issues, rule.id, 'invalid-entry-year-range', 'entryYear.to must be a positive integer.');
  }
  if (range.from !== undefined && range.to !== undefined && range.from > range.to) {
    pushIssue(issues, rule.id, 'invalid-entry-year-range', 'entryYear.from must be before entryYear.to.');
  }
}

function validateAcademicTermRange(
  rule: RuleCatalogRule,
  range: AcademicTermRange | undefined,
  issues: RuleCatalogValidationIssue[],
): void {
  if (!range) return;

  if (!hasAcademicTermBoundary(range)) {
    pushIssue(issues, rule.id, 'invalid-declaration-term-range', 'declarationTerm must include from or to.');
    return;
  }

  if (range.from && !isValidAcademicTerm(range.from)) {
    pushIssue(issues, rule.id, 'invalid-declaration-term-range', 'declarationTerm.from is invalid.');
  }
  if (range.to && !isValidAcademicTerm(range.to)) {
    pushIssue(issues, rule.id, 'invalid-declaration-term-range', 'declarationTerm.to is invalid.');
  }
  if (range.from && range.to && compareAcademicTerms(range.from, range.to) > 0) {
    pushIssue(
      issues,
      rule.id,
      'invalid-declaration-term-range',
      'declarationTerm.from must be before declarationTerm.to.',
    );
  }
}

function validateApplicability(
  rule: RuleCatalogRule,
  issues: RuleCatalogValidationIssue[],
  publishable: boolean,
): void {
  if (!hasExplicitApplicability(rule.appliesTo)) {
    if (publishable) {
      pushIssue(
        issues,
        rule.id,
        'missing-applies-to',
        'Publishable catalog rules must include appliesTo with allCohorts or a concrete condition.',
      );
    }
    return;
  }

  if (rule.appliesTo?.allCohorts === true && rule.appliesTo.entryYear) {
    pushIssue(issues, rule.id, 'conflicting-applies-to', 'allCohorts cannot be combined with an entryYear range.');
  }

  validateEntryYearRange(rule, rule.appliesTo?.entryYear, issues);
  validateAcademicTermRange(rule, rule.appliesTo?.declarationTerm, issues);

  if (rule.appliesTo?.effectiveFrom && !isValidAcademicTerm(rule.appliesTo.effectiveFrom)) {
    pushIssue(issues, rule.id, 'invalid-effective-from', 'effectiveFrom must be a valid academic term.');
  }
}

export function validateRuleCatalog(
  rules: readonly RuleCatalogRule[],
  options: RuleCatalogValidationOptions = {},
): RuleCatalogValidationResult {
  const issues: RuleCatalogValidationIssue[] = [];
  const publishable = options.publishable === true;
  const evaluatorRegistry = options.evaluatorRegistry ?? RULE_EVALUATOR_REGISTRY;
  const evaluatorIds = new Set(options.evaluatorIds ?? Object.keys(evaluatorRegistry));

  validateUniqueRuleIds(rules, issues);

  rules.forEach((rule) => {
    validateSourceRefs(rule, issues, publishable);
    validateScope(rule, issues, publishable);
    validateParameters(rule, issues, publishable);
    validateApplicability(rule, issues, publishable);

    if (rule.evaluatorId && !evaluatorIds.has(rule.evaluatorId)) {
      pushIssue(issues, rule.id, 'unknown-evaluator-id', `Unknown evaluatorId: ${rule.evaluatorId}.`);
    }

    const evaluatorDefinition = rule.evaluatorId ? evaluatorRegistry[rule.evaluatorId] : undefined;
    evaluatorDefinition?.validateRule(rule).forEach((issue) => {
      pushIssue(issues, rule.id, 'invalid-evaluator-contract', issue.message);
    });
  });

  return { ok: issues.length === 0, issues };
}

export function defineRuleCatalog<T extends readonly RuleCatalogRule[]>(
  rules: T,
  options: RuleCatalogValidationOptions = { publishable: true },
): T {
  const result = validateRuleCatalog(rules, options);
  if (!result.ok) {
    const details = result.issues.map((issue) => `${issue.ruleId}: ${issue.message}`).join('\n');
    throw new Error(`Invalid graduation rule catalog:\n${details}`);
  }
  return rules;
}
