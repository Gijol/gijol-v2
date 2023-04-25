import { GradStatusType } from './grad';

export interface LoginProps {
  id: string;
  password: string;
}

export interface TempGradResultType {
  gradResultResponse: GradStatusType;
  overallScoreStatus: unknown;
}

export interface UserTakenCourse {
  courseCode: string;
  courseName: string;
  courseType: string;
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
