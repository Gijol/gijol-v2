/**
 * Graduation Rules - Embedded from legacy grad-rules.ts
 * Contains year-based rule sets and rule selection logic
 */

import { buildYearRuleSetFromBasicCatalog } from './rule-catalog/basic-requirements';
import type { CategoryKey, CategoryRule, YearRuleSet } from './types';

// ===== Rule Sets =====

export const ruleSet2021Plus: YearRuleSet = buildYearRuleSetFromBasicCatalog(2021, '2021학번 이후');

export const ruleSet2018to2020: YearRuleSet = buildYearRuleSetFromBasicCatalog(2020, '2018~2020학번');

// ===== Rule Selection =====

export function pickRuleSet(entryYear: number): YearRuleSet {
  if (entryYear >= 2018) return buildYearRuleSetFromBasicCatalog(entryYear);
  return ruleSet2018to2020; // Default fallback
}

// Re-export types for convenience
export type { CategoryKey, CategoryRule, YearRuleSet };
