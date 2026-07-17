import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseSectionItem } from '../features/timetable/components/CourseSectionItem';
import type { SectionOffering } from '../lib/types/timetable';

const section: SectionOffering = {
  no: 1,
  department: 'AI대학',
  course_code: 'AI3001',
  section: '01',
  title: '인공지능개론',
  category: '전공',
  program: '학사',
  hours: { lecture_hours: 3, lab_hours: 0, credits: 3 },
  meetings: [{ day: 'MON', start: '09:00', end: '10:30' }],
  capacity: 30,
  instructors: [{ name: '김교수', staff_id: '1' }],
};

describe('CourseSectionItem', () => {
  it('copies the course code without the section number and shows feedback', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    render(
      <CourseSectionItem
        section={section}
        isAdded={false}
        isConflict={false}
        onAdd={jest.fn()}
        onRemove={jest.fn()}
        onMouseEnter={jest.fn()}
        onMouseLeave={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'AI3001 강의 코드 복사' }));

    expect(writeText).toHaveBeenCalledWith('AI3001');
    expect(await screen.findByText('AI3001 복사됨')).toBeInTheDocument();
  });
});
