import type { CourseDB } from '@const/course-db';
import type { CourseMaster } from '@/lib/const/course-master';
import type { MinorCourseInfo } from '@/lib/const/minor-courses';
import type { RoadmapData } from '@/lib/types/roadmap';
import type { SectionOffering } from '@/lib/types/timetable';
import type { CourseEquivalency } from '@features/graduation/domain';
import {
  buildHistoricalOfferingsFromCourseDb,
  buildHistoricalOfferingsFromTimetable,
} from './adapters/course-history';
import { buildCoursesFromCourseDb } from './adapters/course-db';
import { buildRelationshipsFromCourseEquivalencies } from './adapters/equivalencies';
import {
  buildManualListingsFromSources,
  type CourseManualListingSource,
} from './adapters/manual-listings';
import { buildRequirementFacetsFromMinorCourses } from './adapters/minor';
import {
  buildRequirementFacetsFromRecommendationGroups,
  type RecommendationCourseGroup,
} from './adapters/recommendations';
import { buildRequirementFacetsFromRoadmaps, type RoadmapCatalogExtraction } from './adapters/roadmap';
import { buildOfferingsFromTimetable } from './adapters/timetable';
import {
  expandCourseCodeCandidates,
  minorCatalogSourceRef,
  normalizeCourseCode,
  recommendationSourceRef,
  roadmapPresetSourceRef,
  timetableSourceRef,
  uniqueSourceRefs,
  uniqueStrings,
} from './normalize';
import type {
  CourseCatalogCourse,
  CourseCatalogCourseRelationship,
  CourseCatalogHistoricalOffering,
  CourseCatalogManualListing,
  CourseCatalogOffering,
  CourseCatalogRequirementFacet,
  CourseCatalogSnapshot,
  CourseCatalogSourceRef,
} from './types';

type CourseLifecycleStatus = NonNullable<CourseCatalogCourse['lifecycle']>['status'];

export interface CourseCatalogBuildInput {
  courseDbRows: readonly CourseDB[];
  timetableSources: readonly {
    sections: readonly SectionOffering[];
    term: string;
    sourcePath: string;
  }[];
  manualListingSources?: readonly CourseManualListingSource[];
  minorCoursesByCode: Readonly<Record<string, readonly MinorCourseInfo[]>>;
  roadmapPresets: Readonly<Record<string, RoadmapData>>;
  recommendationCourses?: readonly CourseMaster[];
  recommendationGroups: readonly RecommendationCourseGroup[];
  courseEquivalencies: readonly CourseEquivalency[];
}

export interface CourseCatalogBuildResult {
  snapshot: CourseCatalogSnapshot;
  diagnostics: {
    roadmapMissingCourseCodeNodes: RoadmapCatalogExtraction['missingCourseCodeNodes'];
    syntheticCourseCount: number;
  };
}

interface ObservedCourseInput {
  code: string;
  titleKo?: string;
  titleEn?: string;
  credits?: number;
  lectureHours?: number;
  labHours?: number;
  level?: number;
  department?: string;
  departments?: readonly string[];
  tags?: readonly string[];
  status?: CourseLifecycleStatus;
  sourceRefs: readonly CourseCatalogSourceRef[];
}

function syntheticCourseId(code: string): string {
  return `COURSE:${code}`;
}

function mergeAliases(
  left: CourseCatalogCourse['aliases'],
  right: CourseCatalogCourse['aliases'],
): CourseCatalogCourse['aliases'] {
  const byKey = new Map<string, CourseCatalogCourse['aliases'][number]>();

  [...left, ...right].forEach((alias) => {
    const key = `${alias.relation}:${normalizeCourseCode(alias.code)}`;
    const existing = byKey.get(key);
    byKey.set(key, {
      ...alias,
      code: normalizeCourseCode(alias.code),
      sourceRefs: uniqueSourceRefs([...(existing?.sourceRefs ?? []), ...(alias.sourceRefs ?? [])]),
    });
  });

  return Array.from(byKey.values()).sort((a, b) => {
    if (a.relation !== b.relation) return a.relation.localeCompare(b.relation);
    return a.code.localeCompare(b.code);
  });
}

function canonicalizeAliases(
  primaryCode: string,
  aliases: CourseCatalogCourse['aliases'],
): CourseCatalogCourse['aliases'] {
  const normalizedPrimaryCode = normalizeCourseCode(primaryCode);
  const hasPrimary = aliases.some((alias) =>
    alias.relation === 'primary' && normalizeCourseCode(alias.code) === normalizedPrimaryCode);
  const withPrimary = hasPrimary
    ? aliases
    : [{ code: normalizedPrimaryCode, relation: 'primary' as const }, ...aliases];

  return mergeAliases([], withPrimary.map((alias) => {
    const code = normalizeCourseCode(alias.code);
    return {
      ...alias,
      code,
      relation: code === normalizedPrimaryCode && alias.relation === 'primary'
        ? 'primary'
        : alias.relation === 'primary'
          ? 'same_course'
          : alias.relation,
    };
  }));
}

