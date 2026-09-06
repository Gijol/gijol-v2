/** Reproducible structural audit. Findings are review queues, not semantic certification. */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { buildCourseCatalogSnapshotFromWorkspace } from '../../features/course-catalog/node';
import {
  inspectCourseCatalogSnapshot,
  inspectCourseCatalogQuality,
  validateCourseCatalogSnapshot,
} from '../../features/course-catalog/inspect';
import { stringifyCourseCatalogSnapshot } from '../../features/course-catalog/serialization';
import extraction from '../../features/course-catalog/generated/manual-listings.extracted.json';
import { GRADUATION_RULE_CATALOG } from '../../features/graduation/domain/rule-catalog/catalog';
import { COURSE_EQUIVALENCY_CATALOG } from '../../features/graduation/domain/rule-catalog/course-equivalencies';
import { MANUAL_PROGRAM_COURSES } from '../../features/graduation/domain/rule-catalog/manual-program-courses';
import { CATALOG_SOURCE_PAGE_AUDITS } from '../../features/graduation/domain/rule-catalog/catalog-source-page-audit';
import metadata from '../../features/graduation/domain/rule-catalog/manual-course-metadata.json';
import type { ManualListingExtractionSnapshot } from '../../features/course-catalog/adapters/manual-listings';

const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const { snapshot, diagnostics } = buildCourseCatalogSnapshotFromWorkspace(process.cwd());
const failures = validateCourseCatalogSnapshot(snapshot);
const sources = (extraction as ManualListingExtractionSnapshot).sources;
const published = new Map(
  snapshot.manualListings.map((listing) => [`${listing.academicYear}:${listing.courseCode}`, listing]),
);
const manualCodes = new Set(sources.flatMap((source) => source.entries.map((entry) => entry.courseCode)));
const years = sources.map((source) => {
  const pdf = readFileSync(source.sourcePath);
  const pageCount = Number(
    execFileSync('pdfinfo', [source.sourcePath], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m)?.[1],
  );
  const sourceSha256 = hash(pdf);
  if (sourceSha256 !== source.sourceSha256) failures.push(`${source.academicYear}: PDF hash mismatch`);
  const seen = new Set<string>();
  const unpublishedCodes: string[] = [];
  for (const entry of source.entries) {
    if (seen.has(entry.courseCode)) failures.push(`${source.academicYear}:${entry.courseCode}: duplicate entry`);
    seen.add(entry.courseCode);
    if (entry.page < 1 || entry.page > pageCount)
      failures.push(`${source.academicYear}:${entry.courseCode}: page out of range`);
    for (const value of [entry.credits, entry.lectureHours, entry.labHours]) {
      if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > 30))
        failures.push(`${source.academicYear}:${entry.courseCode}: invalid hours`);
    }
    const listing = published.get(`${source.academicYear}:${entry.courseCode}`);
    if (!listing) {
      unpublishedCodes.push(entry.courseCode);
      failures.push(`${source.academicYear}:${entry.courseCode}: unpublished handbook observation`);
      continue;
    }
    if (
      listing.credits !== entry.credits ||
      listing.lectureHours !== entry.lectureHours ||
      listing.labHours !== entry.labHours ||
      listing.page !== entry.page ||
      listing.titleKo !== entry.titleKo
    ) {
      failures.push(`${source.academicYear}:${entry.courseCode}: published evidence differs from extraction`);
    }
  }
  return {
    academicYear: source.academicYear,
    sourcePath: source.sourcePath,
    sourceSha256,
    pageCount,
    extractionMethod: source.extractionMethod,
    extractedEntries: source.entries.length,
    publishedEntries: source.entries.length - unpublishedCodes.length,
    missingCredits: source.entries.filter((entry) => entry.credits === undefined).map((entry) => entry.courseCode),
    unpublishedCodes,
  };
});
for (const item of [...GRADUATION_RULE_CATALOG, ...COURSE_EQUIVALENCY_CATALOG]) {
  for (const ref of item.sourceRefs ?? []) {
    const source = years.find((year) => year.academicYear === ref.manualYear && year.sourcePath === ref.path);
    if (!source || ref.page < 1 || ref.page > source.pageCount)
      failures.push(`${item.id}: invalid handbook source ${ref.path}:${ref.page}`);
  }
}
const currentSnapshotPath = 'features/course-catalog/generated/course-catalog.snapshot.json';
const rebuilt = `${stringifyCourseCatalogSnapshot(snapshot)}\n`;
if (readFileSync(currentSnapshotPath, 'utf8') !== rebuilt)
  failures.push('Published snapshot differs from workspace rebuild');
