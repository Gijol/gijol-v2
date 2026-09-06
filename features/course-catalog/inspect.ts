import { sourceRefKey } from './normalize';
import { buildCourseOfferingGroups, formatMeetingFull } from './offering-view';
import type { CourseCatalogCourse, CourseCatalogOffering, CourseCatalogSnapshot } from './types';

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

function sortedRecord<T>(record: Record<string, T>): Readonly<Record<string, T>> {
  return Object.freeze(Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b))));
}

function sample<T>(values: readonly T[], limit = 10): readonly T[] {
  return values.slice(0, limit);
}

interface CourseQualitySample {
  courseId: string;
  primaryCode: string;
  titleKo: string;
}

interface OfferingQualitySample {
  offeringId: string;
  courseCode: string;
  term: string;
  section: string;
  title: string;
}

interface MeetingQualitySample extends OfferingQualitySample {
  meeting: string;
}

interface OfferingGroupQualitySample {
  offeringGroupId: string;
  term: string;
  courseCodes: readonly string[];
  sections: readonly string[];
  departments: readonly string[];
}

interface CourseCatalogTermQuality {
  offerings: number;
  offeringsWithoutMeetings: number;
  meetings: number;
  meetingsWithoutRoom: number;
  offeringsWithCapacityZero: number;
  instructors: number;
  instructorsWithoutStaffId: number;
  offeringGroups: number;
  multiCodeOfferingGroups: number;
  offeringGroupsWithMultipleDepartments: number;
  offeringGroupsWithMultipleSections: number;
}

export interface CourseCatalogQualityInspection {
  totals: {
    offeringsWithoutMeetings: number;
    meetingsWithoutRoom: number;
    offeringsWithCapacityZero: number;
    instructorsWithoutStaffId: number;
    offeringGroups: number;
    multiCodeOfferingGroups: number;
    offeringGroupsWithMultipleDepartments: number;
    offeringGroupsWithMultipleSections: number;
    manualListedCoursesWithoutOffering: number;
    offeredCoursesWithoutManualListing: number;
  };
  byTerm: Readonly<Record<string, CourseCatalogTermQuality>>;
  samples: {
    offeringsWithoutMeetings: readonly OfferingQualitySample[];
    meetingsWithoutRoom: readonly MeetingQualitySample[];
    offeringsWithCapacityZero: readonly OfferingQualitySample[];
    instructorsWithoutStaffId: readonly OfferingQualitySample[];
    multiCodeOfferingGroups: readonly OfferingGroupQualitySample[];
    offeringGroupsWithMultipleDepartments: readonly OfferingGroupQualitySample[];
    offeringGroupsWithMultipleSections: readonly OfferingGroupQualitySample[];
    manualListedCoursesWithoutOffering: readonly CourseQualitySample[];
    offeredCoursesWithoutManualListing: readonly CourseQualitySample[];
  };
}

function ensureTermQuality(record: Record<string, CourseCatalogTermQuality>, term: string): CourseCatalogTermQuality {
  record[term] ??= {
    offerings: 0,
    offeringsWithoutMeetings: 0,
    meetings: 0,
    meetingsWithoutRoom: 0,
    offeringsWithCapacityZero: 0,
    instructors: 0,
    instructorsWithoutStaffId: 0,
    offeringGroups: 0,
    multiCodeOfferingGroups: 0,
    offeringGroupsWithMultipleDepartments: 0,
    offeringGroupsWithMultipleSections: 0,
  };

  return record[term];
}

function courseSample(course: CourseCatalogCourse): CourseQualitySample {
  return {
    courseId: course.courseId,
    primaryCode: course.primaryCode,
    titleKo: course.titleKo,
  };
}

function offeringSample(offering: CourseCatalogOffering): OfferingQualitySample {
  return {
    offeringId: offering.offeringId,
    courseCode: offering.courseCode,
    term: offering.term,
    section: offering.section,
    title: offering.title,
  };
}

