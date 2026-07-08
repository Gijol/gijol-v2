import type { AcademicTerm, RequirementSource } from '../types';
import { validateJsonSerializableValue, type RuleCatalogSerializationResult } from './serialization';

export type CourseEquivalencyRelationType =
  | 'crossListed'
  | 'renumbered'
  | 'legacyEquivalent'
  | 'sameCourse'
  | 'substitute';

interface CourseEquivalencyBase {
  id: string;
  relation: CourseEquivalencyRelationType;
  sourceRefs: readonly RequirementSource[];
  note?: string;
}

export interface CrossListedCourseEquivalency extends CourseEquivalencyBase {
  relation: 'crossListed';
  courseCodes: readonly string[];
}

export interface RenumberedCourseEquivalency extends CourseEquivalencyBase {
  relation: 'renumbered';
  fromCourseCode: string;
  toCourseCode: string;
  effectiveFrom?: AcademicTerm;
}

export interface LegacyEquivalentCourseEquivalency extends CourseEquivalencyBase {
  relation: 'legacyEquivalent';
  fromCourseCode: string;
  toCourseCode: string;
}

export interface SameCourseEquivalency extends CourseEquivalencyBase {
  relation: 'sameCourse';
  courseCodes: readonly string[];
}

export interface SubstituteCourseEquivalency extends CourseEquivalencyBase {
  relation: 'substitute';
  fromCourseCode: string;
  toCourseCode: string;
}

export type CourseEquivalency =
  | CrossListedCourseEquivalency
  | RenumberedCourseEquivalency
  | LegacyEquivalentCourseEquivalency
  | SameCourseEquivalency
  | SubstituteCourseEquivalency;

export type CourseEquivalencyValidationIssueCode =
  | 'duplicate-equivalency-id'
  | 'invalid-relation'
  | 'missing-source-ref'
  | 'invalid-source-ref'
  | 'missing-course-code'
  | 'duplicate-course-code'
  | 'invalid-course-code'
  | 'invalid-course-code-pair'
  | 'conflicting-relation-shape'
  | 'invalid-effective-from'
  | 'not-json-serializable';

export interface CourseEquivalencyValidationIssue {
  equivalencyId: string;
  code: CourseEquivalencyValidationIssueCode;
  message: string;
}

export interface CourseEquivalencyValidationResult {
  ok: boolean;
  issues: readonly CourseEquivalencyValidationIssue[];
}

export interface CourseEquivalencyPublishSnapshot {
  schemaVersion: 1;
  equivalencies: readonly CourseEquivalency[];
}

const COURSE_EQUIVALENCY_RELATION_TYPES: readonly CourseEquivalencyRelationType[] = [
  'crossListed',
  'renumbered',
  'legacyEquivalent',
  'sameCourse',
  'substitute',
];

const BACHELOR_MANUAL_2026 = 'docs/bachelor_manual/2026_manual.pdf';

function source(page: number, note: string): RequirementSource {
  return {
    manualYear: 2026,
    page,
    path: BACHELOR_MANUAL_2026,
    note,
  };
}

const chemistryMajorSource = source(23, '화학과 전공필수 동일과목 및 중복수강 불허 안내');
const mathMajorSource = source(23, '수리과학과 전공필수 교차코드 및 대체과목 안내');
const environmentalMajorSource = source(25, '환경·에너지공학과 과거 학번 전공필수 대체 조건');
const bioscienceMajorSource = source(25, '생명과학과 전공필수 변경 전 과목코드 병기');

