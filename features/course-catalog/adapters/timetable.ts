import type { SectionOffering } from '@/lib/types/timetable';
import type { CourseCatalogOffering } from '../types';
import { normalizeCourseCode, timetableSourceRef } from '../normalize';

function normalizeProgram(program: string): CourseCatalogOffering['program'] {
  if (program === '학사') return 'undergraduate';
  if (program === '대학원') return 'graduate';
  return 'unknown';
}

export function timetableSectionToOffering(
  section: SectionOffering,
  options: {
    term: string;
    sourcePath: string;
    resolveCourseId: (courseCode: string) => string;
  },
): CourseCatalogOffering | null {
  const courseCode = normalizeCourseCode(section.course_code);
  if (!courseCode || !section.section) return null;
  const meetings = Array.isArray(section.meetings) ? section.meetings : [];
  const instructors = Array.isArray(section.instructors) ? section.instructors : [];

  return {
    offeringId: `${options.term}:${courseCode}:${section.section}`,
    courseId: options.resolveCourseId(courseCode),
    courseCode,
    term: options.term,
    section: section.section,
    title: section.title || courseCode,
    department: section.department,
    category: section.category,
    subcategory: section.subcategory,
    program: normalizeProgram(section.program),
    credits: section.hours?.credits,
    lectureHours: section.hours?.lecture_hours,
    labHours: section.hours?.lab_hours,
    capacity: section.capacity,
    language: section.language,
    meetings: meetings.map((meeting) => ({
      day: meeting.day,
      start: meeting.start,
      end: meeting.end,
      room: meeting.room,
    })),
    instructors: instructors.map((instructor) => ({
      name: instructor.name,
      staffId: instructor.staff_id,
    })),
    sourceRefs: [timetableSourceRef(options.sourcePath)],
  };
}

export function buildOfferingsFromTimetable(
  sections: readonly SectionOffering[],
  options: {
    term: string;
    sourcePath: string;
    resolveCourseId: (courseCode: string) => string;
  },
): CourseCatalogOffering[] {
  return sections
    .map((section) => timetableSectionToOffering(section, options))
    .filter((offering): offering is CourseCatalogOffering => offering !== null);
}
