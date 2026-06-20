/**
 * Domain Layer Exports
 * Re-exports all domain types, rules, classifier, and requirements
 */

// Types
export * from './types';

// Rules
export { pickRuleSet, ruleSet2021Plus, ruleSet2018to2020 } from './rules';
export {
  BASIC_REQUIREMENT_CATALOG_RULES,
  BASIC_REQUIREMENT_CATALOG,
  buildYearRuleSetFromBasicCatalog,
  getBasicRequirementCatalog,
} from './rule-catalog/basic-requirements';
export type { BasicRequirementCatalog } from './rule-catalog/basic-requirements';
export {
  ACADEMIC_PROGRAMS,
  MAJOR_PROGRAMS,
  MINOR_PROGRAMS,
  findMajorProgram,
  findMinorProgram,
  getCourseCodesForProgram,
  getMajorCodes,
  getMajorCoursePrefixes,
  getMajorOptions,
  getMajorProgramByCode,
  getMinorOptions,
  getMinorProgramByCode,
} from './rule-catalog/academic-programs';
export type {
  AcademicProgramDefinition,
  AcademicProgramKind,
  AcademicProgramOption,
} from './rule-catalog/academic-programs';
export {
  CATALOG_SOURCE_LAYERS,
  CATALOG_SOURCE_LAYER_PUBLISH_SNAPSHOT,
  createCatalogSourceLayerPublishSnapshot,
  defineCatalogSourceLayers,
  validateCatalogSourceLayers,
  validateJsonSerializableCatalogSourceLayers,
} from './rule-catalog/catalog-source-layers';
export type {
  CatalogSourceLayer,
  CatalogSourceLayerPublishSnapshot,
  CatalogSourceLayerValidationIssue,
  CatalogSourceLayerValidationIssueCode,
  CatalogSourceLayerValidationResult,
} from './rule-catalog/catalog-source-layers';
export {
  CATALOG_SOURCE_PAGE_AUDITS,
} from './rule-catalog/catalog-source-page-audit';
export type {
  CatalogSourcePageAudit,
  CatalogSourcePageAuditStatus,
} from './rule-catalog/catalog-source-page-audit';
export {
  COURSE_EQUIVALENCY_CATALOG,
  COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT,
  createCourseEquivalencyPublishSnapshot,
  defineCourseEquivalencyCatalog,
  validateCourseEquivalencyCatalog,
  validateJsonSerializableCourseEquivalencyCatalog,
} from './rule-catalog/course-equivalencies';
export type {
  CourseEquivalency,
  CourseEquivalencyPublishSnapshot,
  CourseEquivalencyRelationType,
  CourseEquivalencyValidationIssue,
  CourseEquivalencyValidationIssueCode,
  CourseEquivalencyValidationResult,
  CrossListedCourseEquivalency,
  LegacyEquivalentCourseEquivalency,
  RenumberedCourseEquivalency,
  SameCourseEquivalency,
  SubstituteCourseEquivalency,
} from './rule-catalog/course-equivalencies';
export {
  KNOWN_RULE_EVALUATOR_IDS,
  RULE_PROGRAM_KINDS,
  defineRuleCatalog,
  getDeclarationTermForProgramKind,
  getProgramCodesForProgramKind,
  validateRuleCatalog,
} from './rule-catalog/schema';
export {
  RULE_EVALUATOR_REGISTRY,
  getRuleEvaluatorDefinition,
} from './rule-catalog/rule-evaluator-registry';
export type {
  RuleEvaluatorContractIssue,
  RuleEvaluatorDefinition,
  RuleEvaluatorRegistry,
} from './rule-catalog/rule-evaluator-registry';
export type {
  ActivityCountRuleParameters,
  ConditionalCreditMinimumRuleParameters,
  CourseCountRuleParameters,
  CourseCreditRuleParameters,
  CourseLimitRuleParameters,
  CreditMinimumRuleParameters,
  DeclarationTermRequiredRuleParameters,
  GpaMinimumRuleParameters,
  RuleCatalogRule,
  RuleCatalogRuleKind,
  RuleCatalogParameters,
  RuleCatalogScope,
  RuleCatalogValidationIssue,
  RuleCatalogValidationIssueCode,
  RuleCatalogValidationOptions,
  RuleCatalogValidationResult,
  RuleEvaluatorId,
  RuleProgramKind,
  RequirementContextProgramCodes,
  SourceBackedRule,
  ThesisResearchRuleParameters,
} from './rule-catalog/schema';
export {
  RuleCatalogCompileError,
  compileRuleCatalog,
  evaluateRuleApplicability,
  selectRulesForContext,
} from './rule-catalog/compiler';
export type {
  CompiledRuleCatalog,
  RuleApplicability,
  RuleApplicabilityMissingContext,
  RuleApplicabilityStatus,
  RuleCatalogNeedsContextItem,
  RuleCatalogSelection,
} from './rule-catalog/compiler';
export {
  buildGraduationCatalogSelectionSummary,
} from './rule-catalog/selection-adapter';
export type {
  GraduationCatalogSelectionInput,
} from './rule-catalog/selection-adapter';
export {
  COMPILED_GRADUATION_RULE_CATALOG,
  GRADUATION_RULE_CATALOG,
  GRADUATION_RULE_CATALOG_PUBLISH_SNAPSHOT,
} from './rule-catalog/catalog';
export {
  GRADUATION_CATALOG_PUBLISH_BUNDLE,
  GraduationCatalogPublishBundleValidationError,
  createGraduationCatalogPublishBundle,
  stringifyGraduationCatalogPublishBundle,
  validateGraduationCatalogPublishBundle,
} from './rule-catalog/publish-bundle';
export type {
  GraduationCatalogPublishBundle,
  GraduationCatalogPublishBundleValidationIssue,
  GraduationCatalogPublishBundleValidationIssueCode,
  GraduationCatalogPublishBundleValidationResult,
} from './rule-catalog/publish-bundle';
export {
  formatGraduationCatalogInspection,
  inspectGraduationCatalogPublishBundle,
} from './rule-catalog/inspect';
export type {
  GraduationCatalogInspection,
  SourcePageAuditInspection,
  SourceLayerInspection,
} from './rule-catalog/inspect';
export {
  renderGraduationCatalogReportHtml,
} from './rule-catalog/report';
export {
  diffGraduationCatalogPublishBundles,
  formatGraduationCatalogSnapshotDiff,
} from './rule-catalog/diff';
export type {
  CatalogEntityDiff,
  GraduationCatalogSnapshotDiff,
} from './rule-catalog/diff';
export {
  RuleCatalogSerializationError,
  createRuleCatalogPublishSnapshot,
  stringifyRuleCatalogPublishSnapshot,
  validateJsonSerializableValue,
  validateJsonSerializableRuleCatalog,
} from './rule-catalog/serialization';
export type {
  RuleCatalogJsonPrimitive,
  RuleCatalogJsonValue,
  RuleCatalogPublishSnapshot,
  RuleCatalogSerializationIssue,
  RuleCatalogSerializationIssueCode,
  RuleCatalogSerializationResult,
} from './rule-catalog/serialization';
export {
  IR_AI_CODE_COURSE_LIMIT_REQUIREMENT,
  MAJOR_CREDIT_REQUIREMENTS,
  MAJOR_MINOR_REQUIREMENT_CATALOG_RULES,
  MAJOR_MANDATORY_RULES,
  MINOR_CREDIT_REQUIREMENTS,
  MINOR_DECLARATION_TERM_REQUIREMENTS,
  MINOR_MANDATORY_RULES,
  THESIS_REQUIREMENT_TEMPLATES,
  getMajorCreditRequirement,
  getMajorMandatoryRulesForContext,
  getMinorCourseLimitRequirement,
  getMinorCreditRequirement,
  getMinorDeclarationTermRequirement,
  getMinorMandatoryRulesForContext,
  getThesisRequirements,
  requiresMinorDeclarationTerm,
} from './rule-catalog/major-minor-requirements';
export type {
  AcademicTermRange,
  CreditRequirement,
  EntryYearRange,
  MandatoryCourseRule,
  MinorCourseLimitRequirement,
  MinorDeclarationTermRequirement,
  RequirementCondition,
  RequirementContext,
  ThesisRequirement,
} from './rule-catalog/major-minor-requirements';

// Classifier
export { classifyCourse } from './classifier';
export { inferMajorCodeFromCourses, resolveMajorCode, resolveMajorForEvaluation } from './academic-context';
export type { MajorResolution, MajorResolutionStatus } from './academic-context';

// Requirements
export { buildFineGrainedRequirements } from './requirements';
export type { AnalyzeContext } from './requirements';

// Engine
export { evaluateGraduationStatus } from './engine';