export const COURSE_EQUIVALENCY_CATALOG = defineCourseEquivalencyCatalog([
  {
    id: 'ch-physical-chemistry-a-same-course',
    relation: 'sameCourse',
    courseCodes: ['CH2102', 'CH3104'],
    sourceRefs: [chemistryMajorSource],
    note: '물리화학 A와 물리화학 II는 동일 과목으로 중복수강이 허용되지 않는다.',
  },
  {
    id: 'ch-inorganic-chemistry-i-same-course',
    relation: 'sameCourse',
    courseCodes: ['CH3208', 'CH3107'],
    sourceRefs: [chemistryMajorSource],
    note: '무기화학 I과 무기화학은 동일 과목으로 중복수강이 허용되지 않는다.',
  },
  {
    id: 'mm-multivariable-analysis-cross-listed',
    relation: 'crossListed',
    courseCodes: ['MM2001', 'GS2001'],
    sourceRefs: [mathMajorSource],
  },
  {
    id: 'mm-differential-equations-cross-listed',
    relation: 'crossListed',
    courseCodes: ['MM2002', 'GS2002'],
    sourceRefs: [mathMajorSource],
  },
  {
    id: 'mm-linear-algebra-cross-listed',
    relation: 'crossListed',
    courseCodes: ['MM2004', 'GS2004'],
    sourceRefs: [mathMajorSource],
  },
  {
    id: 'mm-advanced-multivariable-analysis-substitute',
    relation: 'substitute',
    fromCourseCode: 'MM2011',
    toCourseCode: 'MM2001',
    sourceRefs: [mathMajorSource],
    note: '고급다변수해석학과 응용은 다변수해석학과 응용의 대체과목으로 인정된다.',
  },
  {
    id: 'ev-environmental-transport-same-course',
    relation: 'sameCourse',
    courseCodes: ['EV4106', 'EV3103'],
    sourceRefs: [environmentalMajorSource],
    note: '지구환경이동현상 과목의 병기된 코드다.',
  },
  {
    id: 'ev-heat-mass-transfer-substitute',
    relation: 'substitute',
    fromCourseCode: 'EV4243',
    toCourseCode: 'EV4106',
    sourceRefs: [environmentalMajorSource],
    note: '2018~2023학번 중 지구환경이동현상을 이수하지 않은 경우 열물질전달을 대체 과목으로 수강할 수 있다.',
  },
  {
    id: 'ev-statistics-substitute-for-transport',
    relation: 'substitute',
    fromCourseCode: 'EV3112',
    toCourseCode: 'EV4106',
    sourceRefs: [environmentalMajorSource],
    note: '2018~2023학번 중 지구환경이동현상을 이수하지 않은 경우 환경·에너지과학통계를 대체 이수할 수 있다.',
  },
  {
    id: 'bs-biochemistry-molecular-biology-lab-renumbered',
    relation: 'renumbered',
    fromCourseCode: 'BS3111',
    toCourseCode: 'BS2103',
    sourceRefs: [bioscienceMajorSource],
  },
  {
    id: 'bs-biochemistry-i-renumbered',
    relation: 'renumbered',
    fromCourseCode: 'BS3113',
    toCourseCode: 'BS2104',
    sourceRefs: [bioscienceMajorSource],
  },
] as const);

export const COURSE_EQUIVALENCY_PUBLISH_SNAPSHOT =
  createCourseEquivalencyPublishSnapshot(COURSE_EQUIVALENCY_CATALOG);

function pushIssue(
  issues: CourseEquivalencyValidationIssue[],
  equivalencyId: string,
  code: CourseEquivalencyValidationIssueCode,
  message: string,
): void {
  issues.push({ equivalencyId, code, message });
}

function normalizeCourseCode(value: unknown): string {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value && value > 0;
}

function getSemesterOrder(semester: string): number {
  const normalized = String(semester).trim().toLowerCase();
  if (['1', '1학기', 'spring', '봄'].includes(normalized)) return 1;
  if (['summer', '여름', '여름학기'].includes(normalized)) return 2;
  if (['2', '2학기', 'fall', 'autumn', '가을'].includes(normalized)) return 3;
  if (['winter', '겨울', '겨울학기'].includes(normalized)) return 4;
  return 0;
}

function isValidAcademicTerm(term: AcademicTerm | undefined): term is AcademicTerm {
  return !!term && isPositiveInteger(term.year) && getSemesterOrder(term.semester) > 0;
}

function isKnownRelation(value: unknown): value is CourseEquivalencyRelationType {
  return COURSE_EQUIVALENCY_RELATION_TYPES.includes(value as CourseEquivalencyRelationType);
}

function validateUniqueIds(
  equivalencies: readonly CourseEquivalency[],
  issues: CourseEquivalencyValidationIssue[],
): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  equivalencies.forEach((equivalency) => {
    if (seen.has(equivalency.id)) {
      duplicates.add(equivalency.id);
    }
    seen.add(equivalency.id);
  });

  duplicates.forEach((id) => {
    pushIssue(issues, id, 'duplicate-equivalency-id', `Duplicate course equivalency id: ${id}.`);
  });
}

function validateSourceRefs(
  equivalency: CourseEquivalency,
  issues: CourseEquivalencyValidationIssue[],
): void {
  if (!equivalency.sourceRefs || equivalency.sourceRefs.length === 0) {
    pushIssue(issues, equivalency.id, 'missing-source-ref', 'Course equivalencies must include sourceRefs.');
    return;
  }

  equivalency.sourceRefs.forEach((sourceRef, index) => {
    if (!isPositiveInteger(sourceRef.manualYear) || !isPositiveInteger(sourceRef.page) || !sourceRef.path) {
      pushIssue(
        issues,
        equivalency.id,
        'invalid-source-ref',
        `sourceRefs[${index}] must include manualYear, page, and path.`,
      );
    }
  });
}

