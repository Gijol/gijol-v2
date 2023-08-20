export interface CourseWithGradeStatusType {
  courseType: string | null;
  courseName: string;
  courseCode: string;
  credit: number;
  grade: string;
}

export interface SemesterStatusType {
  year: number;
  semester: string;
  averageGradeBySemester: number;
  coursesAndGradeResponses: CourseWithGradeStatusType[];
}

export interface UserTakenCourseWithGradeType {
  userTakenCourseBySemesterResponses: SemesterStatusType[];
  averageGrade: number;
  totalCredit: number;
}
