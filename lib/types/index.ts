import { GradStatusResponseType } from './grad';

export interface LoginProps {
  id: string;
  password: string;
}

export interface TempGradResultType {
  gradResultResponse: GradStatusResponseType;
  overallScoreStatus: unknown;
}

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

export interface UserType extends UserStatusType {
  email: string;
  name: string;
  idToken: string;
}
