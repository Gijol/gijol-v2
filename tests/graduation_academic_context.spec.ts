import input from './fixtures/input-20205098.json';
import { evaluateGraduationStatus } from '../features/graduation/domain/engine';
import {
  parseRawToTakenCourses,
  validateTakenCourses,
  normalizeTakenCourses,
} from '../features/graduation/middlewares/validation';
import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';
import {
  inferMajorCodeFromCourses,
  MAJOR_PROGRAMS,
  getMajorCoursePrefixes,
  getMajorOptions,
  getMinorOptions,
  resolveMajorCode,
} from '../features/graduation/domain';
import { course, expectRequirement } from './helpers/graduation-fixtures';

describe('academic context resolution', () => {
  it.each([
    ['CS', 'EC'],
    ['EE', 'EC'],
    ['EECS', 'EC'],
    ['BE', 'FE'],
    ['FE', 'FE'],
    ['전기전자컴퓨터공학부', 'EC'],
    ['정보컴퓨팅대학 | 전기전자컴퓨터공학과', 'EC'],
  ])('resolves %s to canonical major code %s', (inputMajor, expectedCode) => {
    expect(resolveMajorCode(inputMajor)).toMatchObject({
      status: 'resolved',
      code: expectedCode,
    });
  });

  it('keeps major aliases out of canonical major course prefixes', () => {
    const prefixes = getMajorCoursePrefixes();

    expect(prefixes).toEqual(expect.arrayContaining(['EC', 'FE', 'MD']));
    expect(prefixes).not.toEqual(expect.arrayContaining(['CS', 'EE', 'EECS']));
    expect(MAJOR_PROGRAMS.map((program) => program.canonicalCode)).not.toContain('IR');
  });

  it('derives selectable major and minor options from the academic program catalog', () => {
    expect(getMajorOptions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'NONE', label: '전공 없음 (기초교육학부)' }),
        expect.objectContaining({ value: 'EC', label: '전기전자컴퓨터공학과' }),
      ]),
    );
    expect(getMajorOptions()).not.toEqual(expect.arrayContaining([expect.objectContaining({ value: 'CS' })]));
    expect(getMinorOptions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'FE', label: '에너지 (기존 선언자)' }),
        expect.objectContaining({ value: 'MD', label: '의생명' }),
      ]),
    );
  });

  it('excludes programs without verified bachelor handbook requirements from new selections', () => {
    expect(getMajorOptions().some((p) => p.value === 'FE')).toBe(false);
    expect(getMinorOptions().some((p) => p.value === 'SE')).toBe(false);
  });

  it('infers EC from the 20205098 fixture courses', () => {
    expect(inferMajorCodeFromCourses(input.userTakenCourseList)).toMatchObject({
      status: 'resolved',
      code: 'EC',
    });
  });

  it('classifies fixture EC courses as major even when legacy CS is supplied', async () => {
    const parsed = parseRawToTakenCourses(input);
    const validation = validateTakenCourses(parsed);
    expect(validation.ok).toBe(true);
    const normalized = normalizeTakenCourses(validation.value!);

    const result = await evaluateGraduationStatus({
      takenCourses: normalized,
      ruleContext: {
        entryYear: 2020,
        userMajor: 'CS',
      },
    });

    expect(result.graduationCategory.major.totalCredits).toBe(25);
    expect(result.graduationCategory.major.userTakenCoursesList.takenCourses.map((taken) => taken.courseCode)).toEqual(
      expect.arrayContaining(['EC2202', 'EC3102', 'EC4212']),
    );
  });

  it('normalizes legacy CS through uploadAndEvaluate', async () => {
    const result = await uploadAndEvaluate(input, { userMajor: 'CS' });

    expect(result.success).toBe(true);
    expect(result.data?.graduationCategory.major.totalCredits).toBe(25);
  });

  it('reports needs_review for an unknown explicit major instead of silently returning a final false negative', async () => {
    const result = await evaluateGraduationStatus({
      takenCourses: {
        takenCourses: [
          course({
            courseCode: 'ZZ9999',
            courseName: 'Unknown Major Course',
          }),
        ],
      },
      ruleContext: {
        entryYear: 2021,
        userMajor: 'ZZ',
      },
    });

    expect(result.overallStatus).toBe('needs_review');
    expectRequirement(result, 'major-context', {
      status: 'needs_review',
      satisfied: false,
      requiredCredits: 0,
    });
  });
});
