import type { RequirementSource } from '../types';
import {
  appliesToRequirementCondition,
  compareAcademicTerms,
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
  label: string;
  requiredCount: number;
  courses: readonly string[];
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
    requiredCredits: 36,
    appliesTo: { entryYear: { from: 2018, to: 2020 } },
    sourceRefs: [overallSource2018To2020],
  },
  {
    id: 'major-credits',
    label: '전공 학점',
    requiredCredits: 36,
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
    requiredCredits: 15,
    programCodes: ['EC'],
    appliesTo: allCohorts,
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
    sourceRefs: [chMinorSource],
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
    sourceRefs: [mcMinorSource],
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
      id: 'major.mc.mandatory.core',
      label: '전공필수 택3 (MC2100, MC2101, MC2102, MC2103, MC3106, MC3107)',
      requiredCount: 3,
      courses: ['MC2100', 'MC2101', 'MC2102', 'MC2103', 'MC3106', 'MC3107'],
      appliesTo: allCohorts,
      sourceRefs: [mcMajorMandatorySource],
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
      courses: ['EC4209', 'AI4020', 'AI4021', 'AI4311'],
      sourceRefs: [aiMinorSource],
      appliesTo: {
        allCohorts: true,
        declarationTerm: { to: { year: 2025, semester: '1' } },
        note: '2021-2~2025-1 선언자는 필수A 1과목 필요',
      },
    },
    {
      id: 'minor.ai.mandatory.b',
      label: '부전공 필수B 택1 (프로젝트/경험랩)',
      requiredCount: 1,
      courses: ['AI4003', 'AI4028', 'AI4501'],
      sourceRefs: [aiMinorSource],
      appliesTo: {
        allCohorts: true,
        declarationTerm: { to: { year: 2025, semester: '1' } },
        note: '2021-2~2025-1 선언자는 필수B 1과목 필요',
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
      appliesTo: allCohorts,
      sourceRefs: [lhLitCoursePlanSource],
    },
  ],
  LH_PP: [
    {
      id: 'minor.lh_pp.mandatory.all',
      label: '부전공 필수 (전체 이수)',
      requiredCount: 3,
      courses: ['PP2704', 'PP2763', 'PP2765'],
      appliesTo: allCohorts,
      sourceRefs: [lhPpCoursePlanSource],
    },
  ],
  LH_EB: [
    {
      id: 'minor.lh_eb.mandatory.all',
      label: '부전공 필수 (전체 이수)',
      requiredCount: 3,
      courses: ['EB2750', 'GS2750', 'EB3722', 'GS3722', 'EB3737', 'GS3737'],
      appliesTo: allCohorts,
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
      sourceRefs: [mcMinorSource],
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
      id: 'minor.bs.mandatory.core',
      label: '부전공 전공필수 택3 (교과목2+실험1, 유기화학 제외)',
      requiredCount: 3,
      courses: ['BS2102', 'BS2104', 'BS3101', 'BS3105', 'BS2103', 'BS3111', 'BS3112'],
      appliesTo: allCohorts,
      sourceRefs: [bsMinorSource],
    },
  ],
  PS: [
    {
      id: 'minor.ps.mandatory.classical-mechanics',
      label: '고전역학 택1 (PS2101/PS2202)',
      requiredCount: 1,
      courses: ['PS2101', 'PS2202'],
      appliesTo: allCohorts,
      sourceRefs: [psMinorSource],
    },
    {
      id: 'minor.ps.mandatory.electromagnetics',
      label: '전자기학 택1 (PS2102/PS2103)',
      requiredCount: 1,
      courses: ['PS2102', 'PS2103'],
      appliesTo: allCohorts,
      sourceRefs: [psMinorSource],
    },
    {
      id: 'minor.ps.mandatory.quantum',
      label: '양자물리 택1 (PS3103/PS3104)',
      requiredCount: 1,
      courses: ['PS3103', 'PS3104'],
      appliesTo: allCohorts,
      sourceRefs: [psMinorSource],
    },
  ],
  CH: [
    {
      id: 'minor.ch.mandatory.core',
      label: '부전공 전공필수 택3',
      requiredCount: 3,
      courses: ['CH2101', 'CH2102', 'CH2103', 'CH2104', 'CH2105'],
      appliesTo: allCohorts,
      sourceRefs: [chMinorSource],
    },
  ],
  MM: [
    {
      id: 'minor.mm.mandatory.calculus-algebra',
      label: '부전공 필수 택3 (다변수해석학, 미분방정식, 선형대수학 중 도전탐색 필수과목 제외)',
      requiredCount: 3,
      courses: ['MM2001', 'GS2001', 'MM2011', 'MM2002', 'GS2002', 'MM2004', 'GS2004', 'MM3101'],
      appliesTo: allCohorts,
      sourceRefs: [mmMinorSource],
    },
    {
      id: 'minor.mm.mandatory.analysis',
      label: '부전공 필수 택1 (해석학/복소함수학)',
      requiredCount: 1,
      courses: ['MM3201', 'GS3001', 'MM3203', 'GS4002'],
      appliesTo: allCohorts,
      sourceRefs: [mmMinorSource],
    },
  ],
};

export const MINOR_DECLARATION_TERM_REQUIREMENTS: Record<string, MinorDeclarationTermRequirement> = {
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
        toCatalogRule(
          'course-count',
          rule,
          programScope('major', [programCode]),
          mandatoryCourseRuleParameters(rule),
        ),
      ),
    ),
    ...Object.entries(MINOR_MANDATORY_RULES).flatMap(([programCode, rules]) =>
      rules.map((rule) =>
        toCatalogRule(
          'course-count',
          rule,
          programScope('minor', [programCode]),
          mandatoryCourseRuleParameters(rule),
        ),
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

export function getMajorCreditRequirement(entryYear: number): CreditRequirement {
  return (
    MAJOR_CREDIT_REQUIREMENTS.find((requirement) =>
      appliesToRequirementCondition(requirement.appliesTo, { entryYear }),
    ) ??
    MAJOR_CREDIT_REQUIREMENTS[MAJOR_CREDIT_REQUIREMENTS.length - 1]
  );
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
): readonly MandatoryCourseRule[] {
  const normalizedMinorCode = normalizeCode(minorCode);
  const rules = (MINOR_MANDATORY_RULES[normalizedMinorCode] ?? []).filter((rule) =>
    appliesToRequirementCondition(rule.appliesTo, context),
  );

  if (normalizedMinorCode === 'IR') {
    return [];
  }

  if (normalizedMinorCode === 'AI') {
    const isTransitionDeclarer =
      !!context.declarationTerm && compareAcademicTerms(context.declarationTerm, { year: 2024, semester: '2' }) <= 0;
    return rules.map((rule) =>
      isTransitionDeclarer && rule.id === 'minor.ai.mandatory.b'
        ? {
            ...cloneMandatoryRule(rule),
            label: `${rule.label} (2024-2 이전 선언 경과조치 포함)`,
            courses: Array.from(new Set([...rule.courses, 'AI4001'])),
          }
        : cloneMandatoryRule(rule),
    );
  }

  return rules.map(cloneMandatoryRule);
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
