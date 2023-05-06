/* eslint-disable */
export class TakenCourse {
  public readonly year: number;
  public readonly semester: string;
  public readonly courseType: string;
  public readonly courseCode: string;
  public readonly courseName: string;
  public readonly credit: number;
  public readonly grade: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(
    year: number,
    semester: string,
    type: string,
    code: string,
    course: string,
    credit: number,
    grade: string
  ) {
    const temp = Date.now();
    const isoDate = new Date(temp).toISOString();
    this.courseCode = code;
    this.courseName = course;
    this.courseType = type;
    this.credit = credit;
    this.grade = grade;
    this.semester = semester;
    this.year = year;
    this.createdAt = isoDate;
    this.updatedAt = isoDate;
  }

  public equals(takenCourse: TakenCourse) {
    return (
      this.courseName === takenCourse.courseName &&
      this.credit === takenCourse.credit &&
      this.courseCode === takenCourse.courseCode
    );
  }
}