const codeOwners = new Map<string, Set<string>>();
for (const course of snapshot.courses) {
  for (const code of [course.primaryCode, ...course.aliases.map((alias) => alias.code)]) {
    if (!codeOwners.has(code)) codeOwners.set(code, new Set());
    codeOwners.get(code)!.add(course.courseId);
  }
}
const ambiguousCodeOwners = Array.from(codeOwners)
  .filter(([, ids]) => ids.size > 1)
  .map(([code, ids]) => ({ code, courseIds: Array.from(ids).sort() }));
const referencedCodes = (value: unknown): string[] => {
  if (typeof value === 'string') return /^[A-Z]{2}\d{4}$/.test(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(referencedCodes);
  if (value && typeof value === 'object') return Object.values(value).flatMap(referencedCodes);
  return [];
};
const rulesWithoutExactListing = GRADUATION_RULE_CATALOG.flatMap((rule) => {
  const codes = Array.from(new Set(referencedCodes(rule.parameters))).filter((code) => !manualCodes.has(code));
  return codes.length ? [{ ruleId: rule.id, codes }] : [];
});
const creditHistories = Array.from(manualCodes)
  .sort()
  .flatMap((code) => {
    const history = sources.flatMap((source) =>
      source.entries
        .filter((entry) => entry.courseCode === code && entry.credits !== undefined)
        .map((entry) => ({ year: source.academicYear, page: entry.page, credits: entry.credits })),
    );
    return new Set(history.map((entry) => entry.credits)).size > 1 ? [{ code, history }] : [];
  });
const programInventoryGaps = Object.entries(MANUAL_PROGRAM_COURSES)
  .filter(([program]) => /^[A-Z]{2}$/.test(program) && !['CT', 'IR'].includes(program))
  .map(([program, codes]) => ({
    program,
    listedCodesWithoutExtractedHeading: codes.filter((code) => !manualCodes.has(code)),
    extractedNativeCodesNotInProgram: Array.from(manualCodes)
      .filter((code) => code.startsWith(program) && /^[A-Z]{2}[234]\d{3}$/.test(code) && !codes.includes(code))
      .sort(),
  }));
const handbookMetadata = metadata as Record<string, { credits: number; year: number; page: number }>;
const latestYear = Math.max(...years.map((source) => source.academicYear));
for (const course of snapshot.courses) {
  const evidence = handbookMetadata[course.primaryCode];
  if (evidence?.year === latestYear && course.credits !== evidence.credits)
    failures.push(`${course.primaryCode}: current catalog credit differs from latest handbook`);
}
const legacyMinorFiles = readdirSync('DB/minor')
  .filter((name) => name.endsWith('.json'))
  .sort()
  .map((name) => {
    const path = `DB/minor/${name}`;
    const data = JSON.parse(readFileSync(path, 'utf8'));
    const entries = Object.values(data)
      .flat()
      .filter(
        (value): value is { courseCode: string; credits: number } =>
          !!value && typeof value === 'object' && 'courseCode' in value,
      );
    return {
      path,
      entries: entries.length,
      creditDifferencesFromLatestHandbook: entries
        .filter(
          (entry) => handbookMetadata[entry.courseCode] && entry.credits !== handbookMetadata[entry.courseCode].credits,
        )
        .map((entry) => ({
          code: entry.courseCode,
          legacyCredits: entry.credits,
          handbook: handbookMetadata[entry.courseCode],
        })),
      codesWithoutExtractedHeadingOrTable: entries
        .filter((entry) => !manualCodes.has(entry.courseCode) && !handbookMetadata[entry.courseCode])
        .map((entry) => entry.courseCode),
    };
  });
const report = {
  schemaVersion: 1,
  scope:
    'Local 2020–2026 handbooks, generated catalog and rule references. Structural checks do not verify OCR accuracy or every academic exception.',
  failures,
  snapshotSha256: hash(rebuilt),
  years,
  inventory: inspectCourseCatalogSnapshot(snapshot),
  quality: inspectCourseCatalogQuality(snapshot),
  diagnostics,
  rules: {
    count: GRADUATION_RULE_CATALOG.length,
    equivalencies: COURSE_EQUIVALENCY_CATALOG.length,
    sourcePageAudit: CATALOG_SOURCE_PAGE_AUDITS,
    rulesWithoutExactListing,
  },
  reviewQueues: { ambiguousCodeOwners, creditHistories, programInventoryGaps, legacyMinorFiles },
};
const index = process.argv.indexOf('--out');
if (index >= 0) writeFileSync(process.argv[index + 1], `${JSON.stringify(report, null, 2)}\n`);
else process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
console.error(
  `Handbook integrity: ${failures.length} structural failures, ${years.length} PDFs, ${snapshot.manualListings.length} published listings, ${creditHistories.length} credit histories to review.`,
);
if (failures.length) process.exitCode = 1;
