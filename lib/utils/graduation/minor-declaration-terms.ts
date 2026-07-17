import type { MinorDeclarationTerms } from '@lib/types/grad';

export const DECLARATION_TERM_REQUIRED_MINOR_CODES = ['AI', 'IR'] as const;

const DECLARATION_TERM_REQUIRED_MINOR_SET = new Set<string>(DECLARATION_TERM_REQUIRED_MINOR_CODES);

function normalizeMinorCode(code?: string): string {
  return String(code ?? '')
    .trim()
    .toUpperCase();
}

export function requiresMinorDeclarationTerm(code?: string): boolean {
  return DECLARATION_TERM_REQUIRED_MINOR_SET.has(normalizeMinorCode(code));
}

export function getDeclarationTermRequiredMinors(selectedMinors: string[] = []): string[] {
  return selectedMinors.map(normalizeMinorCode).filter(requiresMinorDeclarationTerm);
}

export function pruneMinorDeclarationTerms(
  terms: MinorDeclarationTerms | undefined,
  selectedMinors: string[] = [],
): MinorDeclarationTerms {
  const requiredMinors = getDeclarationTermRequiredMinors(selectedMinors);

  return requiredMinors.reduce<MinorDeclarationTerms>((acc, minorCode) => {
    const term = terms?.[minorCode];
    const year = Number(term?.year);
    const semester = String(term?.semester ?? '').trim();

    if (Number.isFinite(year) && year > 1900 && semester) {
      acc[minorCode] = { year, semester };
    }

    return acc;
  }, {});
}
