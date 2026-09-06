import { utils, write } from 'xlsx';
jest.mock('uuid', () => ({ v4: () => 'test-row' }));
import { GradeReportParser } from '../lib/utils/parser/grade/gradeReportParser';
import { calcAverageGrade } from '../lib/utils/course/analytics';
import { calculateRecognizedCredits } from '../features/graduation/domain/recognized-credits';
import { course } from './helpers/graduation-fixtures';

it('preserves an uncoded credit row from the uploaded workbook', () => {
  const sheet = utils.aoa_to_sheet([
    [],
    ['StudentNo.:20261234'],
    [],
    ['', '', '', '<2026/1학기>'],
    ['전공', '', '', '타대 인정과목', 3, 'S'],
    ['', '[학사]'],
  ]);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, 'grades');
  const parsed = GradeReportParser.readXlsxFile(write(workbook, { bookType: 'xlsx', type: 'binary' }));
  expect(parsed.userTakenCourseList).toHaveLength(1);
  expect(parsed.userTakenCourseList[0].credit).toBe(3);
});

it('excludes approved external letter grades from GPA', () => {
  const courses = [
    course({ courseCode: 'EC2201', grade: 'A0' }),
    course({ courseCode: 'EXT101', grade: 'D0', creditRecognition: { status: 'approved', category: 'major' } }),
  ];
  expect(calcAverageGrade(courses)).toBe(4);
});

it('does not consume a second credit allowance when a course is excluded by the first', () => {
  const transfers = Array.from({ length: 10 }, (_, i) =>
    course({
      courseCode: `EXT${i}`,
      creditRecognition: { status: 'approved' as const, category: 'otherUncheckedClass' as const },
    }),
  );
  const excluded = course({
    courseCode: 'EXT999',
    credit: 36,
    creditRecognition: { status: 'approved', category: 'humanities' },
  });
  const local = course({ courseCode: 'HS2502' });
  expect(calculateRecognizedCredits([...transfers, excluded, local], 2026, 'EC').total).toBe(33);
});

it('preserves approval metadata through editable rows and persisted transcript derivation', () => {
  const { toEditableRows, applyEditableRowsToUserStatus } = require('../lib/utils/graduation/parse-to-editable-rows');
  const { deriveTakenCourses } = require('../lib/stores/graduation-persistence');
  const parsed = {
    studentId: '20261234',
    userTakenCourseList: [course({ courseCode: '', creditRecognition: { status: 'approved', category: 'major' } })],
  };
  const rows = toEditableRows(parsed);
  const restored = applyEditableRowsToUserStatus(parsed, rows);
  expect(deriveTakenCourses(restored)[0].creditRecognition).toEqual({ status: 'approved', category: 'major' });
});

it('shares the service limit between UC0201 and UC0203 while keeping creativity separate', () => {
  const courses = ['UC0201', 'UC0202', 'UC0203'].map((courseCode) => course({ courseCode, credit: 1 }));
  expect(calculateRecognizedCredits(courses, 2026, 'EC').total).toBe(2);
  const twoActivities = ['UC0201', 'UC0202'].map((courseCode) => course({ courseCode, credit: 1 }));
  expect(calculateRecognizedCredits(twoActivities, 2026, 'EC').total).toBe(2);
});
