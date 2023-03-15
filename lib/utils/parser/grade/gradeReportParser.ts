import path from "path";
import {readFile} from "xlsx";

const TYPE_CELL_INDEX = 0;
const CODE_CELL_INDEX = 1;
const COURSE_NAME_CELL_INDEX = 3;
const CREDIT_CELL_INDEX = 4;
const GRADE_CELL_INDEX = 5;

export class GradeReportParser {

  public static async readXlsxFile(file: any): Promise<void> {
    let filePath = path.resolve(__dirname, 'grade_report.xls');
    let workSheet = this.createSheet(filePath);
    console.log(workSheet);
  }

  // TODO: change param type to FileWithPath
  private static createSheet(file: any) {
    const workBook = readFile(file);
    const sheetNames = workBook.SheetNames;
    if (sheetNames.length > 1) throw Error('유효하지 않은 파일입니다.');
    let sheetName = sheetNames[0];
    return workBook.Sheets[sheetName];
  }
}

GradeReportParser.readXlsxFile('');