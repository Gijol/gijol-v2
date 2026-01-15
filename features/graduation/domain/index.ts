/**
 * Domain Layer Exports
 * Re-exports all domain types, rules, classifier, and requirements
 */

// Types
export * from './types';

// Rules
export { pickRuleSet, ruleSet2021Plus, ruleSet2018to2020 } from './rules';

// Classifier
export { classifyCourse } from './classifier';

// Requirements
export { buildFineGrainedRequirements } from './requirements';
export type { AnalyzeContext } from './requirements';

// Engine
export { evaluateGraduationStatus } from './engine';
