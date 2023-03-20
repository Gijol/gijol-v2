/* eslint-disable */
export class TakenCourse {
  public readonly year: number;
  public readonly semester: string;
  public readonly type: string;
  public readonly code: string;
  public readonly course: string;
  public readonly credit: number;
  public readonly grade: string;

  constructor(year: number, semester: string, type: string, code: string, course: string, credit: number, grade: string) {
    this.year = year;
    this.semester = semester;
    this.type = type;
    this.code = code;
    this.course = course;
    this.credit = credit;
    this.grade = grade;
  }

  public equals(takenCourse: TakenCourse) {
    return this.course === takenCourse.course && this.credit === takenCourse.credit && this.code === takenCourse.code;
  }

}