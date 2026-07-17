import { formatCourseTerm } from './offering-view';
import { uniqueStrings } from './normalize';
import type {
  CourseCatalogCourse,
  CourseCatalogManualListing,
  CourseCatalogOffering,
  CourseCatalogSnapshot,
} from './types';

interface CourseSourceDiffRow {
  courseId: string;
  primaryCode: string;
  titleKo: string;
  courseCodes: readonly string[];
  departments: readonly string[];
  manualYears: readonly number[];
  offeredTerms: readonly string[];
}

interface TermCoverageRow {
  term: string;
  label: string;
  sections: number;
  uniqueCourseCodes: number;
  uniqueCourses: number;
}

interface CodeVariantRow {
  courseCode: string;
  variants: readonly string[];
  termsOrYears: readonly string[];
}

export interface CourseCatalogSourceDiffReport {
  totals: {
    courses: number;
    offerings: number;
    manualListings: number;
    manualCourses: number;
    offeredCourses: number;
    manualAndOfferedCourses: number;
    manualOnlyCourses: number;
    offeredOnlyCourses: number;
    offeringTitleVariantCodes: number;
    offeringHoursVariantCodes: number;
    manualTitleVariantCodes: number;
    manualHoursVariantCodes: number;
  };
  termCoverage: readonly TermCoverageRow[];
  manualListedCoursesWithoutOffering: readonly CourseSourceDiffRow[];
  offeredCoursesWithoutManualListing: readonly CourseSourceDiffRow[];
  offeringTitleVariants: readonly CodeVariantRow[];
  offeringHoursVariants: readonly CodeVariantRow[];
  manualTitleVariants: readonly CodeVariantRow[];
  manualHoursVariants: readonly CodeVariantRow[];
}

function compareTerms(left: string, right: string): number {
  const [leftYear, leftSemester] = left.split('-').map(Number);
  const [rightYear, rightSemester] = right.split('-').map(Number);
  if (Number.isFinite(leftYear) && Number.isFinite(rightYear)) {
    return leftYear - rightYear || leftSemester - rightSemester;
  }
  return left.localeCompare(right);
}

function byCourseId<T extends { courseId: string }>(values: readonly T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  values.forEach((value) => grouped.set(value.courseId, [...(grouped.get(value.courseId) ?? []), value]));
  return grouped;
}

function courseSort(left: CourseSourceDiffRow, right: CourseSourceDiffRow): number {
  return left.primaryCode.localeCompare(right.primaryCode) || left.courseId.localeCompare(right.courseId);
}

function courseSourceDiffRow(
  course: CourseCatalogCourse,
  offerings: readonly CourseCatalogOffering[],
  manualListings: readonly CourseCatalogManualListing[],
): CourseSourceDiffRow {
  return {
    courseId: course.courseId,
    primaryCode: course.primaryCode,
    titleKo: course.titleKo,
    courseCodes: uniqueStrings([
      course.primaryCode,
      ...offerings.map((offering) => offering.courseCode),
      ...manualListings.map((listing) => listing.courseCode),
    ]),
    departments: uniqueStrings([
      ...course.departments,
      ...offerings.map((offering) => offering.department ?? ''),
      ...manualListings.flatMap((listing) => listing.departments),
    ]),
    manualYears: Array.from(new Set(manualListings.map((listing) => listing.academicYear))).sort(),
    offeredTerms: Array.from(new Set(offerings.map((offering) => offering.term))).sort(compareTerms),
  };
}

function titleValue(value: string | undefined): string {
  const text = String(value ?? '').trim();
  return text || '(blank)';
}

function hoursValue(hours: {
  lectureHours?: number;
  labHours?: number;
  credits?: number;
  lecture_hours?: number;
  lab_hours?: number;
}): string {
  const lectureHours = hours.lectureHours ?? hours.lecture_hours ?? 0;
  const labHours = hours.labHours ?? hours.lab_hours ?? 0;
  const credits = hours.credits ?? 0;
  return `${lectureHours}/${labHours}/${credits}`;
}

