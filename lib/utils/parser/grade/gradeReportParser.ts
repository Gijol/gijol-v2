/* eslint-disable */
import { read, WorkSheet } from 'xlsx';
import { TakenCourse } from './TakenCourse';

const TYPE_CELL_INDEX = 'A';
const CODE_CELL_INDEX = 'B';
const COURSE_NAME_CELL_INDEX = 'D';
const CREDIT_CELL_INDEX = 'E';
const GRADE_CELL_INDEX = 'F';
const VALUE_KEY = 'v';
const START_INDEX = 3;

export class GradeReportParser {
  public static readXlsxFile(filePath: string) {
    const workSheet = this.createSheet(filePath);
    let index = START_INDEX;
    const address = (cell: string, row: number) => cell + row;
    let [year, semester] = ['', ''];
    let userTakenCourseList: TakenCourse[] = [];

    while (true) {
      index += 1;
      if (this.isEndOfCode(workSheet, address(CODE_CELL_INDEX, index))) {
        break;
      }

      if (this.isSeparatedByYear(workSheet, address(COURSE_NAME_CELL_INDEX, index))) {
        [year, semester] = this.setYearAndSemester(
          workSheet,
          address(COURSE_NAME_CELL_INDEX, index)
        );
      }

      if (this.notExistCodeRow(workSheet, address(CODE_CELL_INDEX, index))) {
        continue;
      }

      const type = this.accessValueOfWorkSheet(workSheet, address(TYPE_CELL_INDEX, index));
      const code = this.accessValueOfWorkSheet(workSheet, address(CODE_CELL_INDEX, index));
      const course = this.accessValueOfWorkSheet(workSheet, address(COURSE_NAME_CELL_INDEX, index));
      const credit = this.accessValueOfWorkSheet(workSheet, address(CREDIT_CELL_INDEX, index));
      const grade = this.accessValueOfWorkSheet(workSheet, address(GRADE_CELL_INDEX, index));
      if (['F', 'U'].includes(grade)) {
        continue;
      }

      const isLetterGrade: boolean = ['A', 'B', 'C', 'D'].some((letterGrade) =>
        grade.includes(letterGrade)
      );
      const canBeDuplicated = ['GS01', 'GS02', 'UC9331'].some((duplicatableCode) =>
        code.includes(duplicatableCode)
      );
      const addedTakenCourse = new TakenCourse(
        parseInt(year),
        semester,
        type,
        code,
        course,
        parseInt(credit),
        grade
      );

      if (
        userTakenCourseList.some(
          (takenCourse) => takenCourse.equals(addedTakenCourse) && isLetterGrade && !canBeDuplicated
        )
      ) {
        userTakenCourseList = userTakenCourseList.filter(
          (course) => !course.equals(addedTakenCourse)
        );
      }

      userTakenCourseList.push(addedTakenCourse);
    }

    const studentId = this.parseStudentId(workSheet);
    return { studentId, userTakenCourseList };
  }

  private static isEndOfCode(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement: string = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return workSheetElement.includes('[학사]');
  }

  private static notExistCodeRow(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return !workSheetElement || workSheetElement === 'Code';
  }

  private static isSeparatedByYear(workSheet: WorkSheet, excelAddress: string) {
    let workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return workSheetElement && workSheetElement.includes('학기>');
  }

  private static setYearAndSemester(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    const elementWithNoWhitespace = workSheetElement.trim();
    const [year, semester] = elementWithNoWhitespace
      .substring(1, elementWithNoWhitespace.length - 1)
      .split('/');
    return [year, semester];
  }

  private static accessValueOfWorkSheet(workSheet: WorkSheet, excelAddress: string): string {
    if (excelAddress in workSheet) {
      const workSheetElement = workSheet[excelAddress];
      if (VALUE_KEY in workSheetElement) {
        return workSheetElement[VALUE_KEY].trim();
      }
    }

    return '';
  }

  private static parseStudentId(workSheet: any) {
    const studentIdString = workSheet.A2[VALUE_KEY];
    return studentIdString.split(':')[1].trim(); // format: StudentNo.:20205185
  }

  private static createSheet(file: string) {
    const workBook = read(file, { type: 'binary' });
    const sheetNames = workBook.SheetNames;
    if (sheetNames.length > 1) throw Error('유효하지 않은 파일입니다.');
    const sheetName = sheetNames[0];
    return workBook.Sheets[sheetName];
  }
}
