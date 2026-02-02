import { classifyCourse } from '../features/graduation/domain/classifier';

const testCases = [
  { code: 'GS2475', name: 'Environmental Pollution', expected: 'otherUncheckedClass' },
  { code: 'GS2545', name: 'Art and Science', expected: 'humanities' }, // Assuming this was in HUS/PPE lists
  { code: 'GS2812', name: 'Bioethics and Law', expected: 'humanities' },
  { code: 'HS2612', name: 'History', expected: 'humanities' },
  { code: 'GS2472', name: 'Climate Change', expected: 'otherUncheckedClass' }, // Also likely not humanities if GS2475 isn't
];

testCases.forEach((tc) => {
  const result = classifyCourse({
    courseCode: tc.code,
    courseName: tc.name,
    credit: 3,
    year: 2025,
    semester: '1',
    courseType: 'Elective',
    grade: 'A',
  });

  if (result === tc.expected) {
    console.log(`[PASS] ${tc.code}: Expected ${tc.expected}, Got ${result}`);
  } else {
    console.error(`[FAIL] ${tc.code}: Expected ${tc.expected}, Got ${result}`);
  }
});
