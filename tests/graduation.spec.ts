// import { describe, it, expect } from 'vitest';
// import { evaluateGraduation } from '../src/lib/graduation/engine';
// import type { GraduationInput } from '../src/lib/graduation/types';
//
// import input from './fixtures/input-20205098.json'; // 아래 fixture 참고
//
// describe('evaluateGraduation', () => {
//   it('selects ruleset by entry year (2020 -> 2018-2020)', () => {
//     const out = evaluateGraduation(input as GraduationInput);
//     expect(out.state.gradStatus.appliedRuleSetId).toBe('2018-2020');
//   });
//
//   it('computes total credits = 111', () => {
//     const out = evaluateGraduation(input as GraduationInput);
//     expect(out.state.gradStatus.totalCredits).toBe(111);
//   });
//
//   it('matches sample category totals/satisfaction', () => {
//     const out = evaluateGraduation(input as GraduationInput);
//     const cat = out.state.gradStatus.graduationCategory;
//
//     expect(cat.languageBasic.totalCredits).toBe(7);
//     expect(cat.languageBasic.satisfied).toBe(true);
//
//     expect(cat.scienceBasic.totalCredits).toBe(35);
//     expect(cat.scienceBasic.satisfied).toBe(true);
//
//     expect(cat.major.totalCredits).toBe(25);
//     expect(cat.major.satisfied).toBe(false);
//
//     expect(cat.humanities.totalCredits).toBe(29);
//     expect(cat.humanities.satisfied).toBe(true);
//
//     expect(cat.etcMandatory.totalCredits).toBe(3);
//     expect(cat.etcMandatory.satisfied).toBe(false);
//
//     expect(cat.otherUncheckedClass.totalCredits).toBe(12);
//   });
// });
export {};
