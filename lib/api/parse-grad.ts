import { GradeReportParser } from '../utils/parser/grade/gradeReportParser';

export async function parseGradeBuffer(buffer: Buffer) {
  try {
    // GradeReportParser.readXlsxFile expects a binary string like FileReader.readAsBinaryString produced
    const binary = buffer.toString('binary');
    // call parser and return
    return GradeReportParser.readXlsxFile(binary);
  } catch (err) {
    // normalize error
    throw new Error((err as Error)?.message || 'Unknown parse error');
  }
}