function buildOfferingVariants(
  offerings: readonly CourseCatalogOffering[],
  valueFor: (offering: CourseCatalogOffering) => string,
): CodeVariantRow[] {
  const grouped = new Map<string, Map<string, Set<string>>>();

  offerings.forEach((offering) => {
    const variants = grouped.get(offering.courseCode) ?? new Map<string, Set<string>>();
    const value = valueFor(offering);
    variants.set(value, new Set([...Array.from(variants.get(value) ?? []), offering.term]));
    grouped.set(offering.courseCode, variants);
  });

  return Array.from(grouped.entries())
    .filter(([, variants]) => variants.size > 1)
    .map(([courseCode, variants]) => ({
      courseCode,
      variants: Array.from(variants.keys()).sort(),
      termsOrYears: uniqueStrings(
        Array.from(variants.values()).flatMap((terms) => Array.from(terms)),
      ).sort(compareTerms),
    }))
    .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
}

function buildManualVariants(
  manualListings: readonly CourseCatalogManualListing[],
  valueFor: (listing: CourseCatalogManualListing) => string,
): CodeVariantRow[] {
  const grouped = new Map<string, Map<string, Set<string>>>();

  manualListings.forEach((listing) => {
    const variants = grouped.get(listing.courseCode) ?? new Map<string, Set<string>>();
    const value = valueFor(listing);
    variants.set(value, new Set([...Array.from(variants.get(value) ?? []), String(listing.academicYear)]));
    grouped.set(listing.courseCode, variants);
  });

  return Array.from(grouped.entries())
    .filter(([, variants]) => variants.size > 1)
    .map(([courseCode, variants]) => ({
      courseCode,
      variants: Array.from(variants.keys()).sort(),
      termsOrYears: uniqueStrings(Array.from(variants.values()).flatMap((years) => Array.from(years))),
    }))
    .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
}

function buildTermCoverage(offerings: readonly CourseCatalogOffering[]): TermCoverageRow[] {
  const grouped = new Map<string, CourseCatalogOffering[]>();
  offerings.forEach((offering) => grouped.set(offering.term, [...(grouped.get(offering.term) ?? []), offering]));

  return Array.from(grouped.entries())
    .map(([term, termOfferings]) => ({
      term,
      label: formatCourseTerm(term),
      sections: termOfferings.length,
      uniqueCourseCodes: new Set(termOfferings.map((offering) => offering.courseCode)).size,
      uniqueCourses: new Set(termOfferings.map((offering) => offering.courseId)).size,
    }))
    .sort((a, b) => compareTerms(a.term, b.term));
}

export function buildCourseCatalogSourceDiffReport(
  snapshot: CourseCatalogSnapshot,
): CourseCatalogSourceDiffReport {
  const coursesById = new Map(snapshot.courses.map((course) => [course.courseId, course]));
  const offeringsByCourseId = byCourseId(snapshot.offerings);
  const manualListingsByCourseId = byCourseId(snapshot.manualListings);
  const offeredCourseIds = new Set(snapshot.offerings.map((offering) => offering.courseId));
  const manualCourseIds = new Set(snapshot.manualListings.map((listing) => listing.courseId));
  const manualOnlyCourseIds = Array.from(manualCourseIds).filter((courseId) => !offeredCourseIds.has(courseId));
  const offeredOnlyCourseIds = Array.from(offeredCourseIds).filter((courseId) => !manualCourseIds.has(courseId));
  const manualAndOfferedCourses = Array.from(manualCourseIds).filter((courseId) => offeredCourseIds.has(courseId));
  const toDiffRow = (courseId: string): CourseSourceDiffRow | null => {
    const course = coursesById.get(courseId);
    if (!course) return null;
    return courseSourceDiffRow(
      course,
      offeringsByCourseId.get(courseId) ?? [],
      manualListingsByCourseId.get(courseId) ?? [],
    );
  };
  const offeringTitleVariants = buildOfferingVariants(snapshot.offerings, (offering) => titleValue(offering.title));
  const offeringHoursVariants = buildOfferingVariants(snapshot.offerings, (offering) => hoursValue(offering));
  const manualTitleVariants = buildManualVariants(snapshot.manualListings, (listing) => titleValue(listing.titleKo));
  const manualHoursVariants = buildManualVariants(snapshot.manualListings, (listing) => hoursValue(listing));

  return {
    totals: {
      courses: snapshot.courses.length,
      offerings: snapshot.offerings.length,
      manualListings: snapshot.manualListings.length,
      manualCourses: manualCourseIds.size,
      offeredCourses: offeredCourseIds.size,
      manualAndOfferedCourses: manualAndOfferedCourses.length,
      manualOnlyCourses: manualOnlyCourseIds.length,
      offeredOnlyCourses: offeredOnlyCourseIds.length,
      offeringTitleVariantCodes: offeringTitleVariants.length,
      offeringHoursVariantCodes: offeringHoursVariants.length,
      manualTitleVariantCodes: manualTitleVariants.length,
      manualHoursVariantCodes: manualHoursVariants.length,
    },
    termCoverage: buildTermCoverage(snapshot.offerings),
    manualListedCoursesWithoutOffering: manualOnlyCourseIds
      .map(toDiffRow)
      .filter((row): row is CourseSourceDiffRow => row !== null)
      .sort(courseSort),
    offeredCoursesWithoutManualListing: offeredOnlyCourseIds
      .map(toDiffRow)
      .filter((row): row is CourseSourceDiffRow => row !== null)
      .sort(courseSort),
    offeringTitleVariants,
    offeringHoursVariants,
    manualTitleVariants,
    manualHoursVariants,
  };
}

