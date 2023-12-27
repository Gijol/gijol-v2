import { read, utils } from 'xlsx';
import dayjs from 'dayjs';
import { UseFormReturn } from 'react-hook-form';

interface CreditCommon {
  completed: number;
  inProgress: number;
  total: number;
}
//해외대학 공통 구조
interface OuterUnivCommon {
  subjects: string[];
  totalCredits: string;
  universityName: string;
  semester: string;
}

interface UserInfo {
  date: string;
  semester: string;
  affiliation: string;
  studentNumber: string;
  name: string;
  contact: string;
}

interface BasicAndCommon {
  languageBasics: CreditCommon;
  humanitiesAndSocial: CreditCommon;
  software: CreditCommon;
  basicScience: CreditCommon;
  gistFreshman: CreditCommon;
  gistMajorExploration: CreditCommon;
}

// major & research & free
interface MajorAndResearchAndFree {
  majorRequired: CreditCommon;
  majorElective: CreditCommon;
  thesisResearch: CreditCommon;
  universityCommonSubjects: CreditCommon;
  humanitiesAndSocial: CreditCommon;
  languageSelectionSoftware: CreditCommon;
  basicScienceSelection: CreditCommon;
  otherMajor: CreditCommon;
  graduateSchoolSubjects: CreditCommon;
}

// no-credits but required
interface NoCreditsRequired {
  artPracticalSkills: CreditCommon;
  physicalEducationPracticalSkills: CreditCommon;
  gistCollegeColloquium: CreditCommon;
}

// outer university
interface OuterUniversity {
  summerSession: OuterUnivCommon;
  studyAbroadProgram: OuterUnivCommon;
}

interface ParsedCertJsonType {
  OU: OuterUniversity;
  user_info: UserInfo;
  B_C: BasicAndCommon;
  M_R_F: MajorAndResearchAndFree;
  NOC: NoCreditsRequired;
}

const CNT_MONTH = dayjs().month();
const CNT_DATE = dayjs().format('YYYY-MM');

// 소속 관련 인덱스들
const STU_NUM_INDEX = '__EMPTY_3';
const AFF_INDEX = '__EMPTY_11';

// 학점 관련 인덱스들
const NAME_INDEX = '__EMPTY_11';

// 학점 관련 인덱스들
const LB_INDEX = '__EMPTY';
const HAS_INDEX = '__EMPTY_2';
const SW_INDEX = '__EMPTY_4';
const BS_INDEX = '__EMPTY_8';
const GF_INDEX = '__EMPTY_10';
const MR_INDEX = '__EMPTY_12';
const ME_INDEX = '__EMPTY_13';
const TR_INDEX = '__EMPTY_14';
const UCS_INDEX = '__EMPTY_19';
const HAS_INDEX_2 = '__EMPTY_23';
const LSS_INDEX = '__EMPTY_24';
const BSS_INDEX = '__EMPTY_28';
const OM_INDEX = '__EMPTY_31';
const GSS_INDEX = '__EMPTY_32';
const UNCLASSIFIED_INDEX = '__EMPTY_35';

// 총학점
const TOTAL_INDEX = '__EMPTY_37';

function mapUserInfo(data: any[]): UserInfo {
  const studentAffInfo = data[1];
  const studentSchoolInfo = data[2];
  return {
    date: CNT_DATE, // YYYY-MM
    semester: checkSemesterWithDate(CNT_MONTH), // 전/후반기
    affiliation: studentAffInfo[AFF_INDEX], // 소속
    studentNumber: studentSchoolInfo[STU_NUM_INDEX], // 학번
    name: studentSchoolInfo[NAME_INDEX], // 성명
    contact: '', // 정보 없음
  };
}

