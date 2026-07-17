import type {
  CourseLimitRuleParameters,
  RuleCatalogRule,
  RuleCatalogRuleKind,
  RuleCatalogScope,
} from './schema';

export interface RuleEvaluatorContractIssue {
  message: string;
}

export interface RuleEvaluatorDefinition {
  id: string;
  label: string;
  description: string;
  requiredKind: RuleCatalogRuleKind;
  parameterContract: string;
  scopeContract?: RuleCatalogScope;
  validateRule: (rule: RuleCatalogRule) => readonly RuleEvaluatorContractIssue[];
}

export type RuleEvaluatorRegistry = Readonly<Record<string, RuleEvaluatorDefinition>>;

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value && value > 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isCourseLimitRuleParameters(value: unknown): value is CourseLimitRuleParameters {
  if (typeof value !== 'object' || value === null) return false;
  const parameters = value as Partial<CourseLimitRuleParameters>;
  return (
    isPositiveInteger(parameters.maxCourses) &&
    parameters.unit === 'courses' &&
    isNonEmptyString(parameters.reason)
  );
}

function matchesProgramScope(
  scope: RuleCatalogRule['scope'],
  programKind: 'major' | 'minor',
  programCodes: readonly string[],
): boolean {
  if (!scope || scope.type !== 'program' || scope.programKind !== programKind) return false;
  const actualCodes = scope.programCodes.map((code) => code.toUpperCase()).sort();
  const expectedCodes = programCodes.map((code) => code.toUpperCase()).sort();
  return (
    actualCodes.length === expectedCodes.length &&
    actualCodes.every((code, index) => code === expectedCodes[index])
  );
}

function validateIrAiCodeCourseLimit(rule: RuleCatalogRule): readonly RuleEvaluatorContractIssue[] {
  const issues: RuleEvaluatorContractIssue[] = [];

  if (rule.kind !== 'course-limit') {
    issues.push({ message: 'ir-ai-code-course-limit evaluator requires a course-limit rule.' });
  }

  if (!matchesProgramScope(rule.scope, 'minor', ['IR'])) {
    issues.push({ message: 'ir-ai-code-course-limit evaluator requires IR minor program scope.' });
  }

  if (!isCourseLimitRuleParameters(rule.parameters)) {
    issues.push({ message: 'ir-ai-code-course-limit evaluator requires CourseLimitRuleParameters.' });
  }

  return issues;
}

export const RULE_EVALUATOR_REGISTRY: RuleEvaluatorRegistry = Object.freeze({
  'ir-ai-code-course-limit': {
    id: 'ir-ai-code-course-limit',
    label: 'IR AI-code course limit',
    description: 'Limits AI-code designated courses that can count toward the Intelligent Robotics minor.',
    requiredKind: 'course-limit',
    parameterContract: 'CourseLimitRuleParameters',
    scopeContract: { type: 'program', programKind: 'minor', programCodes: ['IR'] },
    validateRule: validateIrAiCodeCourseLimit,
  },
});

export function getRuleEvaluatorDefinition(evaluatorId: string): RuleEvaluatorDefinition | undefined {
  return RULE_EVALUATOR_REGISTRY[evaluatorId];
}
