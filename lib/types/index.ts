import type { CreditRecognition } from '@features/graduation/domain/credit-recognition';
export interface UserTakenCourse {
  courseCode: string;
  creditRecognition?: CreditRecognition;
  courseName: string;
  courseType: string | 'HUS' | 'PPE' | '필수';
  credit: number;
  grade: string;
  gradeStatus?: 'official' | 'in_progress' | 'provisional';
  gradeStatusReason?: string;
  semester: string;
  year: number;
}

export interface UserStatusType {
  studentId: string;
  userTakenCourseList: Array<UserTakenCourse>;
}
