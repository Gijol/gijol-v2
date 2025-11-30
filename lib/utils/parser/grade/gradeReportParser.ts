/* eslint-disable */
import { read, WorkSheet } from 'xlsx';
import { TakenCourse } from './TakenCourse';
import { HUS_COURSES, PPE_COURSES, GSC_COURSES } from '@const/course-code-classification';

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

      const rawType = this.accessValueOfWorkSheet(workSheet, address(TYPE_CELL_INDEX, index));
      const code = this.accessValueOfWorkSheet(workSheet, address(CODE_CELL_INDEX, index));
      const course = this.accessValueOfWorkSheet(workSheet, address(COURSE_NAME_CELL_INDEX, index));
      const credit = this.accessValueOfWorkSheet(workSheet, address(CREDIT_CELL_INDEX, index));
      const grade = this.accessValueOfWorkSheet(workSheet, address(GRADE_CELL_INDEX, index));

      if (grade.includes('U')) {
        continue;
      }

      const isLetterGrade: boolean = ['A', 'B', 'C', 'D', 'F'].some((letterGrade) =>
        grade.includes(letterGrade)
      );
      const canBeDuplicated = ['GS01', 'GS02', 'UC9331'].some((duplicatableCode) =>
        code.includes(duplicatableCode)
      );

      // 🔥 코드 기반으로 HUS / PPE / GSC 전처리
      const type = this.getCourseTypeByCode(code, rawType);

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

  /**
   * 코드 기반으로 HUS / PPE / GSC 타입을 결정.
   * - 코드가 해당 리스트에 있으면 HUS / PPE / GSC 반환
   * - 아니면 기존 엑셀의 type 값을 그대로 사용
   */
  private static getCourseTypeByCode(code: string, fallbackType: string): string {
    const trimmedCode = code.trim();

    if (HUS_COURSES.has(trimmedCode)) return 'HUS';
    if (PPE_COURSES.has(trimmedCode)) return 'PPE';
    if (GSC_COURSES.has(trimmedCode)) return 'GSC';

    // 코드 매칭 안 되면 기존 이수구분(or 빈 문자열) 유지
    return fallbackType;
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

  private static createSheet(file: string | ArrayBuffer) {
    // xlsx.read accepts different "type" options depending on input
    const isString = typeof file === 'string';
    const readOpts = isString ? { type: 'binary' as const } : { type: 'array' as const };
    const workBook = read(file as any, readOpts);
    const sheetNames = workBook.SheetNames;
    if (sheetNames.length > 1) throw new Error('유효하지 않은 파일입니다.');
    const sheetName = sheetNames[0];
    return workBook.Sheets[sheetName];
  }
}
