import type { CourseDB } from '@const/course-db';
import type { CourseMaster } from '@/lib/const/course-master';
import type { MinorCourseInfo } from '@/lib/const/minor-courses';
import type { RoadmapData } from '@/lib/types/roadmap';
import type { SectionOffering } from '@/lib/types/timetable';
import type { CourseEquivalency } from '@features/graduation/domain';
import { buildCoursesFromCourseDb } from './adapters/course-db';
import { buildRelationshipsFromCourseEquivalencies } from './adapters/equivalencies';
import { buildRequirementFacetsFromMinorCourses } from './adapters/minor';
import { buildRequirementFacetsFromRecommendationCourses } from './adapters/recommendations';
import { buildRequirementFacetsFromRoadmaps, type RoadmapCatalogExtraction } from './adapters/roadmap';
import { buildOfferingsFromTimetable } from './adapters/timetable';
import {
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
  CourseCatalogOffering,
  CourseCatalogRequirementFacet,
  CourseCatalogSnapshot,
  CourseCatalogSourceRef,
} from './types';

type CourseLifecycleStatus = NonNullable<CourseCatalogCourse['lifecycle']>['status'];

export interface CourseCatalogBuildInput {
  courseDbRows: readonly CourseDB[];
  timetableSections: readonly SectionOffering[];
  timetableTerm: string;
  timetableSourcePath: string;
  minorCoursesByCode: Readonly<Record<string, readonly MinorCourseInfo[]>>;
  roadmapPresets: Readonly<Record<string, RoadmapData>>;
  recommendationCourses: readonly CourseMaster[];
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

    const existingCourseId = this.codeToCourseId.get(primaryCode);
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
    return this.codeToCourseId.get(normalizedCode) ?? this.ensureObservedCourse({
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
  addTimetableObservedCourses(accumulator, input.timetableSections, input.timetableSourcePath);
  addMinorObservedCourses(accumulator, input.minorCoursesByCode);
  addRoadmapObservedCourses(accumulator, input.roadmapPresets);
  addRecommendationObservedCourses(accumulator, input.recommendationCourses);

  const roadmapExtraction = buildRequirementFacetsFromRoadmaps(input.roadmapPresets, accumulator.resolveCourseId);
  const requirementFacets = uniqueFacets([
    ...buildRequirementFacetsFromMinorCourses(input.minorCoursesByCode, accumulator.resolveCourseId),
    ...buildRequirementFacetsFromRecommendationCourses(input.recommendationCourses, accumulator.resolveCourseId),
    ...roadmapExtraction.facets,
  ]);
  const offerings = uniqueOfferings(
    buildOfferingsFromTimetable(input.timetableSections, {
      term: input.timetableTerm,
      sourcePath: input.timetableSourcePath,
      resolveCourseId: accumulator.resolveCourseId,
    }),
  );
  const relationships = uniqueRelationships(
    buildRelationshipsFromCourseEquivalencies(input.courseEquivalencies, accumulator.resolveCourseId),
  );

  return {
    snapshot: {
      schemaVersion: 1,
      courses: accumulator.getCourses(),
      offerings,
      requirementFacets,
      relationships,
    },
    diagnostics: {
      roadmapMissingCourseCodeNodes: roadmapExtraction.missingCourseCodeNodes,
      syntheticCourseCount: accumulator.getSyntheticCourseCount(),
    },
  };
}
