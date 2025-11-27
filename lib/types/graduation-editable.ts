export type EditableCourseRow = {
  id: string; // React key용
  year: number | '';
  semester: string;
  courseType: string;
  courseCode: string;
  courseName: string;
  credit: number | '';
  grade?: string;
};
