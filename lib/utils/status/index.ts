import {
  CourseWithGradeStatusType,
  SemesterStatusType,
  UserTakenCourseWithGradeType,
} from '@lib/types/score-status';
import { UserTakenCourse } from '../../types';

export type CourseListWithPeriod = {
  year: number;
  semester_idx: number;
  semester_str: string;
  grade: number;
  userTakenCourseList: Array<CourseWithGradeStatusType> | undefined;
};

export const getSortedCourseStatus = (data: UserTakenCourseWithGradeType | undefined) => {
  const semesterList: SemesterStatusType[] | undefined =
    data?.userTakenCourseBySemesterResponses?.sort((a, b) => a.year - b.year);
  const initYear = semesterList?.at(0)?.year as number;
  const finalYear = semesterList?.at(-1)?.year as number;
  const semesters = ['1학기', '여름학기', '2학기', '겨울학기'];

  const result: CourseListWithPeriod[] = [];

  Array.from({ length: finalYear - initYear + 1 }, (_, i) => initYear + i).forEach((year) => {
    semesters.forEach((semesterName, j) => {
      const semesterData = semesterList?.find(
        (course) => course.year === year && course.semester === semesterName
      );
      result.push({
        year,
        semester_idx: j,
        semester_str: semesterName,
        grade: semesterData?.averageGradeBySemester ?? 0,
        userTakenCourseList: semesterData?.coursesAndGradeResponses,
      });
    });
  });
  return result;
};

export const getCntTab = (href: string) => {
  switch (href) {
    case '/dashboard':
      return '홈';
    case '/dashboard/graduation':
      return '내 졸업요건';
    case '/dashboard/graduation/upload':
      return '파일 업로드';
    case '/dashboard/course/my':
      return '내 수강현황';
    case '/dashboard/course/search':
      return '강의 정보';
    case '/dashboard/user-info':
      return '내 정보';
    case '/dashboard/graduation/certificate-builder':
      return '졸업요건 확인서 만들기 ✨';
    case '/dashboard/course/timetable':
      return '시간표 제작하기 ✨';
    default:
      return '';
  }
};

export const getUserScoreFromTakenCourseList = (list: Array<UserTakenCourse>) => {
  let totalGrade = 0;
  let totalCredit = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < list.length; i++) {
    const { credit } = list[i];
    const grade = gradeToNumber(list[i].grade);

    if (!Number.isNaN(credit) && !Number.isNaN(grade)) {
      totalCredit += credit;
      totalGrade += credit * grade;
    }
  }

  return Math.floor((totalGrade / totalCredit) * 100) / 100;
};

export const gradeToNumber = (grade: string) => {
  switch (grade) {
    case 'A+':
      return 4.5;
    case 'A0':
      return 4.0;
    case 'B+':
      return 3.5;
    case 'B0':
      return 3.0;
    case 'C+':
      return 2.5;
    case 'C0':
      return 2.0;
    case 'D+':
      return 1.5;
    case 'D0':
      return 1.0;
    case 'F':
      return 0;
    case 'S':
      return NaN;
    default:
      return NaN;
  }
};

export const convertGradeTo4Scale = (grade: number, scale: number) => {
  if (scale === 4.0) return grade;
  return ((grade / scale) * 4.0).toFixed(2);
};
