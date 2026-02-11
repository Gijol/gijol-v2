import { uploadAndEvaluate } from './uploadAndEvaluate';

describe('uploadAndEvaluate', () => {
  it('fails when entryYear cannot be inferred and is not provided', async () => {
    const result = await uploadAndEvaluate({
      userTakenCourseList: [
        {
          year: 2022,
          semester: '1',
          courseType: '전공',
          courseName: '자료구조',
          courseCode: 'CS2001',
          credit: 3,
          grade: 'A0',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]).toContain('Entry year is required');
  });

  it('fails for unsupported entry year', async () => {
    const result = await uploadAndEvaluate(
      {
        userTakenCourseList: [
          {
            year: 2017,
            semester: '1',
            courseType: '전공',
            courseName: '기초과목',
            courseCode: 'CS1001',
            credit: 3,
            grade: 'A0',
          },
        ],
      },
      { entryYear: 2017 },
    );

    expect(result.success).toBe(false);
    expect(result.errors?.[0]).toContain('Unsupported entry year');
  });

  it('succeeds when entryYear is inferred from studentId', async () => {
    const result = await uploadAndEvaluate({
      studentId: '20211234',
      userTakenCourseList: [
        {
          year: 2022,
          semester: '봄학기',
          courseType: '교양',
          courseName: '영어 I',
          courseCode: 'GS1607',
          credit: 2,
          grade: 'A0',
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
