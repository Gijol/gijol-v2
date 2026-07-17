import { render, screen } from '@testing-library/react';
import CourseMyTableChart from '../features/courses/components/course-my-table-chart';
import type { CourseListWithPeriod } from '../lib/utils/status';

const semesterData: CourseListWithPeriod[] = [
  {
    year: 2026,
    semester_idx: 0,
    semester_str: '1학기',
    grade: 4.5,
    userTakenCourseList: [
      {
        courseCode: 'CS101',
        courseName: '컴퓨터 프로그래밍 기초',
        courseType: '전공필수',
        credit: 3,
        grade: 'A+',
      },
    ],
  },
];

describe('CourseMyTableChart', () => {
  it('summarizes the selected semester and does not leak grade color while grades are hidden', () => {
    const { rerender } = render(<CourseMyTableChart data={semesterData} gradesVisible={false} />);

    expect(
      screen.getByText((_, element) => element?.tagName === 'SPAN' && element.textContent === '1과목'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('컴퓨터 프로그래밍 기초')).toHaveLength(2);
    expect(screen.getAllByText('•••').every((badge) => badge.classList.contains('bg-slate-100'))).toBe(true);
    expect(screen.queryByText('A+')).not.toBeInTheDocument();

    rerender(<CourseMyTableChart data={semesterData} gradesVisible />);

    expect(screen.getAllByText('A+').every((badge) => badge.classList.contains('bg-emerald-50'))).toBe(true);
  });
});
