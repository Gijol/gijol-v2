import {
  getDeclarationTermRequiredMinors,
  pruneMinorDeclarationTerms,
  requiresMinorDeclarationTerm,
} from '../lib/utils/graduation/minor-declaration-terms';

describe('minor declaration term helpers', () => {
  it('requires declaration terms only for declaration-sensitive minors', () => {
    expect(requiresMinorDeclarationTerm('AI')).toBe(true);
    expect(requiresMinorDeclarationTerm('ir')).toBe(true);
    expect(requiresMinorDeclarationTerm('FE')).toBe(true);
    expect(requiresMinorDeclarationTerm('EC')).toBe(false);
  });

  it('returns selected declaration-sensitive minors in normalized form', () => {
    expect(getDeclarationTermRequiredMinors(['ec', 'ir', 'AI'])).toEqual(['IR', 'AI']);
  });

  it('keeps only complete terms for currently selected declaration-sensitive minors', () => {
    expect(
      pruneMinorDeclarationTerms(
        {
          AI: { year: 2025, semester: '2' },
          IR: { year: 202, semester: '1' },
          EC: { year: 2024, semester: '1' },
        },
        ['AI', 'IR', 'EC'],
      ),
    ).toEqual({
      AI: { year: 2025, semester: '2' },
    });
  });
});

it('preserves an existing energy declaration across form submission', () => {
  expect(pruneMinorDeclarationTerms({ FE: { year: 2024, semester: '2' } }, ['FE'])).toEqual({
    FE: { year: 2024, semester: '2' },
  });
});
