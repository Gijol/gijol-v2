import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverallAcademicCard from '../features/courses/components/course-my-overall-academic-card';

describe('OverallAcademicCard', () => {
  it('shows academic context while keeping grade information private until requested', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [gradesVisible, setGradesVisible] = useState(false);
      return (
        <OverallAcademicCard
          totalCredit={72}
          totalRequired={130}
          averageGrade={3.75}
          majorAverageGrade={4.1}
          progress={55}
          studentId="20201234"
          majorName="전기전자컴퓨터공학과"
          entryYear={2020}
          gradesVisible={gradesVisible}
          onGradesVisibleChange={setGradesVisible}
        />
      );
    }

    render(<Harness />);

    expect(screen.getByText('20201234')).toBeInTheDocument();
    expect(screen.getByText('전기전자컴퓨터공학과')).toBeInTheDocument();
    expect(screen.getByText('입학년월')).toBeInTheDocument();
    expect(screen.getByText('2020년 3월')).toBeInTheDocument();
    expect(
      screen.getByText('이수 학점').compareDocumentPosition(screen.getByText('20201234')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByText('•••')).toHaveLength(2);
    expect(screen.queryByText('3.75')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '성적 보기' }));

    expect(screen.getByText('3.75')).toBeInTheDocument();
    expect(screen.getByText('4.1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '성적 숨기기' })).toBeInTheDocument();
  });
});