function validateCourseCodeList(
  equivalency: CourseEquivalency,
  courseCodes: readonly unknown[] | undefined,
  issues: CourseEquivalencyValidationIssue[],
): void {
  if (!courseCodes || courseCodes.length < 2) {
    pushIssue(issues, equivalency.id, 'missing-course-code', 'Course code groups must include at least two codes.');
    return;
  }

  const normalizedCodes = courseCodes.map(normalizeCourseCode);
  normalizedCodes.forEach((code) => {
    if (!code) {
      pushIssue(issues, equivalency.id, 'invalid-course-code', 'Course codes must be non-empty strings.');
    }
  });

  if (new Set(normalizedCodes).size !== normalizedCodes.length) {
    pushIssue(issues, equivalency.id, 'duplicate-course-code', 'Course code groups must not contain duplicates.');
  }
}

function validateCourseCodePair(
  equivalency: CourseEquivalency,
  fromCourseCode: unknown,
  toCourseCode: unknown,
  issues: CourseEquivalencyValidationIssue[],
): void {
  const from = normalizeCourseCode(fromCourseCode);
  const to = normalizeCourseCode(toCourseCode);

  if (!from || !to) {
    pushIssue(issues, equivalency.id, 'missing-course-code', 'Course code pairs must include from and to codes.');
    return;
  }

  if (from === to) {
    pushIssue(issues, equivalency.id, 'invalid-course-code-pair', 'Course code pairs must use different codes.');
  }
}

function validateRelationShape(
  equivalency: CourseEquivalency,
  issues: CourseEquivalencyValidationIssue[],
): void {
  if (!isKnownRelation(equivalency.relation)) {
    pushIssue(issues, equivalency.id, 'invalid-relation', `Unknown relation: ${String(equivalency.relation)}.`);
    return;
  }

  if (equivalency.relation === 'crossListed' || equivalency.relation === 'sameCourse') {
    if ('fromCourseCode' in equivalency || 'toCourseCode' in equivalency) {
      pushIssue(
        issues,
        equivalency.id,
        'conflicting-relation-shape',
        `${equivalency.relation} relations must not include from/to course code fields.`,
      );
    }
    validateCourseCodeList(equivalency, equivalency.courseCodes, issues);
    return;
  }

  if ('courseCodes' in equivalency) {
    pushIssue(
      issues,
      equivalency.id,
      'conflicting-relation-shape',
      `${equivalency.relation} relations must use from/to course code fields, not courseCodes.`,
    );
  }

  validateCourseCodePair(equivalency, equivalency.fromCourseCode, equivalency.toCourseCode, issues);

  if (
    equivalency.relation === 'renumbered' &&
    equivalency.effectiveFrom &&
    !isValidAcademicTerm(equivalency.effectiveFrom)
  ) {
    pushIssue(issues, equivalency.id, 'invalid-effective-from', 'effectiveFrom must be a valid academic term.');
  }
}

export function validateJsonSerializableCourseEquivalencyCatalog(
  equivalencies: readonly CourseEquivalency[],
): RuleCatalogSerializationResult {
  return validateJsonSerializableValue(equivalencies, '$.equivalencies');
}

export function validateCourseEquivalencyCatalog(
  equivalencies: readonly CourseEquivalency[],
): CourseEquivalencyValidationResult {
  const issues: CourseEquivalencyValidationIssue[] = [];

  validateUniqueIds(equivalencies, issues);

  equivalencies.forEach((equivalency) => {
    validateSourceRefs(equivalency, issues);
    validateRelationShape(equivalency, issues);

    const serialization = validateJsonSerializableValue(equivalency, `$.equivalencies["${equivalency.id}"]`);
    if (!serialization.ok) {
      serialization.issues.forEach((issue) => {
        pushIssue(issues, equivalency.id, 'not-json-serializable', issue.message);
      });
    }
  });

  return { ok: issues.length === 0, issues };
}

export function defineCourseEquivalencyCatalog<T extends readonly CourseEquivalency[]>(equivalencies: T): T {
  const validation = validateCourseEquivalencyCatalog(equivalencies);
  if (!validation.ok) {
    const details = validation.issues.map((issue) => `${issue.equivalencyId}: ${issue.message}`).join('\n');
    throw new Error(`Invalid course equivalency catalog:\n${details}`);
  }
  return equivalencies;
}

export function createCourseEquivalencyPublishSnapshot(
  equivalencies: readonly CourseEquivalency[],
): CourseEquivalencyPublishSnapshot {
  const validation = validateCourseEquivalencyCatalog(equivalencies);
  if (!validation.ok) {
    const details = validation.issues.map((issue) => `${issue.equivalencyId}: ${issue.message}`).join('\n');
    throw new Error(`Invalid course equivalency catalog:\n${details}`);
  }

  return Object.freeze({
    schemaVersion: 1,
    equivalencies: JSON.parse(JSON.stringify(equivalencies)) as readonly CourseEquivalency[],
  });
}
