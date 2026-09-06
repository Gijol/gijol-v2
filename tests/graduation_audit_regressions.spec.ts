import { course, evaluateFor, expectRequirement } from './helpers/graduation-fixtures';
import { buildGraduationRecommendationGroups } from '../features/graduation/data/source-backed-recommendations';
import { getServerCourseCatalogRecommendationIndex } from '../features/course-catalog/server-catalog-query';
import { normalizeTakenCourses } from '../features/graduation/middlewares/validation';

describe('2026 manual audit regressions', () => {
  it('preserves approved uncoded transfer credit and its assigned area', async () => {
    const courses = normalizeTakenCourses({
      takenCourses: [
        course({
          courseCode: '',
          courseName: '인정과목',
          grade: 'S',
          creditRecognition: { status: 'approved', category: 'major' },
        }),
      ],
    }).takenCourses;
    const result = await evaluateFor(2026, courses);
    expect(result.totalCredits).toBe(3);
    expect(result.graduationCategory.major.totalCredits).toBe(3);
  });
  it('keeps pending recognition visible without counting it as approved credit', async () => {
    const result = await evaluateFor(2026, [
      course({ courseCode: 'EXT101', creditRecognition: { status: 'pending' } }),
    ]);
    expect(result.totalCredits).toBe(0);
    expect(result.overallStatus).toBe('needs_review');
  });
  it('applies the humanities graduation credit cap without deleting transcript rows', async () => {
    const result = await evaluateFor(
      2026,
      Array.from({ length: 13 }, (_, i) => course({ courseCode: `HS${6000 + i}` })),
    );
    expect(result.totalCredits).toBe(36);
    expect(Object.values(result.graduationCategory).flatMap((c) => c.userTakenCoursesList.takenCourses)).toHaveLength(
      13,
    );
  });
  it('accepts probability only for the 2026+ mathematics choice', async () => {
    const courses = [course({ courseCode: 'GS2008', courseName: '확률과 통계' })];
    expectRequirement(await evaluateFor(2026, courses), 'science-core-math', { satisfied: true });
    expectRequirement(await evaluateFor(2025, courses), 'science-core-math', { satisfied: false });
  });

  it('accepts the manual exploration code and exempts semiconductor students', async () => {
    expectRequirement(await evaluateFor(2026, [course({ courseCode: 'GS1900', credit: 1 })]), 'etc-major-exploration', {
      satisfied: true,
    });
    const exempt = await evaluateFor(2026, [], { userMajor: 'SE' });
    expect(exempt.fineGrainedRequirements.find((r) => r.id === 'etc-major-exploration')).toBeUndefined();
    expect(exempt.catalogSelection.applicableRules.some((r) => r.id.endsWith('.etc-major-exploration'))).toBe(false);
  });

  it('uses the materials major minimum in both the category and detailed rule', async () => {
    const result = await evaluateFor(2026, [], { userMajor: 'MA' });
    expectRequirement(result, 'major-credits', { requiredCredits: 30 });
    expect(result.graduationCategory.major.minConditionCredits).toBe(30);
  });

  it('preserves repeatable sports across semesters and counts semesters', async () => {
    const courses = normalizeTakenCourses({
      takenCourses: [
        course({ courseCode: 'GS0101', credit: 0, grade: 'S', semester: '1' }),
        course({ courseCode: 'GS0101', credit: 0, grade: 'S', semester: '2' }),
      ],
    }).takenCourses;
    expect(courses).toHaveLength(2);
    expectRequirement(await evaluateFor(2026, courses), 'sports', {
      satisfied: true,
      acquiredCredits: 2,
      unit: 'semesters',
    });
    expectRequirement(
      await evaluateFor(2026, [
        course({ courseCode: 'GS0101', credit: 0 }),
        course({ courseCode: 'GS0102', credit: 0 }),
      ]),
      'sports',
      { satisfied: false, acquiredCredits: 1 },
    );
  });
  it('keeps software basics separate from the three science fields', async () => {
    const result = await evaluateFor(2026, [
      course({ courseCode: 'GS1001' }),
      course({ courseCode: 'GS2001' }),
      course({ courseCode: 'GS1490', credit: 2 }),
      course({ courseCode: 'GS1101' }),
      course({ courseCode: 'GS1111', credit: 1 }),
      course({ courseCode: 'GS1201' }),
      course({ courseCode: 'GS1211', credit: 1 }),
      course({ courseCode: 'GS1301' }),
      course({ courseCode: 'GS1311', credit: 1 }),
    ]);
    expectRequirement(result, 'science-total', { satisfied: true, acquiredCredits: 18 });
    expect(
      result.graduationCategory.scienceBasic.userTakenCoursesList.takenCourses.map((c) => c.courseCode),
    ).not.toContain('GS1490');
    expect(result.totalCredits).toBe(20);
  });

  it('preserves an incomplete chemistry field in the science progress list', async () => {
    const result = await evaluateFor(2026, [course({ courseCode: 'GS1201' })]);
    expect(result.graduationCategory.scienceBasic.totalCredits).toBe(3);
    expectRequirement(result, 'science-total', { satisfied: false });
  });

  it.each(['HS2523', 'HS3754'])('uses the explicit humanities classification for %s', async (code) => {
    const result = await evaluateFor(2026, [
      course({ courseCode: code, courseName: code === 'HS2523' ? '영어단편소설 읽기' : '사회물리학: 네트워크적 접근' }),
    ]);
    expect(result.graduationCategory.humanities.totalCredits).toBe(3);
    expectRequirement(result, 'humanities-total', { acquiredCredits: 3 });
  });

  it.each(['GS1002', 'MM2001', 'GS2013'])('preserves recognized mathematics code %s in an allocation', async (code) => {
    const result = await evaluateFor(2025, [course({ courseCode: code })]);
    expectRequirement(result, 'science-core-math', { satisfied: true });
    expect(result.graduationCategory.scienceBasic.totalCredits).toBe(3);
    expect(Object.values(result.graduationCategory).flatMap((c) => c.userTakenCoursesList.takenCourses)).toHaveLength(
      1,
    );
  });

  it('does not use chemistry II instead of the required chemistry I field', async () => {
    const result = await evaluateFor(2026, [
      course({ courseCode: 'GS1202' }),
      course({ courseCode: 'GS1212', credit: 1 }),
    ]);
    expect(result.graduationCategory.scienceBasic.totalCredits).toBe(0);
    expect(result.graduationCategory.otherUncheckedClass.totalCredits).toBe(4);
  });

  it('still recommends programming after software basics when science credits are missing', async () => {
    const takenCourses = [course({ courseCode: 'GS1490', credit: 2 })];
    const result = await evaluateFor(2026, takenCourses);
    const groups = buildGraduationRecommendationGroups({
      result,
      takenCourses,
      userMajor: 'EC',
      courseCatalogIndex: getServerCourseCatalogRecommendationIndex(),
    });
    const codes = groups.allRecommendations.map((c) => c.courseCode);
    expect(codes).toContain('GS1401');
    expect(codes).not.toContain('GS1490');
  });
});

