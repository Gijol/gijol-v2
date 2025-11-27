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

export function applyEditableRowsToUserStatus(
  original: UserStatusType,
  rows: EditableCourseRow[]
): UserStatusType {
  return {
    ...original,
    userTakenCourseList: rows.map((r) => ({
      year: r.year === '' ? 0 : Number(r.year), // 임의로 0 처리
      semester: r.semester,
      courseType: r.courseType,
      courseCode: r.courseCode,
      courseName: r.courseName,
      credit: r.credit === '' ? 0 : Number(r.credit), // 임의로 0 처리
      grade: r.grade ?? '', // 임의로 빈문장 처리
    })),
  };
}
