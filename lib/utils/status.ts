import { UserType } from '../types';

export const getPeriodWithTakenCourse = (data: UserType) => {
  const initYear = data.userTakenCourseList.at(0)?.year as number;
  const finalYear = data.userTakenCourseList.at(-1)?.year as number;
  const semesters = ['1학기', '여름학기', '2학기', '겨울학기'];

  let result = [];

  for (let i = initYear; i <= finalYear; i++) {
    for (const j in semesters) {
      result.push({
        period: `${i}년도 ${semesters[j]}`,
        userTakenCourseList: data.userTakenCourseList.filter(
          (course) => course.year === i && course.semester === semesters[j]
        ),
      });
    }
  }
  return result;
};