function escapeCell(value: string | number | readonly string[] | readonly number[]): string {
  const text = Array.isArray(value) ? value.join(', ') : String(value);
  return text.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function table(headers: readonly string[], rows: readonly (readonly (string | number | readonly string[] | readonly number[])[])[]): string {
  if (rows.length === 0) return '_No rows._\n';
  return [
    `| ${headers.map(escapeCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
    '',
  ].join('\n');
}

function renderCourseRows(rows: readonly CourseSourceDiffRow[]): string {
  return table(
    ['Primary code', 'Title', 'Codes', 'Manual years', 'Offered terms', 'Departments'],
    rows.map((row) => [
      row.primaryCode,
      row.titleKo,
      row.courseCodes,
      row.manualYears,
      row.offeredTerms.map(formatCourseTerm),
      row.departments,
    ]),
  );
}

function renderVariantRows(rows: readonly CodeVariantRow[], periodHeader: string): string {
  return table(
    ['Course code', 'Variants', periodHeader],
    rows.map((row) => [row.courseCode, row.variants, row.termsOrYears.map((value) =>
      /^\d{4}-/.test(value) ? formatCourseTerm(value) : value)]),
  );
}

export function renderCourseCatalogSourceDiffReportMarkdown(
  report: CourseCatalogSourceDiffReport,
): string {
  return [
    '# Course Catalog Source Diff Report',
    '',
    'Read-only report comparing bachelor manual listings with registration-system actual offerings.',
    '',
    '## Totals',
    table(
      ['Metric', 'Count'],
      [
        ['Courses', report.totals.courses],
        ['Offerings', report.totals.offerings],
        ['Manual listings', report.totals.manualListings],
        ['Manual-listed courses', report.totals.manualCourses],
        ['Actually offered courses', report.totals.offeredCourses],
        ['Manual and offered courses', report.totals.manualAndOfferedCourses],
        ['Manual-only courses', report.totals.manualOnlyCourses],
        ['Offered-only courses', report.totals.offeredOnlyCourses],
        ['Offering title variant codes', report.totals.offeringTitleVariantCodes],
        ['Offering hours variant codes', report.totals.offeringHoursVariantCodes],
        ['Manual title variant codes', report.totals.manualTitleVariantCodes],
        ['Manual hours variant codes', report.totals.manualHoursVariantCodes],
      ],
    ),
    '## Term Coverage',
    table(
      ['Term', 'Label', 'Sections', 'Unique course codes', 'Unique canonical courses'],
      report.termCoverage.map((row) => [
        row.term,
        row.label,
        row.sections,
        row.uniqueCourseCodes,
        row.uniqueCourses,
      ]),
    ),
    `## Manual Listed Without Actual Offering (${report.manualListedCoursesWithoutOffering.length})`,
    renderCourseRows(report.manualListedCoursesWithoutOffering),
    `## Actually Offered Without Manual Listing (${report.offeredCoursesWithoutManualListing.length})`,
    renderCourseRows(report.offeredCoursesWithoutManualListing),
    `## Registration Offering Title Variants (${report.offeringTitleVariants.length})`,
    renderVariantRows(report.offeringTitleVariants, 'Terms'),
    `## Registration Offering Hours Variants (${report.offeringHoursVariants.length})`,
    renderVariantRows(report.offeringHoursVariants, 'Terms'),
    `## Manual Listing Title Variants (${report.manualTitleVariants.length})`,
    renderVariantRows(report.manualTitleVariants, 'Manual years'),
    `## Manual Listing Hours Variants (${report.manualHoursVariants.length})`,
    renderVariantRows(report.manualHoursVariants, 'Manual years'),
  ].join('\n');
}
