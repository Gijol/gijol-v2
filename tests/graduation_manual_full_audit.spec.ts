import { course, evaluateFor, expectRequirement } from './helpers/graduation-fixtures';

const courses = (codes: string[]) => codes.map((courseCode) => course({ courseCode }));
it('requires the 2026 handbook EC minor distribution and letter grading from 2023', async () => {
  const result = await evaluateFor(2026, courses(['EC3102', 'EC3201', 'EC3202', 'EC3203', 'EC3204']), {
    userMinors: ['EC'],
    userMajor: 'MC',
  });
  expectRequirement(result, 'minor-credits-EC', { requiredCredits: 18, satisfied: false });
  expectRequirement(result, 'minor-ec-level-2000', { satisfied: false });
  const su = await evaluateFor(
    2026,
    ['EC2201', 'EC2202', 'EC3101', 'EC3201', 'EC3202', 'EC3203'].map((courseCode) =>
      course({ courseCode, grade: 'S' }),
    ),
    { userMinors: ['EC'], userMajor: 'MC' },
  );
  expectRequirement(su, 'minor-credits-EC', { acquiredCredits: 0, satisfied: false });
});
it('accepts physics choices without separately requiring classical mechanics', async () => {
  const result = await evaluateFor(2026, courses(['PS2102', 'PS3103', 'PS3105']), { userMinors: ['PS'] });
  expect(
    result.fineGrainedRequirements.filter((r) => r.id.startsWith('minor-mandatory-rule-PS')).every((r) => r.satisfied),
  ).toBe(true);
});
it('does not accept three biology lectures without a laboratory', async () => {
  const result = await evaluateFor(2026, courses(['BS2102', 'BS2104', 'BS3105']), { userMinors: ['BS'] });
  expect(
    result.fineGrainedRequirements.filter((r) => r.id.startsWith('minor-mandatory-rule-BS')).some((r) => !r.satisfied),
  ).toBe(true);
});
it.each(['SE', 'PS', 'MA'])('requires handbook mandatory courses for major %s', async (userMajor) => {
  const result = await evaluateFor(2026, [], { userMajor });
  expect(
    result.fineGrainedRequirements.filter((r) => r.id.startsWith(`major-mandatory-rule-${userMajor}`)).length,
  ).toBeGreaterThan(0);
});
it('requires all six mechanical core courses before 2025', async () => {
  const result = await evaluateFor(2024, courses(['MC2100', 'MC2101', 'MC2102']), { userMajor: 'MC' });
  expect(
    result.fineGrainedRequirements.filter((r) => r.id.startsWith('major-mandatory-rule-MC')).some((r) => !r.satisfied),
  ).toBe(true);
});
it('keeps humanities mother courses in humanities even with a declared minor', async () => {
  const result = await evaluateFor(2026, courses(['HS2789']), { userMinors: ['LH_PP'] });
  expect(result.graduationCategory.humanities.totalCredits).toBe(3);
});

it('never puts thesis research into minor credits', async () => {
  const result = await evaluateFor(2026, courses(['BS9102', 'BS9103']), { userMinors: ['BS'] });
  expectRequirement(result, 'minor-credits-BS', { acquiredCredits: 0 });
  expectRequirement(result, 'thesis-i', { satisfied: true });
});
it('counts humanities toward its declared minor without adding total credits twice', async () => {
  const result = await evaluateFor(2026, courses(['HS2704', 'PP2763', 'PP2765']), { userMinors: ['LH_PP'] });
  expectRequirement(result, 'minor-credits-LH_PP', { acquiredCredits: 9 });
  expect(result.graduationCategory.humanities.totalCredits).toBe(9);
  expect(result.graduationCategory.minor.totalCredits).toBe(0);
});
it('requires five biomedical subjects even when four subjects sum to 16 credits', async () => {
  const result = await evaluateFor(
    2026,
    ['MD2101', 'MD3101', 'MD4101', 'MD4201'].map((courseCode) => course({ courseCode, credit: 4 })),
    { userMinors: ['MD'] },
  );
  expectRequirement(result, 'minor-course-count-MD', { satisfied: false });
});

it('recognizes a humanities mother course in the declared CT minor regardless of transcript code', async () => {
  for (const courseCode of ['GS2544', 'HS2544', 'CT2544']) {
    const result = await evaluateFor(2026, [course({ courseCode })], { userMinors: ['CT'] });
    expectRequirement(result, 'minor-credits-CT', { acquiredCredits: 3 });
    expect(result.graduationCategory.humanities.totalCredits).toBe(3);
  }
});
it('excludes the shared organic chemistry code from the biology minor as well', async () => {
  const result = await evaluateFor(2026, courses(['CH2103']), { userMinors: ['BS'] });
  expectRequirement(result, 'minor-credits-BS', { acquiredCredits: 0 });
});
