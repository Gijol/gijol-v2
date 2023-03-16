import path from "path";
import {readFile, WorkSheet} from "xlsx";
import {start} from "repl";

const TYPE_CELL_INDEX = 'A';
const CODE_CELL_INDEX = 'B';
const COURSE_NAME_CELL_INDEX = 'D';
const CREDIT_CELL_INDEX = 'E';
const GRADE_CELL_INDEX = 'F';
const VALUE_KEY = 'v';
const START_INDEX = 3;

export class GradeReportParser {

  public static async readXlsxFile(file: any): Promise<void> {
    const filePath = path.resolve(__dirname, 'grade_report.xls');
    const workSheet = SheetCreator.createSheet(filePath);
    const studentId = this.parseStudentId(workSheet);

    let index = START_INDEX;
    while (true){
      index++;

      const workSheetElementElement = workSheet['D' + index.toString()]
      if (workSheetElementElement !== undefined) console.log(workSheetElementElement);
      if (this.notExistCodeRow(workSheet, index)){
        continue;
      }

      if (this.isEndOfCode(workSheet, index)){
        break;
      }

    }

  }

  private static isEndOfCode(workSheet: WorkSheet, index: number){
    const workSheetIdx = COURSE_NAME_CELL_INDEX + index.toString();
    const workSheetElement:string = workSheet[workSheetIdx][VALUE_KEY];
    return workSheetElement !== undefined && workSheetElement.includes('[학사]');
  }

  private static notExistCodeRow(workSheet: WorkSheet, index: number) {
    const workSheetIdx = CODE_CELL_INDEX + index.toString();
    const workSheetElement = workSheet[workSheetIdx];
    return workSheetElement === undefined || workSheetIdx === 'Code';
  }

  private static parseStudentId(workSheet: any){
    const studentIdString = workSheet['A2'][VALUE_KEY];
    return studentIdString.split(':')[1].trim(); // format: StudentNo.:20205185
  }

}

class SheetCreator{

  // TODO: change param type to FileWithPath
  public static createSheet(file: any) {
    const workBook = readFile(file);
    const sheetNames = workBook.SheetNames;
    if (sheetNames.length > 1) throw Error('유효하지 않은 파일입니다.');
    let sheetName = sheetNames[0];
    return workBook.Sheets[sheetName];
  }

}

GradeReportParser.readXlsxFile('');