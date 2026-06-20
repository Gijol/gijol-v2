import type {
  AcademicTerm,
  CatalogNeedsContextSummary,
  CatalogRuleSelectionSummary,
  GraduationCatalogSelectionSummary,
  MinorDeclarationTerms,
  RequirementSource,
} from '../types';
import { COMPILED_GRADUATION_RULE_CATALOG } from './catalog';
import {
  selectRulesForContext,
  type RuleCatalogNeedsContextItem,
  type RuleCatalogSelection,
} from './compiler';
import type {
  RequirementContext,
  RequirementContextProgramCodes,
  RuleCatalogRule,
  RuleProgramKind,
} from './schema';

export interface GraduationCatalogSelectionInput {
  entryYear: number;
  userMajor?: string;
  userMinors?: readonly string[];
  minorDeclarationTerms?: MinorDeclarationTerms;
  evaluationTerm?: AcademicTerm;
}

function normalizeProgramCode(value?: string | null): string {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '');
}

function getMinorDeclarationTerm(
  minorCode: string,
  terms?: MinorDeclarationTerms,
): AcademicTerm | undefined {
  if (!terms) return undefined;

  const normalizedMinorCode = normalizeProgramCode(minorCode);
  return (
    terms[minorCode] ??
    terms[normalizedMinorCode] ??
    terms[Object.keys(terms).find((key) => normalizeProgramCode(key) === normalizedMinorCode) ?? '']
  );
}

function isRuleForProgramKind(rule: RuleCatalogRule, programKind: RuleProgramKind): boolean {
  return rule.scope?.type !== 'global' && rule.scope?.programKind === programKind;
}

function summarizeRule(rule: RuleCatalogRule): CatalogRuleSelectionSummary {
  return {
    id: rule.id,
    kind: rule.kind,
    label: rule.label,
    scope: rule.scope,
    appliesTo: rule.appliesTo,
    evaluatorId: rule.evaluatorId,
    sourceRefs: rule.sourceRefs,
  };
}

function sourceRefKey(sourceRef: RequirementSource): string {
  return [sourceRef.manualYear, sourceRef.page, sourceRef.path, sourceRef.note ?? ''].join('|');
}

function addSelection(
  selection: RuleCatalogSelection,
  target: {
    applicableById: Map<string, CatalogRuleSelectionSummary>;
    needsContextById: Map<string, CatalogNeedsContextSummary>;
    sourceRefsByKey: Map<string, RequirementSource>;
  },
  filterRule?: (rule: RuleCatalogRule) => boolean,
): void {
  selection.applicableRules.forEach((rule) => {
    if (filterRule && !filterRule(rule)) return;
    const summary = summarizeRule(rule);
    target.applicableById.set(summary.id, summary);
    target.needsContextById.delete(summary.id);
    summary.sourceRefs?.forEach((sourceRef) => {
      target.sourceRefsByKey.set(sourceRefKey(sourceRef), sourceRef);
    });
  });

  selection.needsContext.forEach(({ rule, applicability }: RuleCatalogNeedsContextItem) => {
    if (filterRule && !filterRule(rule)) return;
    if (target.applicableById.has(rule.id)) return;
    const summary = summarizeRule(rule);
    target.needsContextById.set(summary.id, {
      rule: summary,
      missingContext: applicability.missingContext ?? [],
    });
    summary.sourceRefs?.forEach((sourceRef) => {
      target.sourceRefsByKey.set(sourceRefKey(sourceRef), sourceRef);
    });
  });
}

function buildBaseProgramCodes(
  userMajor: string | undefined,
): RequirementContextProgramCodes {
  return {
    ...(userMajor ? { major: [userMajor] } : {}),
    minor: [],
  };
}

export function buildGraduationCatalogSelectionSummary(
  input: GraduationCatalogSelectionInput,
): GraduationCatalogSelectionSummary {
  const userMajor = normalizeProgramCode(input.userMajor) || undefined;
  const userMinors = Array.from(new Set((input.userMinors ?? []).map(normalizeProgramCode).filter(Boolean)));
  const baseProgramCodes = buildBaseProgramCodes(userMajor);
  const declarationTerms: Partial<Record<RuleProgramKind, AcademicTerm | undefined>> = {};

  const target = {
    applicableById: new Map<string, CatalogRuleSelectionSummary>(),
    needsContextById: new Map<string, CatalogNeedsContextSummary>(),
    sourceRefsByKey: new Map<string, RequirementSource>(),
  };

  const baseContext: RequirementContext = {
    entryYear: input.entryYear,
    programCodes: baseProgramCodes,
    evaluationTerm: input.evaluationTerm,
  };
  addSelection(selectRulesForContext(COMPILED_GRADUATION_RULE_CATALOG, baseContext), target);

  userMinors.forEach((minorCode) => {
    const declarationTerm = getMinorDeclarationTerm(minorCode, input.minorDeclarationTerms);
    if (userMinors.length === 1) {
      declarationTerms.minor = declarationTerm;
    }

    const minorContext: RequirementContext = {
      entryYear: input.entryYear,
      programCodes: {
        major: [],
        minor: [minorCode],
      },
      declarationTerm,
      declarationTerms: {
        minor: declarationTerm,
      },
      evaluationTerm: input.evaluationTerm,
    };

    addSelection(
      selectRulesForContext(COMPILED_GRADUATION_RULE_CATALOG, minorContext),
      target,
      (rule) => isRuleForProgramKind(rule, 'minor'),
    );
  });

  return {
    context: {
      entryYear: input.entryYear,
      programCodes: {
        ...baseProgramCodes,
        ...(userMinors.length > 0 ? { minor: userMinors } : {}),
      },
      ...(Object.keys(declarationTerms).length > 0 ? { declarationTerms } : {}),
      ...(input.evaluationTerm ? { evaluationTerm: input.evaluationTerm } : {}),
    },
    applicableRules: Array.from(target.applicableById.values()),
    needsContext: Array.from(target.needsContextById.values()),
    sourceRefs: Array.from(target.sourceRefsByKey.values()).sort((a, b) => {
      if (a.manualYear !== b.manualYear) return a.manualYear - b.manualYear;
      if (a.page !== b.page) return a.page - b.page;
      return a.path.localeCompare(b.path);
    }),
  };
}
