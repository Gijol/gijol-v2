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

// TODO: 무슨 의도로 넣었는지 확인 필요
export interface UserTakenCourseWithGradeType {
  userTakenCourseBySemesterResponses: SemesterStatusType[];
  averageGrade: number;
  totalCredit: number;
}
