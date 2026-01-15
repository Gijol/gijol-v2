import { evaluateGraduationStatus } from './index';
import { UserTakenCourseListType } from '@lib/types/grad';

describe('Graduation Engine (Real Logic)', () => {
  it('should correctly evaluate graduation status with real course codes', async () => {
    // A mock student with some taken courses
    const mockCourses: UserTakenCourseListType = {
      takenCourses: [
        {
          year: 2020,
          semester: '1',
          courseType: '전공',
          courseName: 'Computer Architecture',
          courseCode: 'GS1401',
          credit: 3,
        }, // Computer Programming (Science Basic)
        { year: 2020, semester: '1', courseType: '전공', courseName: 'Calculus', courseCode: 'GS1001', credit: 3 }, // Calculus (Science Basic)
        { year: 2020, semester: '1', courseType: '교양', courseName: 'English I', courseCode: 'GS1601', credit: 2 }, // English I (Language)
        { year: 2020, semester: '1', courseType: '교양', courseName: 'Writing', courseCode: 'GS1511', credit: 2 }, // Writing (Language)
        { year: 2021, semester: '1', courseType: '전공', courseName: 'Algorithm', courseCode: 'CS300', credit: 3 }, // Major (CS prefix but GS1401 is science basic)
      ],
    };

    console.log('Running Graduation Engine Test with Real Logic...');

    const result = await evaluateGraduationStatus({
      takenCourses: mockCourses,
      ruleContext: {
        entryYear: 2020,
        userMajor: 'CS',
      },
    });

    console.log('Total Credits:', result.totalCredits);
    console.log('Language Basic Satisfied:', result.graduationCategory.languageBasic.satisfied);
    console.log('Science Basic Credits:', result.graduationCategory.scienceBasic.totalCredits);
    console.log('Total Satisfied:', result.totalSatisfied);

    // Check fine-grained requirements
    const fineGrainedRequirements = result.fineGrainedRequirements;

    // Basic Assertions
    expect(result.totalCredits).toBe(13); // 3+3+2+2+3
    expect(result.graduationCategory.scienceBasic.totalCredits).toBeGreaterThanOrEqual(3); // GS1401, GS1001
    expect(result.totalSatisfied).toBe(false); // Definitely not satisfied yet

    // Check for fine-grained existence
    expect(fineGrainedRequirements.length).toBeGreaterThan(0);

    // Check specific requirement: English I should be satisfied
    const englishI = fineGrainedRequirements.find((r) => r.id === 'language-english-i');
    expect(englishI).toBeDefined();
    expect(englishI?.satisfied).toBe(true);

    // Check missing requirement
    const physics = fineGrainedRequirements.find((r) => r.categoryKey === 'scienceBasic' && r.label.includes('물리'));
    if (physics) {
      expect(physics.satisfied).toBe(false);
    }
  });
});
