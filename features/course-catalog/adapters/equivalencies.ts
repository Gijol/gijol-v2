import type { CourseEquivalency, RequirementSource } from '@features/graduation/domain';
import type { CourseCatalogCourseRelationship, CourseCatalogSourceRef } from '../types';
import { normalizeCourseCode } from '../normalize';

function relationToCatalogRelation(
  relation: CourseEquivalency['relation'],
): CourseCatalogCourseRelationship['relation'] {
  if (relation === 'crossListed') return 'cross_listed';
  if (relation === 'legacyEquivalent') return 'legacy_equivalent';
  if (relation === 'sameCourse') return 'same_course';
  return relation;
}

function requirementSourceToCourseSource(sourceRef: RequirementSource): CourseCatalogSourceRef {
  return {
    kind: 'graduation-rule-catalog',
    sourceId: `${sourceRef.manualYear}:${sourceRef.path}:p${sourceRef.page}`,
    path: sourceRef.path,
    manualYear: sourceRef.manualYear,
    page: sourceRef.page,
    note: sourceRef.note,
  };
}

function getEquivalencyCodes(equivalency: CourseEquivalency): string[] {
  if ('courseCodes' in equivalency) return equivalency.courseCodes.map(normalizeCourseCode).filter(Boolean);
  return [equivalency.fromCourseCode, equivalency.toCourseCode].map(normalizeCourseCode).filter(Boolean);
}

export function buildRelationshipsFromCourseEquivalencies(
  equivalencies: readonly CourseEquivalency[],
  resolveCourseId: (courseCode: string) => string,
): CourseCatalogCourseRelationship[] {
  return equivalencies.map((equivalency) => {
    const courseCodes = Array.from(new Set(getEquivalencyCodes(equivalency)));

    return {
      id: `graduation-equivalency:${equivalency.id}`,
      relation: relationToCatalogRelation(equivalency.relation),
      courseIds: courseCodes.map(resolveCourseId),
      courseCodes,
      sourceRefs: equivalency.sourceRefs.map(requirementSourceToCourseSource),
      note: equivalency.note,
    };
  });
}
