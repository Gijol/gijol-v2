import type { CreditRecognition } from '@features/graduation/domain/credit-recognition';
export type EditableCourseRow = {
  id: string; // React key용
  year: number | '';
  semester: string;
  courseType: string;
  courseCode: string;
  creditRecognition?: CreditRecognition;
  courseName: string;
  credit: number | '';
  grade?: string;
};
