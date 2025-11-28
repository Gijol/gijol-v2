export interface UserTakenCourse {
  courseCode: string;
  courseName: string;
  courseType: string | 'HUS' | 'PPE' | '필수';
  credit: number;
  grade: string;
  semester: string;
  year: number;
}

export interface UserStatusType {
  studentId: string;
  userTakenCourseList: Array<UserTakenCourse>;
}
