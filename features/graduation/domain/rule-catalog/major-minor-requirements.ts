import {
  ENERGY_DECLARATION_SOURCE,
  HISTORICAL_MATH_SOURCE,
  HISTORICAL_MECHANICAL_LAB_SOURCES,
} from './historical-courses';
import { getMajorCodes, getMinorCourseCodes } from './academic-programs';
import type { RequirementSource } from '../types';
import {
  appliesToRequirementCondition,
  defineRuleCatalog,
  type CourseCountRuleParameters,
  type CourseLimitRuleParameters,
  type CreditMinimumRuleParameters,
  type DeclarationTermRequiredRuleParameters,
  type RequirementCondition,
  type RequirementContext,
  type RuleCatalogParameters,
  type RuleCatalogRule,
  type RuleCatalogScope,
  type RuleEvaluatorId,
  type SourceBackedRule,
  type ThesisResearchRuleParameters,
} from './schema';

export type { AcademicTermRange, EntryYearRange, RequirementCondition, RequirementContext } from './schema';

export interface CreditRequirement extends SourceBackedRule {
  label: string;
  requiredCredits: number;
  programCodes?: readonly string[];
}

export interface MandatoryCourseRule extends SourceBackedRule {
  legacyAlternative?: CourseCountRuleParameters['legacyAlternative'];
  label: string;
  requiredCount: number;
  courses: readonly string[];
  courseNames?: readonly string[];
}

export interface ThesisRequirement extends SourceBackedRule {
  id: 'thesis-i' | 'thesis-ii';
  label: string;
  suffix: string;
  requiredCount: number;
  sourceRequiredCredits: number;
}

export interface MinorDeclarationTermRequirement {
  minorCode: string;
  appliesTo: RequirementCondition;
  sourceRefs: readonly RequirementSource[];
  missingTermRequirementId: string;
  missingTermLabel: string;
  missingTermHint: string;
}

export interface MinorCourseLimitRequirement extends SourceBackedRule {
  minorCode: string;
  evaluatorId: RuleEvaluatorId;
  limit: {
    maxCourses: number;
    unit: 'courses';
  };
  reason: string;
}

const BACHELOR_MANUAL_2026 = 'docs/bachelor_manual/2026_manual.pdf';

function source(page: number, note: string, path = BACHELOR_MANUAL_2026): RequirementSource {
  return {
    manualYear: 2026,
    page,
    path,
    note,
  };
}

const overallSource2018To2020 = source(34, '2018~2020 입학생 전공학점 및 연구학점 기준');
const overallSource2021Plus = source(33, '2021 이후 입학생 전공학점 및 연구학점 기준');
const ecMajorMandatorySource = source(22, '전기전자컴퓨터공학과 전공필수: EC3101/EC3102 택1');
const mcMajorMandatorySource = source(24, '기계로봇공학과 전공필수: MC2100/MC2101/MC2102/MC2103/MC3106/MC3107 택3');
const chMajorMandatorySource = source(23, '화학과 전공필수: 2018학번부터 전공필수 교과목 및 동일과목 안내');
const mmMajorMandatorySource = source(23, '수리과학과 전공필수: 필수 교과목 및 대체과목 안내');
const evMajorMandatorySource = source(25, '환경·에너지공학과 전공필수: 학번별 필수 교과목 및 대체 조건');
const bsMajorMandatorySource = source(25, '생명과학과 전공필수: 2023학번 이후 및 2018~2022학번 필수 교과목');
const minorGeneralSource = source(27, '부전공 일반 이수요건: 분야별 15학점 이상 및 별도 요건 충족');
const ecMinorSource = source(27, '전기전자컴퓨터 부전공: 전공필수 1과목, EC 2천번대 6학점, EC 3~4천번대 12학점');
const aiMinorHistoricalSource: RequirementSource = {
  manualYear: 2024,
  page: 55,
  path: 'docs/bachelor_manual/2024_manual.pdf',
  note: '인쇄 54쪽: AI4020 인공지능, AI4001 프로젝트 2 및 AI2002 콜로퀴움 개편 전 필수 교과목',
};
const aiMinorSource = source(27, 'AI융합 부전공 이수요건: 선언 학기별 필수과목 적용');
const psMinorSource = source(27, '물리·광과학 부전공: 학번별 전공필수 3과목 및 15학점 이상');
const chMinorSource = source(28, '화학 부전공: 2018학번부터 21학점 및 전공필수 3과목');
const mmMinorSource = source(28, '수리과학 부전공: 학번별 필수/선택 과목 및 15/18학점 기준');
const maMinorSource = source(28, '신소재 부전공: 전공필수 2과목, MA 3~4천번대 3과목, 15학점 이상');
const mcMinorSource = source(28, '기계로봇 부전공: 전공필수 3과목 및 15학점 이상');
const evMinorSource = source(28, '환경·에너지 부전공: 실험 제외 전공필수 3과목 및 환경에너지공학 필수');
const bsMinorSource = source(29, '생명과학 부전공: 교과목 2과목과 실험 1과목 포함 15학점 이상');
const mdMinorSource = source(29, '의생명 부전공: 15학점 이상 및 2025학번부터 MD2101 필수');
const feMinorSource = source(29, '에너지 부전공: 15학점 이상');
const ctMinorSource = source(29, '문화기술 부전공: 15학점 이상 및 지정 필수 목록 중 3과목');
const irMinorSource = source(29, '지능로봇 부전공 이수요건: 2026-1 선언자부터 필수과목 없음');
const lhMinorRequirementSource = source(29, '인문사회 부전공: 2021학번부터 18학점 이상');
const lhLitCoursePlanSource = source(49, '인문사회-문학과 역사 부전공 필수 과목표');
const lhPpCoursePlanSource = source(49, '인문사회-공공정책 부전공 필수 과목표');
const lhEbCoursePlanSource = source(50, '인문사회-경제·경영 부전공 필수 과목표');
const allCohorts = { allCohorts: true } as const satisfies RequirementCondition;
const majorProgramKindScope = { type: 'program-kind', programKind: 'major' } as const satisfies RuleCatalogScope;
const minorProgramKindScope = { type: 'program-kind', programKind: 'minor' } as const satisfies RuleCatalogScope;

