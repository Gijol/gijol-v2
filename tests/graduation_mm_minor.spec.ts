import { evaluateGraduationStatus } from '../features/graduation/domain/engine/index';
import testData from './fixtures/input-20205098.json';

describe('수리과학(MM) 부전공 분류 테스트', () => {
  it('기초과학 요건을 먼저 충족하고 남은 과목만 부전공으로 분류해야 함', async () => {
    const result = await evaluateGraduationStatus({
      takenCourses: { takenCourses: testData.userTakenCourseList as any },
      ruleContext: {
        entryYear: 2020,
        userMajor: 'EC',
        userMinors: ['MM'], // Math minor
      },
    });

    const scienceBasic = result.graduationCategory.scienceBasic.userTakenCoursesList.takenCourses;
    const minorCourses = result.graduationCategory.minor.userTakenCoursesList.takenCourses;

    // 기초과학에 미적분학(GS1001)이 있어야 함
    const hasGS1001InScience = scienceBasic.some((c: any) => c.courseCode === 'GS1001');
    expect(hasGS1001InScience).toBe(true);

    // 기초과학에 수학선택 1과목(GS2001)이 있어야 함
    const hasGS2001InScience = scienceBasic.some((c: any) => c.courseCode === 'GS2001');
    expect(hasGS2001InScience).toBe(true);

    // 부전공에 GS2002, GS2004가 있어야 함
    const hasGS2002InMinor = minorCourses.some((c: any) => c.courseCode === 'GS2002');
    const hasGS2004InMinor = minorCourses.some((c: any) => c.courseCode === 'GS2004');
    expect(hasGS2002InMinor).toBe(true);
    expect(hasGS2004InMinor).toBe(true);

    // 기초과학에 GS2002, GS2004가 없어야 함 (부전공으로 이동됨)
    const hasGS2002InScience = scienceBasic.some((c: any) => c.courseCode === 'GS2002');
    const hasGS2004InScience = scienceBasic.some((c: any) => c.courseCode === 'GS2004');
    expect(hasGS2002InScience).toBe(false);
    expect(hasGS2004InScience).toBe(false);

    console.log('\n=== 검증 결과 ===');
    console.log(`GS1001 (미적분학) → 기초과학: ${hasGS1001InScience ? '✓' : '✗'}`);
    console.log(`GS2001 (다변수해석학) → 기초과학: ${hasGS2001InScience ? '✓' : '✗'}`);
    console.log(`GS2002 (미분방정식) → 부전공: ${hasGS2002InMinor ? '✓' : '✗'}`);
    console.log(`GS2004 (선형대수학) → 부전공: ${hasGS2004InMinor ? '✓' : '✗'}`);
    console.log(`\n기초과학 총 학점: ${result.graduationCategory.scienceBasic.totalCredits}`);
    console.log(`부전공 총 학점: ${result.graduationCategory.minor.totalCredits}`);
  });
});
