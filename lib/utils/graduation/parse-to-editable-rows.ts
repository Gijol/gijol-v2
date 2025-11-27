import { v4 as uuid } from 'uuid';
import type { UserStatusType } from '@lib/types/index';
import type { EditableCourseRow } from '@lib/types/graduation-editable';

export function toEditableRows(parsed: UserStatusType | null): EditableCourseRow[] {
  if (!parsed?.userTakenCourseList) return [];
  return parsed.userTakenCourseList.map((c: any) => ({
    id: uuid(),
    year: Number(c.year) || '',
    semester: c.semester || '',
    courseType: c.courseType || '',
    courseCode: c.courseCode || c.code || '',
    courseName: c.courseName || c.course || '',
    credit: Number(c.credit) || '',
    grade: c.grade ?? '',
  }));
}
