import { matchesMinor } from '../features/graduation/domain/classifier';
import { course, evaluateFor, expectRequirement } from './helpers/graduation-fixtures';

it('recognizes cross-listed AI4020 as the same required Artificial Intelligence subject', async () => {
  const result = await evaluateFor(2021, [course({ courseCode: 'AI4020', year: 2024 })], {
    userMinors: ['AI'],
    minorDeclarationTerms: { AI: { year: 2024, semester: '1' } },
  });
  expectRequirement(result, 'minor-mandatory-rule-AI-0', { satisfied: true });
});
it('maps the 2020 MC3212 laboratory I without counting laboratory I twice', async () => {
  const taken = ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3212', 'MC3107'].map((code) =>
    course({ courseCode: code, year: code === 'MC3212' ? 2020 : 2021 }),
  );
  const result = await evaluateFor(2020, taken, { userMajor: 'MC' });
  expectRequirement(result, 'major-mandatory-rule-MC-0', { satisfied: true, acquiredCredits: 6 });
  const duplicate = await evaluateFor(
    2020,
    [...taken.filter((c) => c.courseCode !== 'MC3107'), course({ courseCode: 'MC3106' })],
    { userMajor: 'MC' },
  );
  expectRequirement(duplicate, 'major-mandatory-rule-MC-0', { satisfied: false, acquiredCredits: 5 });
});
it.each([2020, 2021])(
  'applies GS2003 combined mathematics transition without double-counting foundation credits (%s)',
  async (entryYear) => {
    const taken = [
      course({ courseCode: 'GS2003', year: entryYear }),
      ...['MM2001', 'MM3101', 'MM3201', 'MM3203', 'MM3202'].map((code) => course({ courseCode: code, year: 2020 })),
    ];
    if (entryYear === 2021) taken.push(course({ courseCode: 'MM4005' }));
    const result = await evaluateFor(entryYear, taken, { userMinors: ['MM'] });
    expectRequirement(result, 'science-core-math', { satisfied: true });
    expectRequirement(result, 'minor-mandatory-rule-MM-0', { satisfied: true, requiredCredits: 2 });
    expectRequirement(result, 'minor-mm-electives', { satisfied: true, requiredCredits: entryYear === 2020 ? 6 : 9 });
    expectRequirement(result, 'minor-credits-MM', { satisfied: true, acquiredCredits: entryYear === 2020 ? 15 : 18 });
  },
);
it('uses the latest explicit 2018+ MA rule without imposing the removed MA2101 requirement', async () => {
  const result = await evaluateFor(
    2020,
    ['MA2102', 'MA2104', 'MA3207', 'MA3203', 'MA3204'].map((courseCode) => course({ courseCode })),
    { userMinors: ['MA'] },
  );
  expectRequirement(result, 'minor-mandatory-rule-MA-0', { satisfied: true });
  expectRequirement(result, 'minor-ma-upper-level', { satisfied: true });
});
it('does not grant old AI colloquium credit for an unverified post-reform completion', async () => {
  const result = await evaluateFor(2021, [course({ courseCode: 'AI2002', credit: 1, year: 2025 })], {
    userMinors: ['AI'],
    minorDeclarationTerms: { AI: { year: 2024, semester: '1' } },
  });
  expectRequirement(result, 'minor-credits-AI', { acquiredCredits: 0 });
  expectRequirement(result, 'minor-history-review-AI', { status: 'needs_review' });
});

it('does not assign an unverified MM course or the legacy MB typo to the mathematics minor', () => {
  expect(matchesMinor('MM3767', 'MM')).toBe(false);
  expect(matchesMinor('MM3999', 'MM')).toBe(false);
  expect(matchesMinor('MM3203', 'MM')).toBe(true);
  expect(matchesMinor('MB3767', 'LH_MB')).toBe(true);
});

it('requires the old energy declaration and flags attempts after new declarations closed', async () => {
  const missing = await evaluateFor(2021, [], { userMinors: ['FE'] });
  expectRequirement(missing, 'minor-declaration-term-FE', { status: 'needs_review' });
  const later = await evaluateFor(2021, [], {
    userMinors: ['FE'],
    minorDeclarationTerms: { FE: { year: 2025, semester: '1' } },
  });
  expectRequirement(later, 'minor-declaration-closed-FE', { status: 'needs_review' });
  const old = await evaluateFor(2021, [], {
    userMinors: ['FE'],
    minorDeclarationTerms: { FE: { year: 2024, semester: '2' } },
  });
  expect(
    old.fineGrainedRequirements.some(
      (r) => r.id === 'minor-declaration-closed-FE' || r.id === 'minor-declaration-term-FE',
    ),
  ).toBe(false);
});
