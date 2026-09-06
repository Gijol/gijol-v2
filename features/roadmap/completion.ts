import type { CourseNodeData } from './types';

export function isRoadmapCourseCompleted(
  node: Pick<CourseNodeData, 'courseCode' | 'catalog'>,
  courses: readonly {
    courseCode: string;
    grade?: string;
    gradeStatus?: string;
    creditRecognition?: { status: string; matchedCourseCode?: string };
  }[],
): boolean {
  const normalize = (code: string) =>
    code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  const codes = new Set(
    [node.courseCode, ...(node.catalog?.aliasCodes ?? [])]
      .filter((code): code is string => Boolean(code))
      .map(normalize),
  );
  return courses.some(
    (course) =>
      course.creditRecognition?.status !== 'pending' &&
      codes.has(
        normalize(
          course.creditRecognition?.status === 'approved'
            ? course.creditRecognition.matchedCourseCode || course.courseCode
            : course.courseCode,
        ),
      ) &&
      course.gradeStatus !== 'in_progress' &&
      course.gradeStatus !== 'provisional' &&
      /^(A[+0-]?|B[+0-]?|C[+0-]?|D[+0-]?|S|P|PASS)$/.test((course.grade ?? '').trim().toUpperCase()),
  );
}
