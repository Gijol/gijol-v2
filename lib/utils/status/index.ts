import { UserTakenCourse, UserType } from '../../types';
import {
  CourseWithGradeStatusType,
  SemesterStatusType,
  UserTakenCourseWithGradeType,
} from '../../types/score-status';

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

  let result: CourseListWithPeriod[] = [];

  for (let year = initYear; year <= finalYear; year++) {
    for (const j in semesters) {
      const cnt = semesterList
        ?.filter((course) => course.year === year && course.semester === semesters[j])
        .at(0);
      result.push({
        year,
        semester_idx: parseInt(j),
        semester_str: semesters[j],
        grade: cnt?.averageGradeBySemester ?? 0,
        userTakenCourseList: cnt?.coursesAndGradeResponses,
      });
    }
  }
  return result;
};

export const getCntTab = (href: string) => {
  switch (href) {
    case '/dashboard':
      return '홈';
    case '/dashboard/graduation':
      return '내 졸업요건';
    case '/dashboard/course/my':
      return '내 수강현황';
    case '/dashboard/course/search':
      return '강의 정보 확인하기';
    case '/dashboard/user-info':
      return '내 정보';
    case '/dashboard/graduation/certificate-builder':
      return '졸업요건 확인서 만들기 ✨';
    default:
      return '';
  }
};

export const getUserScoreFromTakenCourseList = (list: Array<UserTakenCourse>) => {
  let totalGrade = 0;
  let totalCredit = 0;
  for (let i = 0; i < list.length; i++) {
    const credit = list[i].credit;
    const grade = gradeToNumber(list[i].grade);

    if (!isNaN(credit) && !isNaN(grade)) {
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
