import { render, screen } from '@testing-library/react';
import CourseMyTableChart from '../features/courses/components/course-my-table-chart';

describe('course earned credit summary', () => {
  it('lists an F course without counting it as earned semester credit', () => {
    render(
      <CourseMyTableChart
        gradesVisible
        data={[
          {
            year: 2025,
            semester_idx: 0,
            semester_str: '1학기',
            grade: 2,
            userTakenCourseList: [
              {
                courseCode: 'EC2201',
                courseName: '회로이론',
                courseType: '전공',
                credit: 3,
                grade: 'A0',
              },
              {
                courseCode: 'EC2999',
                courseName: '낙제 과목',
                courseType: '전공',
                credit: 3,
                grade: 'F',
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getAllByText('낙제 과목')).toHaveLength(2);
    expect(screen.getByLabelText('총 취득학점 3학점')).toBeInTheDocument();
  });
});