it('does not recommend a legacy GS humanities course again under the matching HS code and title', async () => {
  const takenCourses = [course({ courseCode: 'GS2789', courseName: '안보와 무기체계' })];
  const result = await evaluateFor(2026, takenCourses);
  const groups = buildGraduationRecommendationGroups({
    result,
    takenCourses,
    userMajor: 'EC',
    courseCatalogIndex: getServerCourseCatalogRecommendationIndex(),
  });
  expect(groups.allRecommendations.map((c) => c.courseCode)).not.toContain('HS2789');
});

it('counts only GIST colloquium semesters and requires both colloquium types for SE', async () => {
  const gist = course({ courseCode: 'UC9331', credit: 0, semester: '1' });
  const second = course({ courseCode: 'UC9331', credit: 0, semester: '2' });
  expectRequirement(await evaluateFor(2026, [gist, gist]), 'etc-colloquium', { satisfied: false, acquiredCredits: 1 });
  expectRequirement(await evaluateFor(2026, [gist, second]), 'etc-colloquium', { satisfied: true, unit: 'semesters' });
  expectRequirement(await evaluateFor(2026, [gist, second], { userMajor: 'SE' }), 'etc-colloquium', {
    satisfied: false,
    acquiredCredits: 1,
  });
  expectRequirement(
    await evaluateFor(2026, [gist, course({ courseCode: 'SE9999', courseName: '반도체 콜로퀴움', credit: 0 })], {
      userMajor: 'SE',
    }),
    'etc-colloquium',
    { satisfied: true },
  );
  expectRequirement(
    await evaluateFor(2026, [course({ courseCode: 'MM4901', courseName: '수학 콜로퀴움' })]),
    'etc-colloquium',
    { satisfied: false, acquiredCredits: 0 },
  );
});

it('checks MM 2026 mandatory groups separately from the six elective credits and basic science', async () => {
  const codes = ['GS1001', 'GS2008', 'MM2001', 'MM2002', 'MM3101', 'MM3201'];
  const result = await evaluateFor(
    2026,
    codes.map((courseCode) => course({ courseCode })),
    { userMinors: ['MM'] },
  );
  for (let i = 0; i < 3; i++) expectRequirement(result, `minor-mandatory-rule-MM-${i}`, { satisfied: true });
  expectRequirement(result, 'minor-mm-electives-2026', { satisfied: false, acquiredCredits: 0 });
  const complete = await evaluateFor(
    2026,
    [...codes, 'MM3203', 'MM3301'].map((courseCode) => course({ courseCode })),
    { userMinors: ['MM'] },
  );
  expectRequirement(complete, 'minor-mm-electives-2026', { satisfied: true, acquiredCredits: 6 });
});

it('suppresses the modern laboratory I recommendation for a verified 2020 laboratory I completion', async () => {
  const taken = [course({ courseCode: 'MC3212', year: 2020 })];
  const result = await evaluateFor(2020, taken, { userMajor: 'MC' });
  const groups = buildGraduationRecommendationGroups({
    result,
    userMajor: 'MC',
    takenCourses: taken,
    courseCatalogIndex: getServerCourseCatalogRecommendationIndex(),
  });
  expect(groups.takenCourseCodes.has('MC3106')).toBe(true);
  expect(groups.allRecommendations.some((r) => r.courseCode === 'MC3106')).toBe(false);
});
