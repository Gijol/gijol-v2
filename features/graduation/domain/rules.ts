/**
 * Graduation Rules - Embedded from legacy grad-rules.ts
 * Contains year-based rule sets and rule selection logic
 */

import type { CategoryKey, CategoryRule, YearRuleSet } from './types';

// ===== Rule Sets =====

export const ruleSet2021Plus: YearRuleSet = {
  name: '2021학번 이후',
  minTotalCredits: 130,
  minGpaForGraduation: 2.0,
  categories: [
    { key: 'languageBasic', minCredits: 7 },
    { key: 'humanities', minCredits: 24 },
    { key: 'scienceBasic', minCredits: 17 },
    { key: 'major', minCredits: 36 },
    { key: 'minor', minCredits: 0, optional: true },
    { key: 'etcMandatory', minCredits: 8 },
    { key: 'otherUncheckedClass', minCredits: 0, optional: true },
  ],
};

export const ruleSet2018to2020: YearRuleSet = {
  name: '2018~2020학번',
  minTotalCredits: 130,
  minGpaForGraduation: 2.0,
  categories: [
    { key: 'languageBasic', minCredits: 7 },
    { key: 'humanities', minCredits: 24 },
    { key: 'scienceBasic', minCredits: 17 },
    { key: 'major', minCredits: 36 },
    { key: 'minor', minCredits: 0, optional: true },
    { key: 'etcMandatory', minCredits: 8 },
    { key: 'otherUncheckedClass', minCredits: 0, optional: true },
  ],
};

// ===== Rule Selection =====

export function pickRuleSet(entryYear: number): YearRuleSet {
  if (entryYear >= 2021) return ruleSet2021Plus;
  if (entryYear >= 2018 && entryYear <= 2020) return ruleSet2018to2020;
  return ruleSet2018to2020; // Default fallback
}

// Re-export types for convenience
export type { CategoryKey, CategoryRule, YearRuleSet };
