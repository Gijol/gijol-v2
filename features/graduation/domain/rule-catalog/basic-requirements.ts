import type { CategoryRule, RequirementSource, YearRuleSet } from '../types';

interface EntryYearRange {
  from: number;
  to?: number;
}

interface CreditRequirement {
  id: string;
  label: string;
  requiredCredits: number;
}

interface CourseRequirement extends CreditRequirement {
  acceptedCodes: readonly string[];
}

interface CountRequirement {
  id: string;
  label: string;
  requiredCount: number;
}

interface ScienceCreditsRequirement {
  id: string;
  label: string;
  defaultCredits: number;
  withComputerProgrammingCredits: number;
}

export interface BasicRequirementCatalog {
  id: string;
  name: string;
  entryYear: EntryYearRange;
  source: RequirementSource;
  minGpaForGraduation: number;
  categoryRules: readonly CategoryRule[];
  totalCredits: CreditRequirement;
  language: {
    totalCredits: CreditRequirement;
    englishI: CourseRequirement & {
      legacyPairCodesFor2021Plus?: readonly string[];
    };
    englishII: CourseRequirement;
    writing: CourseRequirement;
  };
  scienceBasic: {
    totalCredits: ScienceCreditsRequirement;
    calculus: CourseRequirement;
    coreMath: CourseRequirement;
    softwareBasic: CourseRequirement;
  };
  humanities: {
    totalCredits: CreditRequirement;
    hus: CreditRequirement;
    ppe: CreditRequirement;
  };
  commonMandatory: {
    freshman: CourseRequirement;
    majorExploration?: CourseRequirement;
    scienceEconomy: CourseRequirement;
    colloquium: CountRequirement & {
      acceptedCodes: readonly string[];
    };
  };
  artsSports: {
    arts: CountRequirement;
    sports: CountRequirement;
  };
}

const BACHELOR_MANUAL_2026 = 'docs/bachelor_manual/2026_manual.pdf';

const categoryRules: readonly CategoryRule[] = [
  { key: 'languageBasic', minCredits: 7 },
  { key: 'humanities', minCredits: 24 },
  { key: 'scienceBasic', minCredits: 17 },
  { key: 'major', minCredits: 36 },
  { key: 'minor', minCredits: 0, optional: true },
  { key: 'etcMandatory', minCredits: 8 },
  { key: 'otherUncheckedClass', minCredits: 0, optional: true },
];

const languageCommon = {
  totalCredits: {
    id: 'language-total',
    label: '언어의 기초',
    requiredCredits: 7,
  },
  englishII: {
    id: 'language-english-ii',
    label: '영어 II',
    requiredCredits: 2,
    acceptedCodes: ['GS1602', 'GS1604', 'GS2652'],
  },
  writing: {
    id: 'language-writing',
    label: '글쓰기',
    requiredCredits: 3,
    acceptedCodes: ['GS1511', 'GS1512', 'GS1513', 'GS1531', 'GS1532', 'GS1533', 'GS1535'],
  },
};

const scienceBasicCommon = {
  totalCredits: {
    id: 'science-total',
    label: '기초과학',
    defaultCredits: 18,
    withComputerProgrammingCredits: 17,
  },
  calculus: {
    id: 'science-calculus',
    label: '미적분학',
    requiredCredits: 1,
    acceptedCodes: ['GS1001', 'GS1011'],
  },
  coreMath: {
    id: 'science-core-math',
    label: '수학 선택 필수',
    requiredCredits: 1,
    acceptedCodes: ['GS1002', 'GS2001', 'MM2001', 'GS1012', 'GS2004', 'GS2013', 'MM2004', 'GS2002', 'MM2002'],
  },
  softwareBasic: {
    id: 'science-sw-basic',
    label: 'SW 기초와 코딩',
    requiredCredits: 1,
    acceptedCodes: ['GS1490', 'GS1401'],
  },
};

const humanitiesCommon = {
  totalCredits: {
    id: 'humanities-total',
    label: '인문사회',
    requiredCredits: 24,
  },
  hus: {
    id: 'humanities-hus',
    label: 'HUS',
    requiredCredits: 6,
  },
  ppe: {
    id: 'humanities-ppe',
    label: 'PPE',
    requiredCredits: 6,
  },
};

const commonMandatoryBase = {
  freshman: {
    id: 'etc-freshman',
    label: 'GIST 새내기',
    requiredCredits: 1,
    acceptedCodes: ['GS1901', 'GS9301'],
  },
  scienceEconomy: {
    id: 'etc-science-economy',
    label: '과학기술과 경제',
    requiredCredits: 1,
    acceptedCodes: ['GS1701', 'UC0901'],
  },
  colloquium: {
    id: 'etc-colloquium',
    label: 'GIST대학 콜로퀴움',
    requiredCount: 2,
    acceptedCodes: ['UC9331'],
  },
};

