import type { UserStatusType } from '../types';
import { GradeReportParser } from '@utils/parser/grade/gradeReportParser';

function isValidUserStatus(parsed: any): parsed is UserStatusType {
  if (!parsed || typeof parsed !== 'object') return false;
  if (!parsed.studentId) return false;

  if (!Array.isArray(parsed.userTakenCourseList)) return false;
  if (parsed.userTakenCourseList.length === 0) return false;

  const first = parsed.userTakenCourseList[0];
  if (!first) return false;

  if (!('year' in first) || !('semester' in first) || !('credit' in first)) return false;

  return true;
}

export async function parseGradeBuffer(buffer: Buffer): Promise<UserStatusType> {
  try {
    // 1) Buffer → GradeReportParser가 먹을 수 있는 형태로 변환
    const binaryStr = buffer.toString('binary');

    // 2) 실제 파싱
    const parsed = GradeReportParser.readXlsxFile(binaryStr);

    // 3) 최소 구조 검증
    if (!isValidUserStatus(parsed)) {
      const err: any = new Error('INVALID_GRADE_REPORT');
      err.code = 'INVALID_GRADE_REPORT';
      throw err;
    }

    return parsed;
  } catch (e: any) {
    // 여기서 PARSE_TIMEOUT 같은 걸 직접 던지게 만들 수도 있음
    // (GradeReportParser 내부에서 Row 루프 돌면서 시간 체크하는 방식)
    if (e?.code === 'INVALID_GRADE_REPORT') {
      throw e; // 그대로 위로
    }

    const err: any = new Error(e?.message || 'PARSING_FAILED');
    err.code = e?.code || 'PARSING_FAILED';
    throw err;
  }
}
