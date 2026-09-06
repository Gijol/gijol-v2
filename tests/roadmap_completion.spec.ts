import { isRoadmapCourseCompleted } from '../features/roadmap/completion';

it('shows only completed transcript courses on a roadmap', () => {
  const node = { courseCode: 'GS1001' };
  expect(isRoadmapCourseCompleted(node, [{ courseCode: 'GS1001', grade: 'A0' }])).toBe(true);
  for (const grade of ['', 'F', 'U'])
    expect(isRoadmapCourseCompleted(node, [{ courseCode: 'GS1001', grade }])).toBe(false);
  expect(isRoadmapCourseCompleted(node, [{ courseCode: 'GS1001', grade: 'A0', gradeStatus: 'in_progress' }])).toBe(
    false,
  );
  expect(isRoadmapCourseCompleted({}, [{ courseCode: '', grade: 'A0' }])).toBe(false);
});