export function mapBasicAndCommon(data: any[]): BasicAndCommon {
  const creditData = data[5];
  return {
    languageBasics: {
      completed: parseInt(creditData[LB_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[LB_INDEX]),
    },
    humanitiesAndSocial: {
      completed: parseInt(creditData[HAS_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[HAS_INDEX]),
    },
    software: {
      completed: parseInt(creditData[SW_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[SW_INDEX]),
    },
    basicScience: {
      completed: parseInt(creditData[BS_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[BS_INDEX]),
    },
    gistFreshman: {
      completed: parseInt(creditData[GF_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[GF_INDEX]),
    },
    gistMajorExploration: {
      completed: parseInt(creditData[MR_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[MR_INDEX]),
    },
  };
}

const mapMajorAndResearchAndFree = (data: any[]) => {
  const creditData = data[5];
  return {
    majorRequired: {
      completed: parseInt(creditData[MR_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[MR_INDEX]),
    },
    majorElective: {
      completed: parseInt(creditData[ME_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[ME_INDEX]),
    },
    thesisResearch: {
      completed: parseInt(creditData[TR_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[TR_INDEX]),
    },
    universityCommonSubjects: {
      completed: parseInt(creditData[UCS_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[UCS_INDEX]),
    },
    humanitiesAndSocial: {
      completed: parseInt(creditData[HAS_INDEX_2]),
      inProgress: 0,
      total: parseInt(creditData[HAS_INDEX_2]),
    },
    languageSelectionSoftware: {
      completed: parseInt(creditData[LSS_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[LSS_INDEX]),
    },
    basicScienceSelection: {
      completed: parseInt(creditData[BSS_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[BSS_INDEX]),
    },
    otherMajor: {
      completed: parseInt(creditData[OM_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[OM_INDEX]),
    },
    graduateSchoolSubjects: {
      completed: parseInt(creditData[GSS_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[GSS_INDEX]),
    },
  };
};

const mapNoCreditsRequired = (data: any[]) => {
  const creditData = data[5];
  return {
    artPracticalSkills: {
      completed: parseInt(creditData[UNCLASSIFIED_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[UNCLASSIFIED_INDEX]),
    },
    physicalEducationPracticalSkills: {
      completed: parseInt(creditData[UNCLASSIFIED_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[UNCLASSIFIED_INDEX]),
    },
    gistCollegeColloquium: {
      completed: parseInt(creditData[UNCLASSIFIED_INDEX]),
      inProgress: 0,
      total: parseInt(creditData[UNCLASSIFIED_INDEX]),
    },
  };
};

const mapOuterUniversity = (data: any[]) => {
  const creditData = data[5];
  return {
    summerSession: {
      subjects: [],
      totalCredits: creditData[TOTAL_INDEX],
      universityName: '',
      semester: '',
    },
    studyAbroadProgram: {
      subjects: [],
      totalCredits: creditData[TOTAL_INDEX],
      universityName: '',
      semester: '',
    },
  };
};

export const parseCertificate = (file: File, methods: UseFormReturn<any, undefined>) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { result } = reader;
      const wb = read(result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = utils.sheet_to_json(ws);
      // console.log(data);
      initializeCertForm(methods, data);
    } catch (err) {
      throw new Error(err as string);
    } finally {
      reader.abort();
    }
  };
  reader.readAsBinaryString(file);
};

export const initializeCertForm = (method: UseFormReturn, parsed_data: any[]) => {
  const { setValue } = method;
  const USER = mapUserInfo(parsed_data);
  const B_C = mapBasicAndCommon(parsed_data);
  const M_R_F = mapMajorAndResearchAndFree(parsed_data);
  const NOC = mapNoCreditsRequired(parsed_data);
  const OU = mapOuterUniversity(parsed_data);
  // console.log(USER, B_C, M_R_F, NOC, OU);
  setValue('USER', USER);
  setValue('B_C', B_C);
  setValue('M_R_F', M_R_F);
  setValue('NOC', NOC);
  setValue('OU', OU);
  // console.log(method.getValues());
};

const checkSemesterWithDate = (cnt_month: number) => {
  return cnt_month >= 3 && cnt_month <= 8 ? '전반기' : '후반기';
};
