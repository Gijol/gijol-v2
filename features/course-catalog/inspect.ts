import { sourceRefKey } from './normalize';
import type { CourseCatalogSnapshot } from './types';

export interface CourseCatalogInspection {
  schemaVersion: 1;
  totals: {
    courses: number;
    aliases: number;
    offerings: number;
    requirementFacets: number;
    relationships: number;
  };
  coursesBySourceKind: Readonly<Record<string, number>>;
  offeringsByTerm: Readonly<Record<string, number>>;
  facetsByFeature: Readonly<Record<string, number>>;
  relationshipsByRelation: Readonly<Record<string, number>>;
}

function increment(record: Record<string, number>, key: string): void {
  record[key] = (record[key] ?? 0) + 1;
}

function sortedRecord(record: Record<string, number>): Readonly<Record<string, number>> {
  return Object.freeze(Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b))));
}

export function inspectCourseCatalogSnapshot(snapshot: CourseCatalogSnapshot): CourseCatalogInspection {
  const coursesBySourceKind: Record<string, number> = {};
  const offeringsByTerm: Record<string, number> = {};
  const facetsByFeature: Record<string, number> = {};
  const relationshipsByRelation: Record<string, number> = {};

  snapshot.courses.forEach((course) => {
    const sourceKinds = new Set(course.sourceRefs.map((sourceRef) => sourceRef.kind));
    sourceKinds.forEach((kind) => increment(coursesBySourceKind, kind));
  });
  snapshot.offerings.forEach((offering) => increment(offeringsByTerm, offering.term));
  snapshot.requirementFacets.forEach((facet) => increment(facetsByFeature, facet.feature));
  snapshot.relationships.forEach((relationship) => increment(relationshipsByRelation, relationship.relation));

  return {
    schemaVersion: 1,
    totals: {
      courses: snapshot.courses.length,
      aliases: snapshot.courses.reduce((sum, course) => sum + course.aliases.length, 0),
      offerings: snapshot.offerings.length,
      requirementFacets: snapshot.requirementFacets.length,
      relationships: snapshot.relationships.length,
    },
    coursesBySourceKind: sortedRecord(coursesBySourceKind),
    offeringsByTerm: sortedRecord(offeringsByTerm),
    facetsByFeature: sortedRecord(facetsByFeature),
    relationshipsByRelation: sortedRecord(relationshipsByRelation),
  };
}

export function validateCourseCatalogSnapshot(snapshot: CourseCatalogSnapshot): string[] {
  const issues: string[] = [];
  const courseIds = new Set<string>();
  const courseCodes = new Set<string>();
  const offeringIds = new Set<string>();
  const facetIds = new Set<string>();
  const relationshipIds = new Set<string>();

  snapshot.courses.forEach((course) => {
    if (!course.courseId) issues.push('course.courseId is required');
    if (!course.primaryCode) issues.push(`${course.courseId}: primaryCode is required`);
    if (courseIds.has(course.courseId)) issues.push(`${course.courseId}: duplicate courseId`);
    courseIds.add(course.courseId);
    course.aliases.forEach((alias) => {
      const key = alias.code;
      if (courseCodes.has(key) && alias.relation === 'primary') {
        issues.push(`${course.courseId}: duplicate primary code ${key}`);
      }
      if (alias.relation === 'primary') courseCodes.add(key);
    });
    course.sourceRefs.forEach((sourceRef) => {
      if (!sourceRef.kind || !sourceRef.sourceId) issues.push(`${course.courseId}: invalid sourceRef ${sourceRefKey(sourceRef)}`);
    });
  });

  snapshot.offerings.forEach((offering) => {
    if (offeringIds.has(offering.offeringId)) issues.push(`${offering.offeringId}: duplicate offeringId`);
    offeringIds.add(offering.offeringId);
    if (!courseIds.has(offering.courseId)) issues.push(`${offering.offeringId}: missing course ${offering.courseId}`);
  });

  snapshot.requirementFacets.forEach((facet) => {
    if (facetIds.has(facet.id)) issues.push(`${facet.id}: duplicate requirement facet id`);
    facetIds.add(facet.id);
    if (!courseIds.has(facet.courseId)) issues.push(`${facet.id}: missing course ${facet.courseId}`);
  });

  snapshot.relationships.forEach((relationship) => {
    if (relationshipIds.has(relationship.id)) issues.push(`${relationship.id}: duplicate relationship id`);
    relationshipIds.add(relationship.id);
    relationship.courseIds.forEach((courseId) => {
      if (!courseIds.has(courseId)) issues.push(`${relationship.id}: missing course ${courseId}`);
    });
  });

  return issues;
}