class CourseAccumulator {
  private coursesById = new Map<string, CourseCatalogCourse>();
  private codeToCourseId = new Map<string, string>();
  private syntheticCourseIds = new Set<string>();

  addCourse(course: CourseCatalogCourse): string {
    const inputPrimaryCode = normalizeCourseCode(course.primaryCode);
    const existingCourseId = this.coursesById.has(course.courseId)
      ? course.courseId
      : this.codeToCourseId.get(inputPrimaryCode);
    const targetCourseId = existingCourseId ?? course.courseId;
    const existing = this.coursesById.get(targetCourseId);
    const primaryCode = existing?.primaryCode ?? inputPrimaryCode;
    const aliases = canonicalizeAliases(primaryCode, [
      { code: inputPrimaryCode, relation: inputPrimaryCode === primaryCode ? 'primary' : 'same_course', sourceRefs: course.sourceRefs },
      ...course.aliases,
    ]);
    const normalizedCourse: CourseCatalogCourse = {
      ...course,
      courseId: targetCourseId,
      primaryCode,
      aliases,
      departments: uniqueStrings(course.departments),
      tags: uniqueStrings(course.tags),
      sourceRefs: uniqueSourceRefs(course.sourceRefs),
    };

    const merged: CourseCatalogCourse = existing
      ? {
          ...existing,
          titleKo: existing.titleKo === existing.primaryCode ? normalizedCourse.titleKo : existing.titleKo,
          titleEn: existing.titleEn ?? normalizedCourse.titleEn,
          credits: existing.credits || normalizedCourse.credits,
          lectureHours: existing.lectureHours ?? normalizedCourse.lectureHours,
          labHours: existing.labHours ?? normalizedCourse.labHours,
          level: existing.level ?? normalizedCourse.level,
          departments: uniqueStrings([...existing.departments, ...normalizedCourse.departments]),
          tags: uniqueStrings([...existing.tags, ...normalizedCourse.tags]),
          description: existing.description ?? normalizedCourse.description,
          lifecycle: existing.lifecycle?.status === 'active'
            ? existing.lifecycle
            : normalizedCourse.lifecycle?.status === 'active'
              ? normalizedCourse.lifecycle
              : (existing.lifecycle ?? normalizedCourse.lifecycle),
          aliases: canonicalizeAliases(existing.primaryCode, mergeAliases(existing.aliases, normalizedCourse.aliases)),
          sourceRefs: uniqueSourceRefs([...existing.sourceRefs, ...normalizedCourse.sourceRefs]),
        }
      : normalizedCourse;

    this.coursesById.set(merged.courseId, merged);
    merged.aliases.forEach((alias) => {
      const code = normalizeCourseCode(alias.code);
      if (code && !this.codeToCourseId.has(code)) {
        this.codeToCourseId.set(code, merged.courseId);
      }
    });
    if (!this.codeToCourseId.has(primaryCode)) {
      this.codeToCourseId.set(primaryCode, merged.courseId);
    }

    return merged.courseId;
  }

  ensureObservedCourse(input: ObservedCourseInput): string {
    const primaryCode = normalizeCourseCode(input.code);
    if (!primaryCode) return '';

    const existingCourseId = expandCourseCodeCandidates(primaryCode)
      .map((candidate) => this.codeToCourseId.get(candidate))
      .find((courseId): courseId is string => Boolean(courseId));
    const courseId = existingCourseId ?? syntheticCourseId(primaryCode);
    if (!existingCourseId) {
      this.syntheticCourseIds.add(courseId);
    }

    return this.addCourse({
      courseId,
      primaryCode,
      aliases: [{ code: primaryCode, relation: 'primary', sourceRefs: input.sourceRefs }],
      titleKo: input.titleKo || primaryCode,
      ...(input.titleEn ? { titleEn: input.titleEn } : {}),
      credits: input.credits ?? 0,
      lectureHours: input.lectureHours,
      labHours: input.labHours,
      level: input.level,
      departments: uniqueStrings([...(input.departments ?? []), input.department ?? '']),
      tags: uniqueStrings(input.tags ?? []),
      lifecycle: { status: input.status ?? 'unknown' },
      sourceRefs: input.sourceRefs,
    });
  }

