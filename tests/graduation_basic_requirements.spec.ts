import { course, evaluateFor, expectNoRequirement, expectRequirement } from './helpers/graduation-fixtures';
import {
  BASIC_REQUIREMENT_CATALOG_RULES,
  compileRuleCatalog,
  getBasicRequirementCatalog,
  selectRulesForContext,
  validateRuleCatalog,
} from '../features/graduation/domain';

describe('manual-backed basic graduation requirements', () => {
  describe('static rule catalog', () => {
    it('selects entry-year specific basic requirement records', () => {
      expect(getBasicRequirementCatalog(2019).artsSports.arts.requiredCount).toBe(4);
      expect(getBasicRequirementCatalog(2020).artsSports.arts.requiredCount).toBe(2);
      expect(getBasicRequirementCatalog(2021).artsSports.arts.requiredCount).toBe(2);
      expect(getBasicRequirementCatalog(2020).commonMandatory.majorExploration).toBeUndefined();
      expect(getBasicRequirementCatalog(2021).commonMandatory.majorExploration?.acceptedCodes).toContain('UC0902');
    });

    it('attaches manual source references to generated basic requirements', async () => {
      const result = await evaluateFor(2021, []);

      const requirement = expectRequirement(result, 'etc-major-exploration', {
        satisfied: false,
        requiredCredits: 1,
      });

      expect(requirement.sourceRefs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            manualYear: 2026,
            page: 33,
            path: 'docs/bachelor_manual/2026_manual.pdf',
          }),
        ]),
      );
    });

    it('exposes publishable basic requirement primitive rules', () => {
      expect(validateRuleCatalog(BASIC_REQUIREMENT_CATALOG_RULES, { publishable: true })).toMatchObject({
        ok: true,
        issues: [],
      });

      const compiled = compileRuleCatalog(BASIC_REQUIREMENT_CATALOG_RULES);
      expect(compiled.byId.get('basic-2021-plus.etc-major-exploration')).toMatchObject({
        kind: 'course-credit',
        scope: { type: 'global' },
        parameters: {
          requiredCredits: 1,
          unit: 'credits',
          courses: ['UC0902'],
        },
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 33 })],
      });
      expect(compiled.byId.get('basic-2018-2019.arts')).toMatchObject({
        kind: 'activity-count',
        parameters: { requiredCount: 4, unit: 'courses' },
      });
      expect(compiled.byId.get('basic-2021-plus.science-total')).toMatchObject({
        kind: 'conditional-credit-minimum',
        parameters: {
          defaultRequiredCredits: 18,
          unit: 'credits',
          variants: [{ conditionKey: 'completedComputerProgramming', requiredCredits: 17 }],
        },
      });
      expect(compiled.byId.get('basic-2021-plus.total-credits')?.sourceRefs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ manualYear: 2026, page: 33 }),
          expect.objectContaining({ manualYear: 2026, page: 32 }),
        ]),
      );
      expect(compiled.byId.get('basic-2021-plus.minimum-gpa')?.sourceRefs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ manualYear: 2026, page: 33 }),
          expect.objectContaining({ manualYear: 2026, page: 32 }),
        ]),
      );
      expect(compiled.byId.get('basic-2021-plus.language-english-i')?.sourceRefs).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 32 })]),
      );
    });

    it('selects basic requirement primitive rules by entry year context', () => {
      const compiled = compileRuleCatalog(BASIC_REQUIREMENT_CATALOG_RULES);
      const selection2020 = selectRulesForContext(compiled, { entryYear: 2020 });
      const selection2021 = selectRulesForContext(compiled, { entryYear: 2021 });
      const selected2020Ids = selection2020.applicableRules.map((rule) => rule.id);
      const selected2021Ids = selection2021.applicableRules.map((rule) => rule.id);

      expect(selected2020Ids).toContain('basic-2020.arts');
      expect(selected2020Ids).not.toContain('basic-2021-plus.etc-major-exploration');
      expect(selected2021Ids).toContain('basic-2021-plus.etc-major-exploration');
      expect(selected2021Ids).toContain('basic-2021-plus.language-english-i');
    });
  });

  describe('entry-year specific mandatory courses', () => {
    it('preserves course and occurrence units in fine-grained requirement results', async () => {
      const result = await evaluateFor(2021, []);

      expectRequirement(result, 'science-calculus', { unit: 'courses' });
      expectRequirement(result, 'science-core-math', { unit: 'courses' });
      expectRequirement(result, 'science-sw-basic', { unit: 'courses' });
      expectRequirement(result, 'etc-colloquium', { unit: 'occurrences' });
    });

    it('requires GIST major exploration for 2021+ entry years', async () => {
      // 2026 bachelor manual p.33: GIST major exploration is mandatory from 2021 entry years.
      const result = await evaluateFor(2021, []);

      expectRequirement(result, 'etc-major-exploration', {
        satisfied: false,
        requiredCredits: 1,
        acquiredCredits: 0,
        missingCredits: 1,
      });
    });

    it('does not apply GIST major exploration to 2018-2020 entry years', async () => {
      // 2026 bachelor manual p.34: 2018-2020 entry years list GIST freshman only.
      const result = await evaluateFor(2020, []);

      expectNoRequirement(result, 'etc-major-exploration');
    });

    it('accepts science and technology economy as a one-credit common requirement', async () => {
      // 2026 bachelor manual pp.33-34: Science and Technology Economy is a one-credit common course.
      const result = await evaluateFor(2021, [
        course({
          courseCode: 'UC0901',
          courseName: '과학기술과 경제',
          credit: 1,
        }),
      ]);

      expectRequirement(result, 'etc-science-economy', {
        satisfied: true,
        requiredCredits: 1,
        acquiredCredits: 1,
        missingCredits: 0,
      });
    });
  });

  describe('language basics', () => {
    it('accepts legacy English I for 2018-2020 entry years', async () => {
      const result = await evaluateFor(2020, [
        course({
          courseCode: 'GS1601',
          courseName: '영어 I',
          credit: 2,
        }),
      ]);

      expectRequirement(result, 'language-english-i', {
        satisfied: true,
        requiredCredits: 2,
        acquiredCredits: 2,
        missingCredits: 0,
      });
    });

    it('does not accept only one legacy English I course for 2021+ entry years', async () => {
      const result = await evaluateFor(2021, [
        course({
          courseCode: 'GS1601',
          courseName: '영어 I',
          credit: 2,
        }),
      ]);

      expectRequirement(result, 'language-english-i', {
        satisfied: false,
        requiredCredits: 2,
        acquiredCredits: 0,
        missingCredits: 2,
      });
    });

    it('accepts the paired legacy English I courses for 2021+ entry years', async () => {
      const result = await evaluateFor(2021, [
        course({
          courseCode: 'GS1601',
          courseName: '영어 I',
          credit: 2,
        }),
        course({
          courseCode: 'GS1603',
          courseName: '발표와 토론',
          credit: 2,
        }),
      ]);

      expectRequirement(result, 'language-english-i', {
        satisfied: true,
        requiredCredits: 2,
        acquiredCredits: 2,
        missingCredits: 0,
      });
    });
  });

  describe('science basics', () => {
    it('keeps completed calculus in science basics before the full math field is complete', async () => {
      const result = await evaluateFor(2021, [
        course({
          courseCode: 'GS1001',
          courseName: '미적분학과 응용',
        }),
      ]);
      const scienceCodes = result.graduationCategory.scienceBasic.userTakenCoursesList.takenCourses.map(
        (takenCourse) => takenCourse.courseCode,
      );
      const freeElectiveCodes = result.graduationCategory.otherUncheckedClass.userTakenCoursesList.takenCourses.map(
        (takenCourse) => takenCourse.courseCode,
      );

      expectRequirement(result, 'science-calculus', { satisfied: true });
      expect(scienceCodes).toContain('GS1001');
      expect(freeElectiveCodes).not.toContain('GS1001');
    });
  });

  describe('humanities credits', () => {
    it('requires HUS 6 credits, PPE 6 credits, and 24 total humanities credits', async () => {
      // 2026 bachelor manual pp.33-34: humanities requires 24 credits including HUS 6 and PPE 6.
      const result = await evaluateFor(2021, [
        course({ courseCode: 'HS2502', courseName: '한국문학사의 쟁점' }),
        course({ courseCode: 'HS2503', courseName: '한국현대소설의 이해' }),
        course({ courseCode: 'HS2620', courseName: '철학의 근본 문제들' }),
        course({ courseCode: 'HS2702', courseName: '미국사회의 이해' }),
        course({ courseCode: 'GS2541', courseName: '서양음악의 이해' }),
        course({ courseCode: 'GS2542', courseName: '오페라와 판소리' }),
        course({ courseCode: 'GS2801', courseName: '연구윤리' }),
        course({ courseCode: 'GS2822', courseName: 'AI와 나' }),
      ]);

      expectRequirement(result, 'humanities-hus', {
        satisfied: true,
        requiredCredits: 6,
        acquiredCredits: 6,
        missingCredits: 0,
      });
      expectRequirement(result, 'humanities-ppe', {
        satisfied: true,
        requiredCredits: 6,
        acquiredCredits: 6,
        missingCredits: 0,
      });
      expectRequirement(result, 'humanities-total', {
        satisfied: true,
        requiredCredits: 24,
        acquiredCredits: 24,
        missingCredits: 0,
      });
    });

    it('keeps MOOC-designated HUS and PPE courses in the humanities completion area', async () => {
      const result = await evaluateFor(2021, [
        course({
          courseCode: 'HS2507',
          courseName: '(MOOC 지정) 시의 이해',
        }),
        course({
          courseCode: 'PP3767',
          courseName: '(MOOC 지정) 인공지능 로봇의 윤리',
        }),
      ]);
      const humanitiesCodes = result.graduationCategory.humanities.userTakenCoursesList.takenCourses.map(
        (takenCourse) => takenCourse.courseCode,
      );
      const freeElectiveCodes = result.graduationCategory.otherUncheckedClass.userTakenCoursesList.takenCourses.map(
        (takenCourse) => takenCourse.courseCode,
      );

      expect(humanitiesCodes).toEqual(expect.arrayContaining(['HS2507', 'PP3767']));
      expect(freeElectiveCodes).not.toEqual(expect.arrayContaining(['HS2507', 'PP3767']));
      expectRequirement(result, 'humanities-hus', {
        acquiredCredits: 3,
        missingCredits: 3,
      });
      expectRequirement(result, 'humanities-ppe', {
        acquiredCredits: 3,
        missingCredits: 3,
      });
    });

    it('classifies a cross-listed PPE alias in the same humanities completion area', async () => {
      const result = await evaluateFor(2021, [
        course({
          courseCode: 'MM3767',
          courseName: '인공지능 로봇의 윤리',
        }),
      ]);
      const humanitiesCodes = result.graduationCategory.humanities.userTakenCoursesList.takenCourses.map(
        (takenCourse) => takenCourse.courseCode,
      );

      expect(humanitiesCodes).toContain('MM3767');
      expectRequirement(result, 'humanities-ppe', {
        acquiredCredits: 3,
        missingCredits: 3,
      });
    });

    it('keeps a non-humanities MOOC course in free electives', async () => {
      const result = await evaluateFor(2021, [
        course({
          courseCode: 'GS1499',
          courseName: '(MOOC 지정) 파이썬 기초',
          credit: 2,
        }),
      ]);
      const humanitiesCodes = result.graduationCategory.humanities.userTakenCoursesList.takenCourses.map(
        (takenCourse) => takenCourse.courseCode,
      );
      const freeElectiveCodes = result.graduationCategory.otherUncheckedClass.userTakenCoursesList.takenCourses.map(
        (takenCourse) => takenCourse.courseCode,
      );

      expect(humanitiesCodes).not.toContain('GS1499');
      expect(freeElectiveCodes).toContain('GS1499');
    });
  });

  describe('zero-credit arts and sports', () => {
    it.each([
      { entryYear: 2019, requiredCourses: 4 },
      { entryYear: 2020, requiredCourses: 2 },
      { entryYear: 2021, requiredCourses: 2 },
    ])(
      'requires the correct arts and sports count for $entryYear entry year',
      async ({ entryYear, requiredCourses }) => {
        // 2026 bachelor manual p.34: 2018-2019 require 4 terms; 2020+ require 2 terms.
        const result = await evaluateFor(entryYear, []);

        expectRequirement(result, 'arts', {
          satisfied: false,
          requiredCredits: requiredCourses,
          acquiredCredits: 0,
          missingCredits: requiredCourses,
          unit: 'courses',
        });
        expectRequirement(result, 'sports', {
          satisfied: false,
          requiredCredits: requiredCourses,
          acquiredCredits: 0,
          missingCredits: requiredCourses,
          unit: 'courses',
        });
      },
    );
  });
});
