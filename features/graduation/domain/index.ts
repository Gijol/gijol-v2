/**
 * Domain Layer Exports
 * Re-exports all domain types, rules, classifier, and requirements
 */

// Types
export * from './types';

// Rules
export { pickRuleSet, ruleSet2021Plus, ruleSet2018to2020 } from './rules';
export {
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

// Classifier
export { classifyCourse } from './classifier';
export { inferMajorCodeFromCourses, resolveMajorCode, resolveMajorForEvaluation } from './academic-context';
export type { MajorResolution, MajorResolutionStatus } from './academic-context';

// Requirements
export { buildFineGrainedRequirements } from './requirements';
export type { AnalyzeContext } from './requirements';

// Engine
export { evaluateGraduationStatus } from './engine';