function normalizeCode(value?: string | null): string {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '');
}

function cloneMandatoryRule(rule: MandatoryCourseRule): MandatoryCourseRule {
  return {
    ...rule,
    courses: [...rule.courses],
  };
}

function programScope(programKind: 'major' | 'minor', programCodes: readonly string[]): RuleCatalogScope {
  return {
    type: 'program',
    programKind,
    programCodes,
  };
}

export const MAJOR_CREDIT_REQUIREMENTS: readonly CreditRequirement[] = [
  {
    id: 'major-credits',
    label: '전공 학점',
    programCodes: getMajorCodes().filter((code) => code !== 'MA'),
    requiredCredits: 36,
    appliesTo: { entryYear: { from: 2018, to: 2020 } },
    sourceRefs: [overallSource2018To2020],
  },
  {
    id: 'major-credits',
    label: '전공 학점',
    programCodes: getMajorCodes().filter((code) => code !== 'MA'),
    requiredCredits: 36,
    appliesTo: { entryYear: { from: 2021 } },
    sourceRefs: [overallSource2021Plus],
  },
  {
    id: 'major-credits-ma',
    label: '소재전공 학점',
    requiredCredits: 30,
    programCodes: ['MA'],
    appliesTo: { entryYear: { from: 2018, to: 2020 } },
    sourceRefs: [overallSource2018To2020],
  },
  {
    id: 'major-credits-ma',
    label: '소재전공 학점',
    requiredCredits: 30,
    programCodes: ['MA'],
    appliesTo: { entryYear: { from: 2021 } },
    sourceRefs: [overallSource2021Plus],
  },
];

export const THESIS_REQUIREMENT_TEMPLATES: readonly Omit<ThesisRequirement, 'sourceRefs' | 'appliesTo'>[] = [
  {
    id: 'thesis-i',
    label: '학사논문연구 I',
    suffix: '9102',
    requiredCount: 1,
    sourceRequiredCredits: 3,
  },
  {
    id: 'thesis-ii',
    label: '학사논문연구 II',
    suffix: '9103',
    requiredCount: 1,
    sourceRequiredCredits: 3,
  },
];

export const MINOR_CREDIT_REQUIREMENTS: readonly CreditRequirement[] = [
  {
    id: 'minor-credits-default',
    label: '부전공 학점',
    requiredCredits: 15,
    appliesTo: allCohorts,
    sourceRefs: [minorGeneralSource],
  },
  {
    id: 'minor-credits-ec',
    label: '전기전자컴퓨터 부전공 학점',
    requiredCredits: 18,
    programCodes: ['EC'],
    appliesTo: { entryYear: { from: 2018 } },
    sourceRefs: [ecMinorSource],
  },
  {
    id: 'minor-credits-ai',
    label: 'AI융합 부전공 학점',
    requiredCredits: 15,
    programCodes: ['AI'],
    appliesTo: allCohorts,
    sourceRefs: [aiMinorSource],
  },
  {
    id: 'minor-credits-ir',
    label: '지능로봇 부전공 학점',
    requiredCredits: 15,
    programCodes: ['IR'],
    appliesTo: allCohorts,
    sourceRefs: [irMinorSource],
  },
  {
    id: 'minor-credits-ps',
    label: '물리·광과학 부전공 학점',
    requiredCredits: 15,
    programCodes: ['PS'],
    appliesTo: allCohorts,
    sourceRefs: [psMinorSource],
  },
  {
    id: 'minor-credits-ch-default',
    label: '화학 부전공 학점',
    requiredCredits: 15,
    programCodes: ['CH'],
    appliesTo: allCohorts,
    sourceRefs: [minorGeneralSource],
  },
  {
    id: 'minor-credits-ch-2018-plus',
    label: '화학 부전공 학점',
    requiredCredits: 21,
    appliesTo: { entryYear: { from: 2018 } },
    programCodes: ['CH'],
    sourceRefs: [chMinorSource, chMajorMandatorySource],
  },
  {
    id: 'minor-credits-mm-default',
    label: '수리과학 부전공 학점',
    requiredCredits: 15,
    programCodes: ['MM'],
    appliesTo: allCohorts,
    sourceRefs: [mmMinorSource],
  },
  {
    id: 'minor-credits-mm-2021-plus',
    label: '수리과학 부전공 학점',
    requiredCredits: 18,
    appliesTo: { entryYear: { from: 2021 } },
    programCodes: ['MM'],
    sourceRefs: [mmMinorSource],
  },
  {
    id: 'minor-credits-ma',
    label: '신소재 부전공 학점',
    requiredCredits: 15,
    programCodes: ['MA'],
    appliesTo: allCohorts,
    sourceRefs: [maMinorSource],
  },
  {
    id: 'minor-credits-mc',
    label: '기계로봇 부전공 학점',
    requiredCredits: 15,
    programCodes: ['MC'],
    appliesTo: allCohorts,
    sourceRefs: [mcMinorSource, ...HISTORICAL_MECHANICAL_LAB_SOURCES],
  },
  {
    id: 'minor-credits-ev',
    label: '환경·에너지 부전공 학점',
    requiredCredits: 15,
    programCodes: ['EV'],
    appliesTo: allCohorts,
    sourceRefs: [evMinorSource],
  },
  {
    id: 'minor-credits-bs',
    label: '생명과학 부전공 학점',
    requiredCredits: 15,
    programCodes: ['BS'],
    appliesTo: allCohorts,
    sourceRefs: [bsMinorSource],
  },
  {
    id: 'minor-credits-md',
    label: '의생명 부전공 학점',
    requiredCredits: 15,
    programCodes: ['MD'],
    appliesTo: allCohorts,
    sourceRefs: [mdMinorSource],
  },
  {
    id: 'minor-credits-fe',
    label: '에너지 부전공 학점',
    requiredCredits: 15,
    programCodes: ['FE'],
    appliesTo: allCohorts,
    sourceRefs: [feMinorSource],
  },
  {
    id: 'minor-credits-ct',
    label: '문화기술 부전공 학점',
    requiredCredits: 15,
    programCodes: ['CT'],
    appliesTo: allCohorts,
    sourceRefs: [ctMinorSource],
  },
  {
    id: 'minor-credits-lh-default',
    label: '인문사회 부전공 학점',
    requiredCredits: 15,
    programCodes: ['LH_LIT', 'LH_PP', 'LH_EB', 'LH_SS', 'LH_MB'],
    appliesTo: allCohorts,
    sourceRefs: [lhMinorRequirementSource],
  },
  {
    id: 'minor-credits-lh-2021-plus',
    label: '인문사회 부전공 학점',
    requiredCredits: 18,
    appliesTo: { entryYear: { from: 2021 } },
    programCodes: ['LH_LIT', 'LH_PP', 'LH_EB', 'LH_SS', 'LH_MB'],
    sourceRefs: [lhMinorRequirementSource],
  },
];

