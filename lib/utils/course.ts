import { CourseType } from '../types/course';

export const getCourseTagColor = (tag: string) => {
  switch (tag) {
    case '전공':
      return 'red';
    case '부전공':
      return 'yellow';
    case 'HUS':
    case 'PPE':
      return 'gray';
    default:
      return undefined;
  }
};

export const filterByText = (data: CourseType[] | undefined, text: string) => {
  if (!text) {
    return data;
  }
  return data?.filter(
    (i) =>
      i.courseName.includes(text) ||
      i.courseCode.includes(text) ||
      i.courseTags.includes(text) ||
      i.courseTags.some((tag) => tag.toLowerCase().includes(text.toLowerCase()))
  );
};
