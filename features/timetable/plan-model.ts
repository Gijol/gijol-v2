import type { SectionOffering, SelectedSection, TimetableSpan } from '@/lib/types/timetable';
import type {
  TimetableCourseCandidate,
  TimetablePlanAlternative,
  TimetableSectionInfoStatus,
  TimetableSectionSnapshot,
} from '@/lib/types/timetable-plan';
import { normalizeCourseCode } from '@/features/course-catalog/normalize';
import { sectionToSpans } from './selectors';

export function createSectionKey(section: Pick<SectionOffering, 'course_code' | 'section'>): string {
  return `${normalizeCourseCode(section.course_code)}-${String(section.section).trim()}`;
}

export function getPlanStatus(sectionInfoStatus: TimetableSectionInfoStatus) {
  return sectionInfoStatus === 'available' ? 'section_selectable' : 'preparing';
}

export function sectionToSnapshot(section: SectionOffering): TimetableSectionSnapshot {
  return {
    sectionKey: createSectionKey(section),
    department: section.department,
    course_code: section.course_code,
    section: section.section,
    title: section.title,
    category: section.category,
    subcategory: section.subcategory,
    research_area: section.research_area,
    program: section.program,
    hours: section.hours,
    meetings: section.meetings,
    capacity: section.capacity,
    capacity_status: section.capacity_status,
    syllabus: section.syllabus,
    video: section.video,
    language: section.language,
    instructors: section.instructors,
  };
}

export function snapshotToSectionOffering(snapshot: TimetableSectionSnapshot): SectionOffering {
  return {
    no: 0,
    department: snapshot.department,
    course_code: snapshot.course_code,
    section: snapshot.section,
    title: snapshot.title,
    category: snapshot.category,
    subcategory: snapshot.subcategory,
    research_area: snapshot.research_area,
    program: snapshot.program,
    hours: snapshot.hours,
    meetings: snapshot.meetings,
    capacity: snapshot.capacity,
    capacity_status: snapshot.capacity_status,
    syllabus: snapshot.syllabus,
    video: snapshot.video,
    language: snapshot.language,
    instructors: snapshot.instructors,
  };
}

export function candidateToSelectedSection(candidate: TimetableCourseCandidate): SelectedSection | null {
  if (!candidate.selectedSection) return null;

  return {
    id: candidate.selectedSection.sectionKey,
    section: snapshotToSectionOffering(candidate.selectedSection.snapshot),
    color: candidate.color ?? '#eff6ff|#60a5fa',
  };
}

export function getSelectedSectionsFromPlan(plan: TimetablePlanAlternative): SelectedSection[] {
  return plan.candidates
    .map(candidateToSelectedSection)
    .filter((section): section is SelectedSection => Boolean(section));
}

export function getScheduledSpansFromPlan(plan: TimetablePlanAlternative): TimetableSpan[] {
  return getSelectedSectionsFromPlan(plan).flatMap((section) => sectionToSpans(section, 'scheduled'));
}

export function getSelectedSectionKeysFromPlan(plan: TimetablePlanAlternative): Set<string> {
  return new Set(
    plan.candidates.flatMap((candidate) => (candidate.selectedSection ? [candidate.selectedSection.sectionKey] : [])),
  );
}
