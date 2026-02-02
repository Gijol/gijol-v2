import ExcelJS from 'exceljs';
import { GradeReportParser } from '../lib/utils/parser/grade/gradeReportParser';

describe('GradeReportParser', () => {
  it('should parse a valid excel file buffer correctly', async () => {
    // 1. Create a mock workbook in memory
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    // A=Type, B=Code, D=Course, E=Credit, F=Grade
    // 1-based index: A=1, B=2, C=3, D=4, E=5, F=6

    // Header (Row 1-2)
    sheet.getCell('A2').value = 'StudentNo.:20211234';

    // Data (Row 3 headers, Row 4+ data)
    // Row 4: Semester Header
    sheet.getCell('D4').value = '<2021년 1/학기>';

    // Row 5: Course 1
    sheet.getCell('A5').value = '교필'; // Type
    sheet.getCell('B5').value = 'GS1001'; // Code
    sheet.getCell('D5').value = 'General Science'; // Course
    sheet.getCell('E5').value = '3'; // Credit
    sheet.getCell('F5').value = 'A+'; // Grade

    // Row 6: Course 2 (Retake U - should be skipped?) or just Normal
    sheet.getCell('A6').value = '전필';
    sheet.getCell('B6').value = 'CS2001';
    sheet.getCell('D6').value = 'Intro to CS';
    sheet.getCell('E6').value = 3;
    sheet.getCell('F6').value = 'B0';

    // End marker
    sheet.getCell('B7').value = '[학사]';

    // 2. Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 3. Parse
    // GradeReportParser.readXlsxFile expects Buffer.
    // writeBuffer returns Buffer (in Node) or ArrayBuffer (in browser).
    // In Jest (Node), it is Buffer.
    const result = await GradeReportParser.readXlsxFile(buffer as any);

    // 4. Assert
    expect(result.studentId).toBe('20211234');
    expect(result.userTakenCourseList).toHaveLength(2);

    const c1 = result.userTakenCourseList[0];
    expect(c1.courseCode).toBe('GS1001');
    expect(c1.year).toBe(2021);
    expect(c1.grade).toBe('A+');

    const c2 = result.userTakenCourseList[1];
    expect(c2.courseCode).toBe('CS2001');
    expect(c2.credit).toBe(3);
  });
});