function source(page: number, note: string): RequirementSource {
  return {
    manualYear: 2026,
    page,
    path: BACHELOR_MANUAL_2026,
    note,
  };
}

export const BASIC_REQUIREMENT_CATALOG: readonly BasicRequirementCatalog[] = [
  {
    id: 'basic-2018-2019',
    name: '2018~2019학번 기본요건',
    entryYear: { from: 2018, to: 2019 },
    source: source(34, '2018~2020 입학생 이수요건 표, 2018~2019 예능/체육 4학기 적용'),
    minGpaForGraduation: 2.0,
    categoryRules,
    totalCredits: {
      id: 'total-credits',
      label: '총 이수학점',
      requiredCredits: 130,
    },
    language: {
      ...languageCommon,
      englishI: {
        id: 'language-english-i',
        label: '영어 I',
        requiredCredits: 2,
        acceptedCodes: ['GS1601', 'GS1603', 'GS1607'],
      },
    },
    scienceBasic: scienceBasicCommon,
    humanities: humanitiesCommon,
    commonMandatory: commonMandatoryBase,
    artsSports: {
      arts: {
        id: 'arts',
        label: '예술 교양',
        requiredCount: 4,
      },
      sports: {
        id: 'sports',
        label: '체육',
        requiredCount: 4,
      },
    },
  },
  {
    id: 'basic-2020',
    name: '2020학번 기본요건',
    entryYear: { from: 2020, to: 2020 },
    source: source(34, '2018~2020 입학생 이수요건 표, 2020 이후 예능/체육 2학기 적용'),
    minGpaForGraduation: 2.0,
    categoryRules,
    totalCredits: {
      id: 'total-credits',
      label: '총 이수학점',
      requiredCredits: 130,
    },
    language: {
      ...languageCommon,
      englishI: {
        id: 'language-english-i',
        label: '영어 I',
        requiredCredits: 2,
        acceptedCodes: ['GS1601', 'GS1603', 'GS1607'],
      },
    },
    scienceBasic: scienceBasicCommon,
    humanities: humanitiesCommon,
    commonMandatory: commonMandatoryBase,
    artsSports: {
      arts: {
        id: 'arts',
        label: '예술 교양',
        requiredCount: 2,
      },
      sports: {
        id: 'sports',
        label: '체육',
        requiredCount: 2,
      },
    },
  },
  {
    id: 'basic-2021-plus',
    name: '2021학번 이후 기본요건',
    entryYear: { from: 2021 },
    source: source(33, '2021 이후 입학생 이수요건 표'),
    minGpaForGraduation: 2.0,
    categoryRules,
    totalCredits: {
      id: 'total-credits',
      label: '총 이수학점',
      requiredCredits: 130,
    },
    language: {
      ...languageCommon,
      englishI: {
        id: 'language-english-i',
        label: '영어 I',
        requiredCredits: 2,
        acceptedCodes: ['GS1607'],
        legacyPairCodesFor2021Plus: ['GS1601', 'GS1603'],
      },
    },
    scienceBasic: scienceBasicCommon,
    humanities: humanitiesCommon,
    commonMandatory: {
      ...commonMandatoryBase,
      majorExploration: {
        id: 'etc-major-exploration',
        label: '전공탐색',
        requiredCredits: 1,
        acceptedCodes: ['UC0902'],
      },
    },
    artsSports: {
      arts: {
        id: 'arts',
        label: '예술 교양',
        requiredCount: 2,
      },
      sports: {
        id: 'sports',
        label: '체육',
        requiredCount: 2,
      },
    },
  },
];

function appliesToEntryYear(catalog: BasicRequirementCatalog, entryYear: number): boolean {
  return (
    entryYear >= catalog.entryYear.from && (catalog.entryYear.to === undefined || entryYear <= catalog.entryYear.to)
  );
}

export function getBasicRequirementCatalog(entryYear: number): BasicRequirementCatalog {
  return (
    BASIC_REQUIREMENT_CATALOG.find((catalog) => appliesToEntryYear(catalog, entryYear)) ?? BASIC_REQUIREMENT_CATALOG[1]
  );
}

export function buildYearRuleSetFromBasicCatalog(entryYear: number, nameOverride?: string): YearRuleSet {
  const catalog = getBasicRequirementCatalog(entryYear);

  return {
    name: nameOverride ?? catalog.name,
    minTotalCredits: catalog.totalCredits.requiredCredits,
    minGpaForGraduation: catalog.minGpaForGraduation,
    categories: catalog.categoryRules.map((rule) => ({ ...rule })),
  };
}
