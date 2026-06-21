import { sourceRefKey } from './normalize';
import type { CourseCatalogSnapshot } from './types';

export interface CourseCatalogInspection {
  schemaVersion: 2;
  totals: {
    courses: number;
    aliases: number;
    offerings: number;
    historicalOfferings: number;
    manualListings: number;
    requirementFacets: number;
    relationships: number;
  };
  coursesBySourceKind: Readonly<Record<string, number>>;
  offeringsByTerm: Readonly<Record<string, number>>;
  historicalOfferingsByAcademicYear: Readonly<Record<string, number>>;
  manualListingsByAcademicYear: Readonly<Record<string, number>>;
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
  const historicalOfferingsByAcademicYear: Record<string, number> = {};
  const manualListingsByAcademicYear: Record<string, number> = {};
  const facetsByFeature: Record<string, number> = {};
  const relationshipsByRelation: Record<string, number> = {};

  snapshot.courses.forEach((course) => {
    const sourceKinds = new Set(course.sourceRefs.map((sourceRef) => sourceRef.kind));
    sourceKinds.forEach((kind) => increment(coursesBySourceKind, kind));
  });
  snapshot.offerings.forEach((offering) => increment(offeringsByTerm, offering.term));
  snapshot.historicalOfferings.forEach((offering) =>
    increment(historicalOfferingsByAcademicYear, String(offering.academicYear)));
  snapshot.manualListings.forEach((listing) =>
    increment(manualListingsByAcademicYear, String(listing.academicYear)));
  snapshot.requirementFacets.forEach((facet) => increment(facetsByFeature, facet.feature));
  snapshot.relationships.forEach((relationship) => increment(relationshipsByRelation, relationship.relation));

  return {
    schemaVersion: 2,
    totals: {
      courses: snapshot.courses.length,
      aliases: snapshot.courses.reduce((sum, course) => sum + course.aliases.length, 0),
      offerings: snapshot.offerings.length,
      historicalOfferings: snapshot.historicalOfferings.length,
      manualListings: snapshot.manualListings.length,
      requirementFacets: snapshot.requirementFacets.length,
      relationships: snapshot.relationships.length,
    },
    coursesBySourceKind: sortedRecord(coursesBySourceKind),
    offeringsByTerm: sortedRecord(offeringsByTerm),
    historicalOfferingsByAcademicYear: sortedRecord(historicalOfferingsByAcademicYear),
    manualListingsByAcademicYear: sortedRecord(manualListingsByAcademicYear),
    facetsByFeature: sortedRecord(facetsByFeature),
    relationshipsByRelation: sortedRecord(relationshipsByRelation),
  };
}

export function validateCourseCatalogSnapshot(snapshot: CourseCatalogSnapshot): string[] {
  const issues: string[] = [];
  const courseIds = new Set<string>();
  const courseCodes = new Set<string>();
  const offeringIds = new Set<string>();
  const historicalOfferingIds = new Set<string>();
  const manualListingIds = new Set<string>();
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

  snapshot.historicalOfferings.forEach((offering) => {
    if (historicalOfferingIds.has(offering.id)) issues.push(`${offering.id}: duplicate historical offering id`);
    historicalOfferingIds.add(offering.id);
    if (!courseIds.has(offering.courseId)) issues.push(`${offering.id}: missing course ${offering.courseId}`);
    if (!offering.academicYear || !offering.semester) issues.push(`${offering.id}: invalid academic term`);
  });

  snapshot.manualListings.forEach((listing) => {
    if (manualListingIds.has(listing.id)) issues.push(`${listing.id}: duplicate manual listing id`);
    manualListingIds.add(listing.id);
    if (!courseIds.has(listing.courseId)) issues.push(`${listing.id}: missing course ${listing.courseId}`);
    if (!listing.academicYear) issues.push(`${listing.id}: academicYear is required`);
  });

  snapshot.requirementFacets.forEach((facet) => {
    if (facetIds.has(facet.id)) issues.push(`${facet.id}: duplicate requirement facet id`);
    facetIds.add(facet.id);
    if (!courseIds.has(facet.courseId)) issues.push(`${facet.id}: missing course ${facet.courseId}`);
    if (facet.feature === 'recommendation' && !facet.requirementId) {
      issues.push(`${facet.id}: recommendation facet requires requirementId`);
    }
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
