import { course, evaluateFor, expectNoRequirement, expectRequirement } from './helpers/graduation-fixtures';
import {
  getMajorCreditRequirement,
  getMajorMandatoryRulesForContext,
  getMinorCreditRequirement,
  getMinorMandatoryRulesForContext,
  getThesisRequirements,
} from '../features/graduation/domain';

describe('manual-backed major and minor requirement catalog', () => {
  describe('static catalog records', () => {
    it('selects source-backed major credit and thesis requirements by entry year', () => {
      expect(getMajorCreditRequirement(2020)).toMatchObject({
        id: 'major-credits',
        requiredCredits: 36,
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 34 })],
      });
      expect(getMajorCreditRequirement(2021)).toMatchObject({
        id: 'major-credits',
        requiredCredits: 36,
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 33 })],
      });

      expect(getThesisRequirements(2021)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'thesis-i',
            suffix: '9102',
            requiredCount: 1,
            sourceRequiredCredits: 3,
            sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 33 })],
          }),
          expect.objectContaining({
            id: 'thesis-ii',
            suffix: '9103',
            requiredCount: 1,
            sourceRequiredCredits: 3,
            sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 33 })],
          }),
        ]),
      );
    });

    it('catalogs entry-year specific minor credit requirements', () => {
      expect(getMinorCreditRequirement('CH', 2021)).toMatchObject({
        id: 'minor-credits-ch-2018-plus',
        requiredCredits: 21,
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 28 })]),
      });
      expect(getMinorCreditRequirement('MM', 2021)).toMatchObject({
        id: 'minor-credits-mm-2021-plus',
        requiredCredits: 18,
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 28 })]),
      });
      expect(getMinorCreditRequirement('LH_LIT', 2021)).toMatchObject({
        id: 'minor-credits-lh-2021-plus',
        requiredCredits: 18,
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 29 })],
      });
      expect(getMinorCreditRequirement('AI', 2021)).toMatchObject({
        id: 'minor-credits-ai',
        requiredCredits: 15,
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 27 })]),
      });
      expect(getMinorCreditRequirement('CH', 2017)).toMatchObject({
        id: 'minor-credits-ch-default',
        requiredCredits: 15,
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 27 })]),
      });
      expect(getMinorCreditRequirement('MD', 2025)).toMatchObject({
        id: 'minor-credits-md',
        requiredCredits: 15,
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 29 })],
      });
    });

    it('models major mandatory rules with manual PDF source references', () => {
      const ecRules = getMajorMandatoryRulesForContext('EC', { entryYear: 2021 });
      expect(ecRules[0]).toMatchObject({
        id: 'major.ec.mandatory.experiment',
        requiredCount: 1,
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 22 })],
      });

      const mcRules = getMajorMandatoryRulesForContext('MC', { entryYear: 2025 });
      expect(mcRules[0]).toMatchObject({
        id: 'major.mc.mandatory.core',
        requiredCount: 3,
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 24 })]),
      });
      expect(mcRules[0].courses).toContain('MC3107');

      const chRules = getMajorMandatoryRulesForContext('CH', { entryYear: 2021 });
      expect(chRules).toHaveLength(7);
      expect(chRules[1]).toMatchObject({
        id: 'major.ch.mandatory.physical-chemistry-a',
        courses: ['CH2102', 'CH3104'],
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 23 })],
      });

      const mmRules = getMajorMandatoryRulesForContext('MM', { entryYear: 2021 });
      expect(mmRules).toHaveLength(8);
      expect(mmRules[0]).toMatchObject({
        id: 'major.mm.mandatory.multivariable-analysis',
        courses: ['MM2001', 'GS2001', 'MM2011'],
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 23 })],
      });

      expect(getMajorMandatoryRulesForContext('EV', { entryYear: 2023 })).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'major.ev.mandatory.transport-or-substitute',
            courses: ['EV4106', 'EV3103', 'EV4243', 'EV3112'],
            sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 25 })],
          }),
        ]),
      );
      expect(getMajorMandatoryRulesForContext('EV', { entryYear: 2024 })).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'major.ev.mandatory.statistics',
            courses: ['EV3112'],
            sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 25 })],
          }),
        ]),
      );

      expect(getMajorMandatoryRulesForContext('BS', { entryYear: 2022 })).toHaveLength(7);
      expect(getMajorMandatoryRulesForContext('BS', { entryYear: 2023 })).toHaveLength(6);
      expect(getMajorMandatoryRulesForContext('BS', { entryYear: 2023 })[1]).toMatchObject({
        id: 'major.bs.mandatory.biochemistry-molecular-biology-lab',
        courses: ['BS2103', 'BS3111'],
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 25 })],
      });
    });

    it('models mandatory minor rules with catalog appliesTo conditions', () => {
      expect(getMinorMandatoryRulesForContext('AI', { entryYear: 2021 })).toHaveLength(0);
      expect(
        getMinorMandatoryRulesForContext('AI', {
          entryYear: 2021,
          declarationTerm: { year: 2025, semester: '2' },
        }),
      ).toHaveLength(0);

      const rules = getMinorMandatoryRulesForContext('AI', {
        entryYear: 2021,
        declarationTerm: { year: 2024, semester: '2' },
      });
      expect(rules).toHaveLength(2);
      expect(rules[0]).toMatchObject({
        id: 'minor.ai.mandatory.a',
        requiredCount: 1,
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 27 })]),
      });
      expect(rules[1].courses).toContain('AI4001');
      expect(rules[1].label).toContain('경과조치');

      expect(getMinorMandatoryRulesForContext('MD', { entryYear: 2024 })).toHaveLength(0);
      expect(getMinorMandatoryRulesForContext('MD', { entryYear: 2025 })).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'minor.md.mandatory.intro',
            courses: ['MD2101'],
            sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 29 })],
          }),
        ]),
      );

      expect(getMinorMandatoryRulesForContext('EC', { entryYear: 2021 })[0]).toMatchObject({
        id: 'minor.ec.mandatory.experiment',
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 27 })]),
      });
      expect(getMinorMandatoryRulesForContext('CH', { entryYear: 2021 })[0]).toMatchObject({
        id: 'minor.ch.mandatory.core',
        sourceRefs: expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 28 })]),
      });
      expect(getMinorMandatoryRulesForContext('CT', { entryYear: 2021 })[0]).toMatchObject({
        id: 'minor.ct.mandatory.core',
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 29 })],
      });

      const publicPolicyRules = getMinorMandatoryRulesForContext('LH_PP', { entryYear: 2021 });
      expect(publicPolicyRules[0]).toMatchObject({
        id: 'minor.lh_pp.mandatory.all',
        requiredCount: 3,
        courses: ['PP2704', 'PP2763', 'PP2765'],
        sourceRefs: [expect.objectContaining({ manualYear: 2026, page: 49 })],
      });
    });
  });

  describe('generated fine-grained requirements', () => {
    it('attaches catalog source references to major credits, major mandatory rules, and thesis research', async () => {
      const result = await evaluateFor(
        2021,
        [
          course({ courseCode: 'EC3102', courseName: '컴퓨터 시스템 이론 및 실험', credit: 4 }),
          course({ courseCode: 'EC9102', courseName: '학사논문연구 I', credit: 3 }),
        ],
        { userMajor: 'EC' },
      );

      const majorCredits = expectRequirement(result, 'major-credits', {
        requiredCredits: 36,
      });
      expect(majorCredits.sourceRefs).toEqual(
        expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 33 })]),
      );

      const mandatory = expectRequirement(result, 'major-mandatory-rule-EC-0', {
        satisfied: true,
        requiredCredits: 1,
        acquiredCredits: 1,
        missingCredits: 0,
      });
      expect(mandatory.sourceRefs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            manualYear: 2026,
            page: 22,
            path: 'docs/bachelor_manual/2026_manual.pdf',
          }),
        ]),
      );

      const thesisI = expectRequirement(result, 'thesis-i', {
        satisfied: true,
        requiredCredits: 1,
        acquiredCredits: 1,
        missingCredits: 0,
      });
      expect(thesisI.sourceRefs).toEqual(
        expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 33 })]),
      );
    });

    it('applies the catalog minor credit exception to fine-grained requirements', async () => {
      const result = await evaluateFor(
        2021,
        [
          course({ courseCode: 'CH2101', courseName: '분석화학' }),
          course({ courseCode: 'CH2102', courseName: '물리화학A' }),
          course({ courseCode: 'CH2103', courseName: '유기화학I' }),
          course({ courseCode: 'CH2104', courseName: '물리화학B' }),
          course({ courseCode: 'CH2105', courseName: '화학합성실험' }),
        ],
        { userMinors: ['CH'] },
      );

      expect(getMinorCreditRequirement('CH', 2021).requiredCredits).toBe(21);
      expectRequirement(result, 'minor-credits-CH', {
        satisfied: false,
        requiredCredits: 21,
        acquiredCredits: 15,
        missingCredits: 6,
      });
    });

    it('applies MD2101 as a mandatory minor course only from 2025 entry years', async () => {
      const mdElectives = [
        course({ courseCode: 'MD4101', courseName: '바이오메디컬 영상' }),
        course({ courseCode: 'MD4102', courseName: '생체계측' }),
        course({ courseCode: 'MD4106', courseName: '의료기기 설계' }),
        course({ courseCode: 'MD4301', courseName: '재생의학' }),
        course({ courseCode: 'MD4302', courseName: '바이오센서' }),
      ];

      const result2024 = await evaluateFor(2024, mdElectives, { userMinors: ['MD'] });
      expectNoRequirement(result2024, 'minor-mandatory-rule-MD-0');

      const result2025 = await evaluateFor(2025, mdElectives, { userMinors: ['MD'] });
      expectRequirement(result2025, 'minor-mandatory-rule-MD-0', {
        satisfied: false,
        requiredCredits: 1,
        acquiredCredits: 0,
        missingCredits: 1,
      });
    });

    it('accepts MC3107 as a source-backed mechanical robotics major mandatory option', async () => {
      const result = await evaluateFor(
        2025,
        [
          course({ courseCode: 'MC2100', courseName: '열역학 I' }),
          course({ courseCode: 'MC2101', courseName: '고체역학 I' }),
          course({ courseCode: 'MC3107', courseName: '기계공학실험 II' }),
        ],
        { userMajor: 'MC' },
      );

      const requirement = expectRequirement(result, 'major-mandatory-rule-MC-0', {
        satisfied: true,
        requiredCredits: 3,
        acquiredCredits: 3,
        missingCredits: 0,
      });
      expect(requirement.sourceRefs).toEqual(
        expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 24 })]),
      );
    });

    it('applies source-backed chemistry major mandatory alternatives from page 23', async () => {
      const result = await evaluateFor(2021, [course({ courseCode: 'CH3104', courseName: '물리화학 II' })], {
        userMajor: 'CH',
      });

      const requirement = expectRequirement(result, 'major-mandatory-rule-CH-1', {
        satisfied: true,
        requiredCredits: 1,
        acquiredCredits: 1,
        missingCredits: 0,
      });
      expect(requirement.sourceRefs).toEqual(
        expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 23 })]),
      );
    });

    it('applies source-backed bioscience major mandatory entry-year variants from page 25', async () => {
      const result2022 = await evaluateFor(2022, [], { userMajor: 'BS' });
      expectRequirement(result2022, 'major-mandatory-rule-BS-0', {
        satisfied: false,
        requiredCredits: 1,
        acquiredCredits: 0,
        missingCredits: 1,
      });

      const result2023 = await evaluateFor(2023, [], { userMajor: 'BS' });
      expectNoRequirement(result2023, 'major-mandatory-rule-BS-6');
      expectRequirement(result2023, 'major-mandatory-rule-BS-0', {
        satisfied: false,
        requiredCredits: 1,
        acquiredCredits: 0,
        missingCredits: 1,
      });
    });

    it('counts public policy course-plan courses toward the LH_PP minor requirements', async () => {
      const result = await evaluateFor(
        2021,
        [
          course({ courseCode: 'PP2704', courseName: '기업과 사회 I' }),
          course({ courseCode: 'PP2763', courseName: '현대법학의 이해' }),
          course({ courseCode: 'PP2765', courseName: '헌법과 국가' }),
          course({ courseCode: 'PP2701', courseName: '한국사회의 이해' }),
          course({ courseCode: 'PP3721', courseName: '교육의 경제학' }),
          course({ courseCode: 'PP3838', courseName: '과학기술정책의 이해' }),
        ],
        { userMinors: ['LH_PP'] },
      );

      const credits = expectRequirement(result, 'minor-credits-LH_PP', {
        satisfied: true,
        requiredCredits: 18,
        acquiredCredits: 18,
        missingCredits: 0,
      });
      expect(credits.sourceRefs).toEqual(
        expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 29 })]),
      );

      const mandatory = expectRequirement(result, 'minor-mandatory-rule-LH_PP-0', {
        satisfied: true,
        requiredCredits: 3,
        acquiredCredits: 3,
        missingCredits: 0,
      });
      expect(mandatory.sourceRefs).toEqual(
        expect.arrayContaining([expect.objectContaining({ manualYear: 2026, page: 49 })]),
      );
    });
  });
});