export const MAJOR_MANDATORY_RULES: Record<string, readonly MandatoryCourseRule[]> = {
  SE: [
    ...['SE1101', 'SE2101', 'SE2102', 'SE2201', 'SE2103', 'SE2104', 'SE2105', 'SE3101', 'SE3102', 'SE3103'].map(
      (code) => ({
        id: `major.se.mandatory.${code.toLowerCase()}`,
        label: `반도체 전공필수 ${code}`,
        requiredCount: 1,
        courses: [code],
        appliesTo: { entryYear: { from: 2024 } },
        sourceRefs: [source(22, '반도체공학과 전공필수')],
      }),
    ),
    {
      id: 'major.se.mandatory.se1102',
      label: '반도체공학개론 II',
      requiredCount: 1,
      courses: ['SE1102'],
      appliesTo: { entryYear: { from: 2025 } },
      sourceRefs: [source(22, '2024학번은 SE1102 제외')],
    },
  ],
  PS: ['PS2101', 'PS2102', 'PS2103', 'PS3103', 'PS3104', 'PS3105', 'PS3106', 'PS3107'].map((code) => ({
    id: `major.ps.mandatory.${code.toLowerCase()}`,
    label: `물리 전공필수 ${code}`,
    requiredCount: 1,
    courses: [code],
    appliesTo: { entryYear: { from: 2018 } },
    sourceRefs: [source(22, '물리·광과학 전공필수 8과목')],
  })),
  MA: ['MA2101', 'MA2102', 'MA2103', 'MA2104', 'MA3104', 'MA3105'].map((code) => ({
    id: `major.ma.mandatory.${code.toLowerCase()}`,
    label: `신소재 전공필수 ${code}`,
    requiredCount: 1,
    courses: [code],
    appliesTo: { entryYear: { from: 2018 } },
    sourceRefs: [source(24, '신소재 전공필수 6과목')],
  })),
  CH: [
    {
      id: 'major.ch.mandatory.analytical-chemistry',
      label: '전공필수 (분석화학 및 실험)',
      requiredCount: 1,
      courses: ['CH2101'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [chMajorMandatorySource],
    },
    {
      id: 'major.ch.mandatory.physical-chemistry-a',
      label: '전공필수 (물리화학 A 또는 물리화학 II)',
      requiredCount: 1,
      courses: ['CH2102', 'CH3104'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [chMajorMandatorySource],
    },
    {
      id: 'major.ch.mandatory.organic-chemistry-i',
      label: '전공필수 (유기화학 I)',
      requiredCount: 1,
      courses: ['CH2103'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [chMajorMandatorySource],
    },
    {
      id: 'major.ch.mandatory.physical-chemistry-b',
      label: '전공필수 (물리화학 B)',
      requiredCount: 1,
      courses: ['CH2104'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [chMajorMandatorySource],
    },
    {
      id: 'major.ch.mandatory.synthesis-lab',
      label: '전공필수 (화학합성실험)',
      requiredCount: 1,
      courses: ['CH2105'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [chMajorMandatorySource],
    },
    {
      id: 'major.ch.mandatory.biochemistry-i',
      label: '전공필수 (생화학 I)',
      requiredCount: 1,
      courses: ['CH3106'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [chMajorMandatorySource],
    },
    {
      id: 'major.ch.mandatory.inorganic-chemistry-i',
      label: '전공필수 (무기화학 I 또는 무기화학)',
      requiredCount: 1,
      courses: ['CH3208', 'CH3107'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [chMajorMandatorySource],
    },
  ],
  EC: [
    {
      id: 'major.ec.mandatory.experiment',
      label: '전공필수 택1 (EC3101, EC3102)',
      requiredCount: 1,
      courses: ['EC3101', 'EC3102'],
      appliesTo: allCohorts,
      sourceRefs: [ecMajorMandatorySource],
    },
  ],
  MM: [
    {
      id: 'major.mm.mandatory.multivariable-analysis',
      label: '전공필수 (다변수해석학과 응용 또는 고급다변수해석학과 응용)',
      requiredCount: 1,
      courses: ['MM2001', 'GS2001', 'MM2011'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
    {
      id: 'major.mm.mandatory.differential-equations',
      label: '전공필수 (미분방정식과 응용)',
      requiredCount: 1,
      courses: ['MM2002', 'GS2002'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
    {
      id: 'major.mm.mandatory.linear-algebra',
      label: '전공필수 (선형대수학과 응용 1)',
      requiredCount: 1,
      courses: ['MM2004', 'GS2004'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
    {
      id: 'major.mm.mandatory.probability-statistics',
      label: '전공필수 (확률과 통계)',
      requiredCount: 1,
      courses: ['MM2701'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
    {
      id: 'major.mm.mandatory.abstract-algebra',
      label: '전공필수 (현대대수학 1)',
      requiredCount: 1,
      courses: ['MM3101'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
    {
      id: 'major.mm.mandatory.analysis',
      label: '전공필수 (해석학)',
      requiredCount: 1,
      courses: ['MM3201'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
    {
      id: 'major.mm.mandatory.complex-functions',
      label: '전공필수 (복소함수학 및 응용)',
      requiredCount: 1,
      courses: ['MM3203'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
    {
      id: 'major.mm.mandatory.colloquium',
      label: '전공필수 (수학 콜로퀴움)',
      requiredCount: 1,
      courses: ['MM4901'],
      appliesTo: allCohorts,
      sourceRefs: [mmMajorMandatorySource],
    },
  ],
  MC: [
    {
      id: 'major.mc.mandatory.pre2025',
      label: '기계로봇 전공필수 6과목',
      requiredCount: 6,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106', 'MC3107'],
      appliesTo: { entryYear: { from: 2018, to: 2024 } },
      sourceRefs: [mcMajorMandatorySource, ...HISTORICAL_MECHANICAL_LAB_SOURCES],
    },
    {
      id: 'major.mc.mandatory.core',
      label: '기계로봇 전공필수 택3',
      requiredCount: 3,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106', 'MC3107'],
      appliesTo: { entryYear: { from: 2025 } },
      sourceRefs: [mcMajorMandatorySource, ...HISTORICAL_MECHANICAL_LAB_SOURCES],
    },
  ],
  EV: [
    {
      id: 'major.ev.mandatory.environmental-engineering',
      label: '전공필수 (환경에너지공학)',
      requiredCount: 1,
      courses: ['EV3101'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [evMajorMandatorySource],
    },
    {
      id: 'major.ev.mandatory.analysis-lab-i',
      label: '전공필수 (환경분석실험 I)',
      requiredCount: 1,
      courses: ['EV3106'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [evMajorMandatorySource],
    },
    {
      id: 'major.ev.mandatory.earth-system-science',
      label: '전공필수 (지구시스템과학)',
      requiredCount: 1,
      courses: ['EV3111'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [evMajorMandatorySource],
    },
    {
      id: 'major.ev.mandatory.transport-or-substitute',
      label: '전공필수 (지구환경이동현상 또는 대체과목)',
      requiredCount: 1,
      courses: ['EV4106', 'EV3103', 'EV4243', 'EV3112'],
      appliesTo: { entryYear: { from: 2018, to: 2023 } },
      sourceRefs: [evMajorMandatorySource],
    },
    {
      id: 'major.ev.mandatory.statistics',
      label: '전공필수 (환경·에너지과학통계)',
      requiredCount: 1,
      courses: ['EV3112'],
      appliesTo: { entryYear: { from: 2024 } },
      sourceRefs: [evMajorMandatorySource],
    },
    {
      id: 'major.ev.mandatory.analysis-lab-ii',
      label: '전공필수 (환경분석실험 II)',
      requiredCount: 1,
      courses: ['EV4107'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [evMajorMandatorySource],
    },
  ],
  BS: [
    {
      id: 'major.bs.mandatory.organic-chemistry-i',
      label: '전공필수 (유기화학 I)',
      requiredCount: 1,
      courses: ['BS2101'],
      appliesTo: { entryYear: { from: 2018, to: 2022 } },
      sourceRefs: [bsMajorMandatorySource],
    },
    {
      id: 'major.bs.mandatory.molecular-biology',
      label: '전공필수 (분자생물학)',
      requiredCount: 1,
      courses: ['BS2102'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [bsMajorMandatorySource],
    },
    {
      id: 'major.bs.mandatory.biochemistry-molecular-biology-lab',
      label: '전공필수 (생화학·분자생물학 실험)',
      requiredCount: 1,
      courses: ['BS2103', 'BS3111'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [bsMajorMandatorySource],
    },
    {
      id: 'major.bs.mandatory.biochemistry-i',
      label: '전공필수 (생화학 I)',
      requiredCount: 1,
      courses: ['BS2104', 'BS3113'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [bsMajorMandatorySource],
    },
    {
      id: 'major.bs.mandatory.biochemistry-ii',
      label: '전공필수 (생화학 II)',
      requiredCount: 1,
      courses: ['BS3101'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [bsMajorMandatorySource],
    },
    {
      id: 'major.bs.mandatory.cell-biology',
      label: '전공필수 (세포생물학)',
      requiredCount: 1,
      courses: ['BS3105'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [bsMajorMandatorySource],
    },
    {
      id: 'major.bs.mandatory.cell-developmental-biology-lab',
      label: '전공필수 (세포·발생생물학 실험)',
      requiredCount: 1,
      courses: ['BS3112'],
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [bsMajorMandatorySource],
    },
  ],
};

export const MINOR_MANDATORY_RULES: Record<string, readonly MandatoryCourseRule[]> = {
  IR: [],
  CT: [
    {
      id: 'minor.ct.mandatory.core',
      label: '부전공 필수 택3',
      requiredCount: 3,
      courses: ['CT4101', 'CT4102', 'CT4201', 'CT4202', 'CT4203', 'CT4301', 'CT4302', 'CT4303', 'CT4304', 'CT4305'],
      appliesTo: allCohorts,
      sourceRefs: [ctMinorSource],
    },
  ],
  AI: [
    {
      id: 'minor.ai.mandatory.a',
      label: '부전공 필수A 택1 (인공지능/기계학습/딥러닝)',
      requiredCount: 1,
      courses: ['EC4209', 'AI4021', 'AI4311'],
      sourceRefs: [aiMinorSource, aiMinorHistoricalSource],
      appliesTo: {
        allCohorts: true,
        declarationTerm: { to: { year: 2025, semester: '1' } },
        note: '2021-2~2025-1 선언자는 필수A 1과목 필요',
      },
    },
    {
      id: 'minor.ai.mandatory.b',
      label: '부전공 필수B 택1 (프로젝트/경험랩, 개편 전 경과조치 포함)',
      requiredCount: 1,
      courses: ['AI4003', 'AI4028', 'AI4501', 'AI4001'],
      sourceRefs: [aiMinorSource, aiMinorHistoricalSource],
      appliesTo: {
        allCohorts: true,
        declarationTerm: { to: { year: 2024, semester: '2' } },
        note: '2024-2 이전 선언자의 기이수 프로젝트 1·2 인정',
      },
    },
    {
      id: 'minor.ai.mandatory.b.2025-1',
      label: '부전공 필수B 택1 (프로젝트/경험랩)',
      requiredCount: 1,
      courses: ['AI4003', 'AI4028', 'AI4501'],
      sourceRefs: [aiMinorSource],
      appliesTo: {
        allCohorts: true,
        declarationTerm: { from: { year: 2025, semester: '1' }, to: { year: 2025, semester: '1' } },
        note: '2025-1 선언자는 개편 후 필수B 1과목 필요',
      },
    },
  ],
  MD: [
    {
      id: 'minor.md.mandatory.intro',
      label: '부전공 필수 (MD2101 의공학 개론)',
      requiredCount: 1,
      courses: ['MD2101'],
      sourceRefs: [mdMinorSource],
      appliesTo: {
        entryYear: { from: 2025 },
        note: '2025학번부터 MD2101 필수. 이전 학번은 권고',
      },
    },
  ],
  LH_LIT: [
    {
      id: 'minor.lh_lit.mandatory.all',
      label: '부전공 필수 (전체 이수)',
      requiredCount: 4,
      courses: ['LH2507', 'LH2509', 'LH2521', 'LH2602'],
      appliesTo: { entryYear: { from: 2021 } },
      sourceRefs: [lhLitCoursePlanSource],
    },
  ],
  LH_PP: [
    {
      id: 'minor.lh_pp.mandatory.all',
      label: '부전공 필수 (전체 이수)',
      requiredCount: 3,
      courses: ['PP2704', 'PP2763', 'PP2765'],
      appliesTo: { entryYear: { from: 2021 } },
      sourceRefs: [lhPpCoursePlanSource],
    },
  ],
  LH_EB: [
    {
      id: 'minor.lh_eb.mandatory.all',
      label: '부전공 필수 (전체 이수)',
      requiredCount: 3,
      courses: ['EB2750', 'GS2750', 'EB3722', 'GS3722', 'EB3737', 'GS3737'],
      appliesTo: { entryYear: { from: 2021 } },
      sourceRefs: [lhEbCoursePlanSource],
    },
  ],
  EC: [
    {
      id: 'minor.ec.mandatory.experiment',
      label: '부전공 필수 택1 (전자공학실험 또는 컴퓨터시스템이론및실험)',
      requiredCount: 1,
      courses: ['EC3101', 'EC3102'],
      appliesTo: allCohorts,
      sourceRefs: [ecMinorSource],
    },
  ],
  MA: [
    {
      id: 'minor.ma.mandatory.core',
      label: '부전공 전공필수 택2',
      requiredCount: 2,
      courses: ['MA2101', 'MA2102', 'MA2103', 'MA2104', 'MA3104', 'MA3105'],
      appliesTo: allCohorts,
      sourceRefs: [maMinorSource],
    },
  ],
  MC: [
    {
      id: 'minor.mc.mandatory.core',
      label: '부전공 전공필수 택3',
      requiredCount: 3,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106', 'MC3107'],
      appliesTo: allCohorts,
      sourceRefs: [mcMinorSource, ...HISTORICAL_MECHANICAL_LAB_SOURCES],
    },
  ],
  EV: [
    {
      id: 'minor.ev.mandatory.intro',
      label: '부전공 필수 (환경에너지공학)',
      requiredCount: 1,
      courses: ['EV3101'],
      appliesTo: allCohorts,
      sourceRefs: [evMinorSource],
    },
    {
      id: 'minor.ev.mandatory.core-without-lab',
      label: '부전공 전공필수 택2 (실험과목 제외)',
      requiredCount: 2,
      courses: ['EV3111', 'EV3112'],
      appliesTo: allCohorts,
      sourceRefs: [evMinorSource],
    },
  ],
  BS: [
    {
      id: 'minor.bs.mandatory.lectures',
      label: '생명 부전공 필수 강의 택2',
      requiredCount: 2,
      courses: ['BS2102', 'BS2104', 'BS3113', 'BS3101', 'BS3105'],
      appliesTo: allCohorts,
      sourceRefs: [bsMinorSource],
    },
    {
      id: 'minor.bs.mandatory.lab',
      label: '생명 부전공 필수 실험 택1',
      requiredCount: 1,
      courses: ['BS2103', 'BS3111', 'BS3112'],
      appliesTo: allCohorts,
      sourceRefs: [bsMinorSource],
    },
  ],
  PS: [
    {
      id: 'minor.ps.mandatory.core',
      label: '물리 부전공 전공필수 택3',
      requiredCount: 3,
      courses: ['PS2101', 'PS2102', 'PS2103', 'PS3103', 'PS3104', 'PS3105', 'PS3106', 'PS3107'],
      appliesTo: allCohorts,
      sourceRefs: [psMinorSource],
    },
    {
      id: 'minor.ps.mandatory.classical-em',
      label: '고전역학 I / 전자기학 I·II 택1',
      requiredCount: 1,
      courses: ['PS2101', 'PS2102', 'PS2103'],
      appliesTo: { entryYear: { from: 2021 } },
      sourceRefs: [psMinorSource],
    },
    {
      id: 'minor.ps.mandatory.quantum',
      label: '양자물리 I·II 택1',
      requiredCount: 1,
      courses: ['PS3103', 'PS3104'],
      appliesTo: { entryYear: { from: 2021 } },
      sourceRefs: [psMinorSource],
    },
  ],
  CH: [
    {
      id: 'minor.ch.mandatory.core',
      label: '부전공 전공필수 택3',
      requiredCount: 3,
      courses: ['CH2101', 'CH2102', 'CH2103', 'CH3104', 'CH2104', 'CH2105', 'CH3106', 'CH3208', 'CH3107'],
      appliesTo: allCohorts,
      sourceRefs: [chMinorSource, chMajorMandatorySource],
    },
  ],
  MM: [
    {
      id: 'minor.mm.mandatory.calculus-algebra',
      legacyAlternative: {
        triggerCourseCode: 'GS2003',
        requiredCount: 2,
        courses: ['GS2003', 'MM2001', 'GS2001', 'MM2011', 'MM3101'],
      },
      label: '부전공 필수 택3 (다변수해석학, 미분방정식, 선형대수학 중 도전탐색 필수과목 제외)',
      requiredCount: 3,
      courses: ['MM2001', 'GS2001', 'MM2011', 'MM2002', 'GS2002', 'MM2004', 'GS2004', 'MM3101'],
      appliesTo: { entryYear: { to: 2025 } },
      sourceRefs: [mmMinorSource, HISTORICAL_MATH_SOURCE],
    },
    {
      id: 'minor.mm.mandatory.analysis',
      label: '부전공 필수 택1 (해석학/복소함수학)',
      requiredCount: 1,
      courses: ['MM3201', 'GS3001', 'MM3203', 'GS4002'],
      appliesTo: { entryYear: { to: 2025 } },
      sourceRefs: [mmMinorSource],
    },
    {
      id: 'minor.mm.mandatory.core-2026',
      label: '부전공 필수 수학 택2',
      requiredCount: 2,
      courses: ['MM2001', 'GS2001', 'MM2011', 'MM2002', 'GS2002', 'MM2004', 'GS2004'],
      appliesTo: { entryYear: { from: 2026 } },
      sourceRefs: [mmMinorSource],
    },
    {
      id: 'minor.mm.mandatory.analysis-2026',
      label: '부전공 해석학/복소함수학 택1',
      requiredCount: 1,
      courses: ['MM3201', 'GS3001', 'MM3203', 'GS4002'],
      appliesTo: { entryYear: { from: 2026 } },
      sourceRefs: [mmMinorSource],
    },
    {
      id: 'minor.mm.mandatory.algebra-2026',
      label: '부전공 현대대수학1/선형대수학과 응용2 택1',
      requiredCount: 1,
      courses: ['MM3101'],
      courseNames: ['선형대수학과 응용2'],
      appliesTo: { entryYear: { from: 2026 } },
      sourceRefs: [mmMinorSource],
    },
  ],
};

export const MINOR_DECLARATION_TERM_REQUIREMENTS: Record<string, MinorDeclarationTermRequirement> = {
  FE: {
    minorCode: 'FE',
    appliesTo: allCohorts,
    sourceRefs: [ENERGY_DECLARATION_SOURCE],
    missingTermRequirementId: 'minor-declaration-term-FE',
    missingTermLabel: '에너지 부전공 기존 선언 확인 필요',
    missingTermHint: '2025-1학기부터 에너지 부전공은 취소만 가능합니다. 기존에 선언한 학기를 입력해 주세요.',
  },
  AI: {
    minorCode: 'AI',
    appliesTo: allCohorts,
    sourceRefs: [aiMinorSource],
    missingTermRequirementId: 'minor-declaration-term-AI',
    missingTermLabel: 'AI 부전공 선언 학기 확인 필요',
    missingTermHint: 'AI 부전공은 선언 학기에 따라 필수과목 적용 여부가 달라져 선언 학기 정보가 필요합니다.',
  },
  IR: {
    minorCode: 'IR',
    appliesTo: allCohorts,
    sourceRefs: [irMinorSource],
    missingTermRequirementId: 'minor-declaration-term-IR',
    missingTermLabel: 'IR 부전공 선언 학기 확인 필요',
    missingTermHint: 'IR 부전공은 선언 학기에 따라 필수과목 적용 여부가 달라져 선언 학기 정보가 필요합니다.',
  },
};

export const IR_AI_CODE_COURSE_LIMIT_REQUIREMENT: MinorCourseLimitRequirement = {
  id: 'minor.ir.ai-code-course-limit',
  minorCode: 'IR',
  evaluatorId: 'ir-ai-code-course-limit',
  appliesTo: allCohorts,
  limit: {
    maxCourses: 4,
    unit: 'courses',
  },
  reason: '지능로봇 부전공 AI-code 지정 교과목은 최대 4과목까지만 인정됩니다.',
  sourceRefs: [irMinorSource],
};

function toCatalogRule(
  kind: RuleCatalogRule['kind'],
  rule: SourceBackedRule & { label?: string },
  scope: RuleCatalogScope,
  parameters: RuleCatalogParameters,
  id = rule.id,
): RuleCatalogRule {
  const catalogRule: RuleCatalogRule = {
    id,
    kind,
    scope,
    parameters,
    sourceRefs: rule.sourceRefs,
    appliesTo: rule.appliesTo,
  };

  if (rule.label) {
    catalogRule.label = rule.label;
  }

  if (rule.evaluatorId) {
    catalogRule.evaluatorId = rule.evaluatorId;
  }

  return catalogRule;
}

function entryYearRangeIdSuffix(condition: RequirementCondition): string {
  const range = condition.entryYear;
  if (!range) return 'all';
  if (range.from !== undefined && range.to !== undefined && range.from === range.to) return String(range.from);
  if (range.from !== undefined && range.to !== undefined) return `${range.from}-${range.to}`;
  if (range.from !== undefined) return `${range.from}-plus`;
  if (range.to !== undefined) return `until-${range.to}`;
  return 'all';
}

function creditRequirementScope(programKind: 'major' | 'minor', requirement: CreditRequirement): RuleCatalogScope {
  return requirement.programCodes?.length
    ? programScope(programKind, requirement.programCodes)
    : programKind === 'major'
      ? majorProgramKindScope
      : minorProgramKindScope;
}

function creditRequirementParameters(requirement: CreditRequirement): CreditMinimumRuleParameters {
  return {
    requiredCredits: requirement.requiredCredits,
    unit: 'credits',
  };
}

function mandatoryCourseRuleParameters(rule: MandatoryCourseRule): CourseCountRuleParameters {
  return {
    requiredCount: rule.requiredCount,
    unit: 'courses',
    courses: rule.courses,
    ...(rule.courseNames ? { courseNames: rule.courseNames } : {}),
    ...(rule.legacyAlternative ? { legacyAlternative: rule.legacyAlternative } : {}),
  };
}

function courseLimitParameters(rule: MinorCourseLimitRequirement): CourseLimitRuleParameters {
  return {
    maxCourses: rule.limit.maxCourses,
    unit: rule.limit.unit,
    reason: rule.reason,
  };
}

function declarationTermRequiredParameters(
  requirement: MinorDeclarationTermRequirement,
): DeclarationTermRequiredRuleParameters {
  return {
    missingContext: 'declarationTerm',
    missingTermRequirementId: requirement.missingTermRequirementId,
    missingTermLabel: requirement.missingTermLabel,
    missingTermHint: requirement.missingTermHint,
  };
}

function thesisResearchParameters(
  requirement: Omit<ThesisRequirement, 'sourceRefs' | 'appliesTo'>,
): ThesisResearchRuleParameters {
  return {
    suffix: requirement.suffix,
    requiredCount: requirement.requiredCount,
    unit: 'courses',
    sourceRequiredCredits: requirement.sourceRequiredCredits,
  };
}

const thesisRequirementCatalogRules: readonly RuleCatalogRule[] = [
  ...THESIS_REQUIREMENT_TEMPLATES.map((requirement) => ({
    id: `${requirement.id}.2018-2020`,
    kind: 'thesis-research',
    label: requirement.label,
    scope: majorProgramKindScope,
    parameters: thesisResearchParameters(requirement),
    sourceRefs: [overallSource2018To2020],
    appliesTo: { entryYear: { from: 2018, to: 2020 } },
  })),
  ...THESIS_REQUIREMENT_TEMPLATES.map((requirement) => ({
    id: `${requirement.id}.2021-plus`,
    kind: 'thesis-research',
    label: requirement.label,
    scope: majorProgramKindScope,
    parameters: thesisResearchParameters(requirement),
    sourceRefs: [overallSource2021Plus],
    appliesTo: { entryYear: { from: 2021 } },
  })),
];

export const MAJOR_MINOR_REQUIREMENT_CATALOG_RULES = defineRuleCatalog(
  [
    ...(['MD', 'FE'] as const).map((code) => ({
      id: `minor.${code.toLowerCase()}.curriculum-course-count`,
      kind: 'course-count' as const,
      label: `${code} 부전공 5과목`,
      scope: programScope('minor', [code]),
      parameters: { requiredCount: 5, unit: 'courses' as const, courses: getMinorCourseCodes(code) },
      appliesTo: allCohorts,
      sourceRefs: [code === 'MD' ? mdMinorSource : feMinorSource],
    })),
    {
      id: 'minor.ma.upper-level',
      kind: 'course-count',
      label: 'MA 3·4천번대 3과목',
      scope: programScope('minor', ['MA']),
      parameters: {
        requiredCount: 3,
        unit: 'courses',
        courses: getMinorCourseCodes('MA').filter((code) => /^MA[34]/.test(code)),
      },
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [maMinorSource],
    },
    ...(['2000', '3000-4000'] as const).map((level) => ({
      id: `minor.ec.level-${level}`,
      kind: 'credit-minimum' as const,
      label: `EC ${level} 학점`,
      scope: programScope('minor', ['EC']),
      parameters: {
        requiredCredits: level === '2000' ? 6 : 12,
        unit: 'credits' as const,
        codePrefixes: level === '2000' ? ['EC2'] : ['EC3', 'EC4'],
      },
      appliesTo: { entryYear: { from: 2018 } },
      sourceRefs: [ecMinorSource],
    })),
    {
      id: 'minor.mm.electives.2026-plus',
      kind: 'credit-minimum',
      label: '수리과학 부전공 선택',
      scope: programScope('minor', ['MM']),
      parameters: {
        requiredCredits: 6,
        unit: 'credits',
        codePrefixes: ['MM3', 'MM4'],
        excludeMandatory: true,
        excludeScienceBasic: true,
      },
      appliesTo: { entryYear: { from: 2026 } },
      sourceRefs: [mmMinorSource],
    },
    ...MAJOR_CREDIT_REQUIREMENTS.map((requirement) =>
      toCatalogRule(
        'credit-minimum',
        requirement,
        creditRequirementScope('major', requirement),
        creditRequirementParameters(requirement),
        `${requirement.id}.${entryYearRangeIdSuffix(requirement.appliesTo)}`,
      ),
    ),
    ...MINOR_CREDIT_REQUIREMENTS.map((requirement) =>
      toCatalogRule(
        'credit-minimum',
        requirement,
        creditRequirementScope('minor', requirement),
        creditRequirementParameters(requirement),
      ),
    ),
    ...thesisRequirementCatalogRules,
    ...Object.entries(MAJOR_MANDATORY_RULES).flatMap(([programCode, rules]) =>
      rules.map((rule) =>
        toCatalogRule('course-count', rule, programScope('major', [programCode]), mandatoryCourseRuleParameters(rule)),
      ),
    ),
    ...Object.entries(MINOR_MANDATORY_RULES).flatMap(([programCode, rules]) =>
      rules.map((rule) =>
        toCatalogRule('course-count', rule, programScope('minor', [programCode]), mandatoryCourseRuleParameters(rule)),
      ),
    ),
    ...Object.values(MINOR_DECLARATION_TERM_REQUIREMENTS).map((requirement) => ({
      id: requirement.missingTermRequirementId,
      kind: 'declaration-term-required',
      label: requirement.missingTermLabel,
      scope: programScope('minor', [requirement.minorCode]),
      parameters: declarationTermRequiredParameters(requirement),
      sourceRefs: requirement.sourceRefs,
      appliesTo: requirement.appliesTo,
    })),
    toCatalogRule(
      'course-limit',
      IR_AI_CODE_COURSE_LIMIT_REQUIREMENT,
      programScope('minor', [IR_AI_CODE_COURSE_LIMIT_REQUIREMENT.minorCode]),
      courseLimitParameters(IR_AI_CODE_COURSE_LIMIT_REQUIREMENT),
    ),
  ] as const,
  { publishable: true },
);

export function getMajorCreditRequirement(entryYear: number, majorCode?: string): CreditRequirement {
  const match =
    MAJOR_CREDIT_REQUIREMENTS.find(
      (r) =>
        appliesToRequirementCondition(r.appliesTo, { entryYear }) &&
        (majorCode ? r.programCodes?.includes(majorCode) : r.id === 'major-credits'),
    ) ?? MAJOR_CREDIT_REQUIREMENTS[1];
  return { ...match, id: 'major-credits' };
}

export function getThesisRequirements(entryYear: number): readonly ThesisRequirement[] {
  const sourceRefs = entryYear >= 2021 ? [overallSource2021Plus] : [overallSource2018To2020];
  const appliesTo = entryYear >= 2021 ? { entryYear: { from: 2021 } } : { entryYear: { from: 2018, to: 2020 } };
  return THESIS_REQUIREMENT_TEMPLATES.map((requirement) => ({
    ...requirement,
    appliesTo,
    sourceRefs,
  }));
}

export function getMinorCreditRequirement(minorCode: string, entryYear: number): CreditRequirement {
  const normalizedMinorCode = normalizeCode(minorCode);
  const matching = MINOR_CREDIT_REQUIREMENTS.filter((requirement) => {
    const programMatches =
      !requirement.programCodes || requirement.programCodes.map(normalizeCode).includes(normalizedMinorCode);
    return programMatches && appliesToRequirementCondition(requirement.appliesTo, { entryYear });
  });

  return matching[matching.length - 1] ?? MINOR_CREDIT_REQUIREMENTS[0];
}

export function getMajorMandatoryRulesForContext(
  majorCode: string | null | undefined,
  context: RequirementContext,
): readonly MandatoryCourseRule[] {
  return (MAJOR_MANDATORY_RULES[normalizeCode(majorCode)] ?? [])
    .filter((rule) => appliesToRequirementCondition(rule.appliesTo, context))
    .map(cloneMandatoryRule);
}

export function getMinorDeclarationTermRequirement(
  minorCode?: string | null,
): MinorDeclarationTermRequirement | undefined {
  return MINOR_DECLARATION_TERM_REQUIREMENTS[normalizeCode(minorCode)];
}

export function requiresMinorDeclarationTerm(minorCode?: string | null): boolean {
  return !!getMinorDeclarationTermRequirement(minorCode);
}

export function getMinorMandatoryRulesForContext(
  minorCode: string,
  context: RequirementContext,
  completedCodes: readonly string[] = [],
): readonly MandatoryCourseRule[] {
  const normalizedMinorCode = normalizeCode(minorCode);
  const rules = (MINOR_MANDATORY_RULES[normalizedMinorCode] ?? []).filter((rule) =>
    appliesToRequirementCondition(rule.appliesTo, context),
  );

  if (normalizedMinorCode === 'IR') {
    return [];
  }

  return rules.map((rule) => {
    const alternative = rule.legacyAlternative;
    return alternative && completedCodes.includes(alternative.triggerCourseCode)
      ? {
          ...cloneMandatoryRule(rule),
          requiredCount: alternative.requiredCount,
          courses: [...alternative.courses],
          label: 'GS2003 기이수 수학 필수 택2 (기초교육 제외)',
        }
      : cloneMandatoryRule(rule);
  });
}

export function getMinorCourseLimitRequirement(
  minorCode: string | null | undefined,
  context: RequirementContext,
): MinorCourseLimitRequirement | undefined {
  if (normalizeCode(minorCode) !== 'IR') return undefined;
  return appliesToRequirementCondition(IR_AI_CODE_COURSE_LIMIT_REQUIREMENT.appliesTo, context)
    ? IR_AI_CODE_COURSE_LIMIT_REQUIREMENT
    : undefined;
}