  resolveCourseId = (courseCode: string): string => {
    const normalizedCode = normalizeCourseCode(courseCode);
    const existingCourseId = expandCourseCodeCandidates(normalizedCode)
      .map((candidate) => this.codeToCourseId.get(candidate))
      .find((courseId): courseId is string => Boolean(courseId));

    return existingCourseId ?? this.ensureObservedCourse({
      code: normalizedCode,
      sourceRefs: [{ kind: 'manual', sourceId: 'unresolved-observed-course' }],
    });
  };

  getCourses(): CourseCatalogCourse[] {
    return Array.from(this.coursesById.values()).sort((a, b) => a.courseId.localeCompare(b.courseId));
  }

  getSyntheticCourseCount(): number {
    return this.syntheticCourseIds.size;
  }
}

function addCourseDbRows(accumulator: CourseAccumulator, rows: readonly CourseDB[]): void {
  buildCoursesFromCourseDb(rows).forEach((course) => accumulator.addCourse(course));
}

function addTimetableObservedCourses(
  accumulator: CourseAccumulator,
  sections: readonly SectionOffering[],
  sourcePath: string,
): void {
  sections.forEach((section) => {
    const hours = section.hours ?? { credits: 0, lecture_hours: 0, lab_hours: 0 };
    accumulator.ensureObservedCourse({
      code: section.course_code,
      titleKo: section.title,
      credits: hours.credits,
      lectureHours: hours.lecture_hours,
      labHours: hours.lab_hours,
      department: section.department,
      tags: [section.category, section.subcategory ?? '', section.program],
      status: 'active',
      sourceRefs: [timetableSourceRef(sourcePath)],
    });
  });
}

function addMinorObservedCourses(
  accumulator: CourseAccumulator,
  minorCoursesByCode: Readonly<Record<string, readonly MinorCourseInfo[]>>,
): void {
  Object.entries(minorCoursesByCode).forEach(([minorCode, courses]) => {
    courses.forEach((course) => {
      accumulator.ensureObservedCourse({
        code: course.courseCode,
        titleKo: course.courseName,
        credits: course.credits,
        tags: [course.category, course.classification],
        sourceRefs: [minorCatalogSourceRef(minorCode)],
      });
    });
  });
}

function addRoadmapObservedCourses(
  accumulator: CourseAccumulator,
  roadmapPresets: Readonly<Record<string, RoadmapData>>,
): void {
  Object.entries(roadmapPresets).forEach(([preset, roadmap]) => {
    roadmap.nodes.forEach((node) => {
      const courseCode = normalizeCourseCode(node.data.courseCode);
      if (!courseCode) return;
      accumulator.ensureObservedCourse({
        code: courseCode,
        titleKo: node.data.label,
        credits: node.data.credits,
        tags: [node.data.category, node.data.semester ?? '', roadmap.meta.major, roadmap.meta.track ?? ''],
        sourceRefs: [roadmapPresetSourceRef(preset)],
      });
    });
  });
}

function addRecommendationObservedCourses(
  accumulator: CourseAccumulator,
  courses: readonly CourseMaster[],
): void {
  courses.forEach((course) => {
    accumulator.ensureObservedCourse({
      code: course.courseCode,
      titleKo: course.courseNameKo,
      titleEn: course.courseNameEn,
      credits: course.credits,
      level: course.level,
      department: course.department,
      status: course.isOffered ? 'active' : 'inactive',
      sourceRefs: [recommendationSourceRef()],
    });
  });
}

function flattenRecommendationCourses(groups: readonly RecommendationCourseGroup[]): CourseMaster[] {
  const byCode = new Map<string, CourseMaster>();

  groups.forEach((group) => {
    group.courses.forEach((course) => {
      const courseCode = normalizeCourseCode(course.courseCode);
      if (courseCode && !byCode.has(courseCode)) {
        byCode.set(courseCode, course);
      }
    });
  });

  return Array.from(byCode.values());
}

