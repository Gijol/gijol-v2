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