function sortedOfferings(offerings: readonly CourseCatalogOffering[]): CourseCatalogOffering[] {
  return [...offerings].sort((a, b) => a.offeringId.localeCompare(b.offeringId));
}

function sortedCourses(courses: readonly CourseCatalogCourse[]): CourseCatalogCourse[] {
  return [...courses].sort(
    (a, b) => a.primaryCode.localeCompare(b.primaryCode) || a.courseId.localeCompare(b.courseId),
  );
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
    increment(historicalOfferingsByAcademicYear, String(offering.academicYear)),
  );
  snapshot.manualListings.forEach((listing) => increment(manualListingsByAcademicYear, String(listing.academicYear)));
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

export function inspectCourseCatalogQuality(snapshot: CourseCatalogSnapshot): CourseCatalogQualityInspection {
  const offeringsByTerm = new Map<string, CourseCatalogOffering[]>();
  const byTerm: Record<string, CourseCatalogTermQuality> = {};

  snapshot.offerings.forEach((offering) => {
    offeringsByTerm.set(offering.term, [...(offeringsByTerm.get(offering.term) ?? []), offering]);
    const termQuality = ensureTermQuality(byTerm, offering.term);
    termQuality.offerings += 1;
    termQuality.meetings += offering.meetings.length;
    termQuality.meetingsWithoutRoom += offering.meetings.filter((meeting) => !meeting.room).length;
    termQuality.instructors += offering.instructors.length;
    termQuality.instructorsWithoutStaffId += offering.instructors.filter((instructor) => !instructor.staffId).length;
    if (offering.meetings.length === 0) termQuality.offeringsWithoutMeetings += 1;
    if (offering.capacity === 0) termQuality.offeringsWithCapacityZero += 1;
  });

  const offeringGroups = Array.from(offeringsByTerm.values()).flatMap((offerings) =>
    buildCourseOfferingGroups(offerings),
  );

  offeringGroups.forEach((offeringGroup) => {
    const termQuality = ensureTermQuality(byTerm, offeringGroup.term);
    const uniqueSections = new Set(offeringGroup.sections.map((section) => section.section));
    termQuality.offeringGroups += 1;
    if (offeringGroup.courseCodes.length > 1) termQuality.multiCodeOfferingGroups += 1;
    if (offeringGroup.departments.length > 1) termQuality.offeringGroupsWithMultipleDepartments += 1;
    if (uniqueSections.size > 1) termQuality.offeringGroupsWithMultipleSections += 1;
  });

  const offeringCourseIds = new Set(snapshot.offerings.map((offering) => offering.courseId));
  const manualListingCourseIds = new Set(snapshot.manualListings.map((listing) => listing.courseId));
  const manualListedCoursesWithoutOffering = sortedCourses(
    snapshot.courses.filter(
      (course) => manualListingCourseIds.has(course.courseId) && !offeringCourseIds.has(course.courseId),
    ),
  );
  const offeredCoursesWithoutManualListing = sortedCourses(
    snapshot.courses.filter(
      (course) => offeringCourseIds.has(course.courseId) && !manualListingCourseIds.has(course.courseId),
    ),
  );
  const offeringsWithoutMeetings = sortedOfferings(
    snapshot.offerings.filter((offering) => offering.meetings.length === 0),
  );
  const meetingsWithoutRoom = sortedOfferings(snapshot.offerings).flatMap((offering) =>
    offering.meetings
      .filter((meeting) => !meeting.room)
      .map((meeting) => ({
        ...offeringSample(offering),
        meeting: formatMeetingFull(meeting),
      })),
  );
  const offeringsWithCapacityZero = sortedOfferings(snapshot.offerings.filter((offering) => offering.capacity === 0));
  const instructorsWithoutStaffId = sortedOfferings(
    snapshot.offerings.filter((offering) => offering.instructors.some((instructor) => !instructor.staffId)),
  );
  const instructorCountWithoutStaffId = snapshot.offerings.reduce(
    (sum, offering) => sum + offering.instructors.filter((instructor) => !instructor.staffId).length,
    0,
  );
  const groupSample = (group: (typeof offeringGroups)[number]): OfferingGroupQualitySample => ({
    offeringGroupId: group.offeringGroupId,
    term: group.term,
    courseCodes: group.courseCodes,
    sections: Array.from(new Set(group.sections.map((section) => section.section))).sort(),
    departments: group.departments,
  });
  const multiCodeOfferingGroups = offeringGroups
    .filter((offeringGroup) => offeringGroup.courseCodes.length > 1)
    .map(groupSample);
  const offeringGroupsWithMultipleDepartments = offeringGroups
    .filter((offeringGroup) => offeringGroup.departments.length > 1)
    .map(groupSample);
  const offeringGroupsWithMultipleSections = offeringGroups
    .filter((offeringGroup) => new Set(offeringGroup.sections.map((section) => section.section)).size > 1)
    .map(groupSample);

  return {
    totals: {
      offeringsWithoutMeetings: offeringsWithoutMeetings.length,
      meetingsWithoutRoom: meetingsWithoutRoom.length,
      offeringsWithCapacityZero: offeringsWithCapacityZero.length,
      instructorsWithoutStaffId: instructorCountWithoutStaffId,
      offeringGroups: offeringGroups.length,
      multiCodeOfferingGroups: multiCodeOfferingGroups.length,
      offeringGroupsWithMultipleDepartments: offeringGroupsWithMultipleDepartments.length,
      offeringGroupsWithMultipleSections: offeringGroupsWithMultipleSections.length,
      manualListedCoursesWithoutOffering: manualListedCoursesWithoutOffering.length,
      offeredCoursesWithoutManualListing: offeredCoursesWithoutManualListing.length,
    },
    byTerm: sortedRecord(byTerm),
    samples: {
      offeringsWithoutMeetings: sample(offeringsWithoutMeetings.map(offeringSample)),
      meetingsWithoutRoom: sample(meetingsWithoutRoom),
      offeringsWithCapacityZero: sample(offeringsWithCapacityZero.map(offeringSample)),
      instructorsWithoutStaffId: sample(instructorsWithoutStaffId.map(offeringSample)),
      multiCodeOfferingGroups: sample(multiCodeOfferingGroups),
      offeringGroupsWithMultipleDepartments: sample(offeringGroupsWithMultipleDepartments),
      offeringGroupsWithMultipleSections: sample(offeringGroupsWithMultipleSections),
      manualListedCoursesWithoutOffering: sample(manualListedCoursesWithoutOffering.map(courseSample)),
      offeredCoursesWithoutManualListing: sample(offeredCoursesWithoutManualListing.map(courseSample)),
    },
  };
}

export function validateCourseCatalogSnapshot(snapshot: CourseCatalogSnapshot): string[] {
  const issues: string[] = [];
  const courseIds = new Set<string>();
  const courseCodes = new Set<string>();
  const codeOwners = new Map<string, string>();
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
    for (const code of Array.from(new Set([course.primaryCode, ...course.aliases.map((alias) => alias.code)]))) {
      const owner = codeOwners.get(code);
      if (owner && owner !== course.courseId)
        issues.push(`${code}: ambiguous course owners ${owner}, ${course.courseId}`);
      codeOwners.set(code, course.courseId);
    }
    course.aliases.forEach((alias) => {
      const key = alias.code;
      if (courseCodes.has(key) && alias.relation === 'primary') {
        issues.push(`${course.courseId}: duplicate primary code ${key}`);
      }
      if (alias.relation === 'primary') courseCodes.add(key);
    });
    course.sourceRefs.forEach((sourceRef) => {
      if (!sourceRef.kind || !sourceRef.sourceId)
        issues.push(`${course.courseId}: invalid sourceRef ${sourceRefKey(sourceRef)}`);
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