function uniqueFacets(facets: readonly CourseCatalogRequirementFacet[]): CourseCatalogRequirementFacet[] {
  const byId = new Map<string, CourseCatalogRequirementFacet>();
  facets.forEach((facet) => byId.set(facet.id, {
    ...facet,
    courseCode: normalizeCourseCode(facet.courseCode),
    sourceRefs: uniqueSourceRefs(facet.sourceRefs),
  }));
  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function uniqueOfferings(offerings: readonly CourseCatalogOffering[]): CourseCatalogOffering[] {
  const byId = new Map<string, CourseCatalogOffering>();
  offerings.forEach((offering) => byId.set(offering.offeringId, offering));
  return Array.from(byId.values()).sort((a, b) => a.offeringId.localeCompare(b.offeringId));
}

function uniqueHistoricalOfferings(
  historicalOfferings: readonly CourseCatalogHistoricalOffering[],
): CourseCatalogHistoricalOffering[] {
  const byId = new Map<string, CourseCatalogHistoricalOffering>();
  historicalOfferings.forEach((offering) => {
    const existing = byId.get(offering.id);
    byId.set(offering.id, {
      ...(existing ?? offering),
      sourceLabel: existing && existing.sourceLabel !== offering.sourceLabel
        ? `${existing.sourceLabel}; ${offering.sourceLabel}`
        : offering.sourceLabel,
      courseCode: normalizeCourseCode(offering.courseCode),
      sourceRefs: uniqueSourceRefs([...(existing?.sourceRefs ?? []), ...offering.sourceRefs]),
    });
  });
  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function uniqueManualListings(manualListings: readonly CourseCatalogManualListing[]): CourseCatalogManualListing[] {
  const byId = new Map<string, CourseCatalogManualListing>();
  manualListings.forEach((listing) => byId.set(listing.id, {
    ...listing,
    courseCode: normalizeCourseCode(listing.courseCode),
    departments: uniqueStrings(listing.departments),
    sourceRefs: uniqueSourceRefs(listing.sourceRefs),
  }));
  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function uniqueRelationships(
  relationships: readonly CourseCatalogCourseRelationship[],
): CourseCatalogCourseRelationship[] {
  const byId = new Map<string, CourseCatalogCourseRelationship>();
  relationships.forEach((relationship) => byId.set(relationship.id, {
    ...relationship,
    courseCodes: uniqueStrings(relationship.courseCodes),
    courseIds: uniqueStrings(relationship.courseIds),
    sourceRefs: uniqueSourceRefs(relationship.sourceRefs),
  }));
  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function buildCourseCatalogSnapshot(input: CourseCatalogBuildInput): CourseCatalogBuildResult {
  const accumulator = new CourseAccumulator();

  addCourseDbRows(accumulator, input.courseDbRows);
  input.timetableSources.forEach((source) =>
    addTimetableObservedCourses(accumulator, source.sections, source.sourcePath));
  addMinorObservedCourses(accumulator, input.minorCoursesByCode);
  addRoadmapObservedCourses(accumulator, input.roadmapPresets);
  addRecommendationObservedCourses(
    accumulator,
    input.recommendationCourses ?? flattenRecommendationCourses(input.recommendationGroups),
  );

  const roadmapExtraction = buildRequirementFacetsFromRoadmaps(input.roadmapPresets, accumulator.resolveCourseId);
  const requirementFacets = uniqueFacets([
    ...buildRequirementFacetsFromMinorCourses(input.minorCoursesByCode, accumulator.resolveCourseId),
    ...buildRequirementFacetsFromRecommendationGroups(input.recommendationGroups, accumulator.resolveCourseId),
    ...roadmapExtraction.facets,
  ]);
  const offerings = uniqueOfferings(
    input.timetableSources.flatMap((source) =>
      buildOfferingsFromTimetable(source.sections, {
        term: source.term,
        sourcePath: source.sourcePath,
        resolveCourseId: accumulator.resolveCourseId,
      })),
  );
  const historicalOfferings = uniqueHistoricalOfferings(
    [
      ...buildHistoricalOfferingsFromCourseDb(input.courseDbRows, accumulator.resolveCourseId),
      ...buildHistoricalOfferingsFromTimetable(input.timetableSources, accumulator.resolveCourseId),
    ],
  );
  const manualListingCatalogCourses = accumulator.getCourses();
  const manualListingSources = input.manualListingSources ?? [];
  const manualListings = uniqueManualListings(
    buildManualListingsFromSources(manualListingSources, {
      catalogCourses: manualListingCatalogCourses,
      resolveCourseId: accumulator.resolveCourseId,
    }),
  );
  const relationships = uniqueRelationships(
    buildRelationshipsFromCourseEquivalencies(input.courseEquivalencies, accumulator.resolveCourseId),
  );
  const catalogCourses = accumulator.getCourses();

  return {
    snapshot: {
      schemaVersion: 2,
      courses: catalogCourses,
      offerings,
      historicalOfferings,
      manualListings,
      requirementFacets,
      relationships,
    },
    diagnostics: {
      roadmapMissingCourseCodeNodes: roadmapExtraction.missingCourseCodeNodes,
      syntheticCourseCount: accumulator.getSyntheticCourseCount(),
    },
  };
}
