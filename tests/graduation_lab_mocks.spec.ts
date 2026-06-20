import { readFileSync } from 'fs';
import { join } from 'path';
import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';
import { normalizeTakenCourses, parseRawToTakenCourses } from '../features/graduation/middlewares/validation';

const MOCK_FILES = [
  'catalog-lab-ec-2021.json',
  'catalog-lab-ai-minor-missing-term.json',
  'catalog-lab-mm-major-2024.json',
  'catalog-lab-uploaded-transcript-2022-1-cs-official.json',
  'catalog-lab-uploaded-transcript-2022-1-in-progress.json',
];

function readMock(filename: string): any {
  const path = join(process.cwd(), 'public/mocks/graduation', filename);
  return JSON.parse(readFileSync(path, 'utf8'));
}

describe('graduation lab mock files', () => {
  it.each(MOCK_FILES)('runs the graduation pipeline for %s', async (filename) => {
    const mock = readMock(filename);
    const result = await uploadAndEvaluate(mock, {
      entryYear: mock.entryYear,
      userMajor: mock.userMajor,
      userMinors: mock.userMinors,
      minorDeclarationTerms: mock.minorDeclarationTerms,
    });

    expect(result.success).toBe(true);
    expect(result.data?.fineGrainedRequirements.length).toBeGreaterThan(0);
    expect(result.data?.catalogSelection?.applicableRules.length).toBeGreaterThan(0);
    expect(result.data?.catalogSelection?.sourceRefs.length).toBeGreaterThan(0);
  });

  it('keeps the AI minor missing declaration term mock visible as catalog needsContext', async () => {
    const mock = readMock('catalog-lab-ai-minor-missing-term.json');
    const result = await uploadAndEvaluate(mock, {
      entryYear: mock.entryYear,
      userMajor: mock.userMajor,
      userMinors: mock.userMinors,
      minorDeclarationTerms: mock.minorDeclarationTerms,
    });

    expect(result.data?.overallStatus).toBe('needs_review');
    expect(result.data?.catalogSelection?.needsContext).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          missingContext: ['declarationTerm'],
          rule: expect.objectContaining({ id: 'minor.ai.mandatory.a' }),
        }),
      ]),
    );
  });

  it('does not infer provisional status from C/S grades in the uploaded transcript mock', async () => {
    const mock = readMock('catalog-lab-uploaded-transcript-2022-1-cs-official.json');
    const latestTermCourses = mock.takenCourses.filter(
      (course: any) => course.year === 2022 && course.semester === '1',
    );

    expect(mock.sourceWorkbook).toEqual(
      expect.objectContaining({
        studentId: '20205185',
        originalCourseRows: 46,
        parsedCourseRows: 45,
      }),
    );
    expect(mock.gradeStatusTerms).toBeUndefined();
    expect(mock.provisionalGradeTerms).toBeUndefined();
    expect(latestTermCourses).toHaveLength(9);
    expect(latestTermCourses.every((course: any) => course.gradeStatus === 'official')).toBe(true);
    expect(new Set(latestTermCourses.map((course: any) => course.grade))).toEqual(new Set(['C', 'S']));
    expect(mock.takenCourses.some((course: any) => course.grade === 'U')).toBe(false);

    const normalized = normalizeTakenCourses(parseRawToTakenCourses(mock));
    const normalizedLatestTermCourses = normalized.takenCourses.filter(
      (course: any) => course.year === 2022 && course.semester === '1',
    );

    expect(normalizedLatestTermCourses.every((course: any) => course.gradeStatus === 'official')).toBe(true);
  });

  it('marks blank grade rows as in-progress grade data', async () => {
    const mock = readMock('catalog-lab-uploaded-transcript-2022-1-in-progress.json');
    const inProgressCourses = mock.takenCourses.filter(
      (course: any) => course.year === 2022 && course.semester === '1',
    );

    expect(mock.gradeStatusTerms).toEqual([
      expect.objectContaining({
        year: 2022,
        semester: '1',
        status: 'in_progress',
        courseCount: 9,
        gradeValues: [''],
      }),
    ]);
    expect(inProgressCourses).toHaveLength(9);
    expect(inProgressCourses.every((course: any) => course.grade === '')).toBe(true);
    expect(inProgressCourses.every((course: any) => course.gradeStatus === 'in_progress')).toBe(true);

    const normalized = normalizeTakenCourses(parseRawToTakenCourses(mock));
    const normalizedInProgressCourses = normalized.takenCourses.filter(
      (course: any) => course.year === 2022 && course.semester === '1',
    );

    expect(normalizedInProgressCourses.every((course: any) => course.grade === '')).toBe(true);
    expect(normalizedInProgressCourses.every((course: any) => course.gradeStatus === 'in_progress')).toBe(true);
  });

  it('does not emit unsourced CSE101 recommendations for the uploaded transcript mock', async () => {
    const mock = readMock('catalog-lab-uploaded-transcript-2022-1-in-progress.json');
    const result = await uploadAndEvaluate(mock, {
      entryYear: mock.entryYear,
      userMajor: mock.userMajor,
      userMinors: mock.userMinors,
      minorDeclarationTerms: mock.minorDeclarationTerms,
    });

    expect(result.success).toBe(true);
    expect(result.data?.recommendations ?? []).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          courseCode: 'CSE101',
        }),
      ]),
    );
  });

  it('emits source-backed EC recommendations when EC major credits are missing', async () => {
    const mock = readMock('catalog-lab-ec-2021.json');
    const result = await uploadAndEvaluate(mock, {
      entryYear: mock.entryYear,
      userMajor: mock.userMajor,
      userMinors: mock.userMinors,
      minorDeclarationTerms: mock.minorDeclarationTerms,
    });
    const recommendedCodes = result.data?.recommendations.map((recommendation) => recommendation.courseCode) ?? [];

    expect(result.success).toBe(true);
    expect(recommendedCodes).toContain('EC2202');
    expect(recommendedCodes).not.toContain('CSE101');
  });

  it('excludes in-progress courses from source-backed recommendation targets', async () => {
    const mock = readMock('catalog-lab-ec-2021.json');
    const result = await uploadAndEvaluate(
      {
        ...mock,
        takenCourses: [
          ...mock.takenCourses,
          {
            year: 2026,
            semester: '1',
            courseType: '전공',
            courseName: '자료 구조',
            courseCode: 'EC2202',
            credit: 3,
            grade: '',
            gradeStatus: 'in_progress',
          },
        ],
      },
      {
        entryYear: mock.entryYear,
        userMajor: mock.userMajor,
        userMinors: mock.userMinors,
        minorDeclarationTerms: mock.minorDeclarationTerms,
      },
    );
    const recommendedCodes = result.data?.recommendations.map((recommendation) => recommendation.courseCode) ?? [];

    expect(result.success).toBe(true);
    expect(recommendedCodes.some((code) => code.startsWith('EC'))).toBe(true);
    expect(recommendedCodes).not.toContain('EC2202');
  });

  it('caps broad credit recommendations and avoids already satisfied calculus alternatives', async () => {
    const mock = readMock('catalog-lab-uploaded-transcript-2022-1-in-progress.json');
    const result = await uploadAndEvaluate(mock, {
      entryYear: mock.entryYear,
      userMajor: mock.userMajor,
      userMinors: mock.userMinors,
      minorDeclarationTerms: mock.minorDeclarationTerms,
    });
    const recommendations = result.data?.recommendations ?? [];
    const allRecommendations = result.data?.allRecommendations ?? [];
    const recommendedCodes = recommendations.map((recommendation) => recommendation.courseCode);

    expect(result.success).toBe(true);
    expect(allRecommendations.length).toBeGreaterThan(recommendations.length);
    expect(recommendations.filter((recommendation) => recommendation.requirementId === 'science-total').length).toBeLessThanOrEqual(3);
    expect(recommendations.filter((recommendation) => recommendation.requirementId === 'humanities-total').length).toBeLessThanOrEqual(3);
    expect(result.data?.recommendationSuppressions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: 'display_cap',
        }),
      ]),
    );
    expect(recommendedCodes).not.toContain('GS1001');
    expect(recommendedCodes).not.toContain('CSE101');
  });

  it('keeps common recommendations but suppresses major recommendations when no major context is available', async () => {
    const mock = readMock('catalog-lab-ec-2021.json');
    const rawWithoutMajor = { ...mock };
    delete rawWithoutMajor.userMajor;

    const result = await uploadAndEvaluate(rawWithoutMajor, {
      entryYear: mock.entryYear,
      userMinors: mock.userMinors,
      minorDeclarationTerms: mock.minorDeclarationTerms,
    });
    const recommendedCodes = result.data?.recommendations.map((recommendation) => recommendation.courseCode) ?? [];

    expect(result.success).toBe(true);
    expect(recommendedCodes.length).toBeGreaterThan(0);
    expect(recommendedCodes.some((code) => code.startsWith('EC'))).toBe(false);
    expect(recommendedCodes.some((code) => code.startsWith('GS') || code.startsWith('UC') || code.startsWith('HS'))).toBe(true);
    expect(result.data?.recommendationSuppressions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: 'missing_major_context',
        }),
      ]),
    );
  });
});
