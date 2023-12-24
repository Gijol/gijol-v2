import { read, utils } from 'xlsx';

interface StudentInfo {
  date: string; // 신청 기간
  semester: string; // 전/후반기
  affiliation: string; // 소속
  studentNumber: string; // 학번
  name: string; // 성명
  contact: string; // 연락처
}

interface Credits {
  languageBasics: number;
  humanitiesAndSocial: number;
  software: number;
  basicScience: number;
  gistFreshman: number;
  majorRequired: number;
  majorElective: number;
  thesisResearch: number;
  universityCommonSubjects: number;
  humanitiesAndSocial_Free: number;
  languageSelectionSoftware: number;
  basicScienceSelection: number;
  otherMajor: number;
  graduateSchoolSubjects: number;
  unclassified: number;
  total: number;
}

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

function parseStudentData(data: any[]): { studentInfo: StudentInfo; credits: Credits } {
  const creditData = data[5];

  const studentInfo: StudentInfo = {
    date: '2023.01', // 예시 값
    semester: '전반기', // 예시 값
    affiliation: data[0]['__EMPTY_11'],
    studentNumber: data[1]['__EMPTY_3'],
    name: data[1]['__EMPTY_11'],
    contact: '', // 정보 없음
  };

  const credits: Credits = {
    languageBasics: parseInt(creditData[LB_INDEX]),
    humanitiesAndSocial: parseInt(creditData[HAS_INDEX]),
    software: parseInt(creditData[SW_INDEX]),
    basicScience: parseInt(creditData[BS_INDEX]),
    gistFreshman: parseInt(creditData[GF_INDEX]),
    majorRequired: parseInt(creditData[MR_INDEX]),
    majorElective: parseInt(creditData[ME_INDEX]),
    thesisResearch: parseInt(creditData[TR_INDEX]),
    universityCommonSubjects: parseInt(creditData[UCS_INDEX]),
    humanitiesAndSocial_Free: parseInt(creditData[HAS_INDEX_2]),
    languageSelectionSoftware: parseInt(creditData[LSS_INDEX]),
    basicScienceSelection: parseInt(creditData[BSS_INDEX]),
    otherMajor: parseInt(creditData[OM_INDEX]),
    graduateSchoolSubjects: parseInt(creditData[GSS_INDEX]),
    unclassified: parseInt(creditData[UNCLASSIFIED_INDEX]),
    total: parseInt(data[4][TOTAL_INDEX]),
  };

  return { studentInfo, credits };
}

// 사용 예시

export const parseCertificate = (file: File) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { result } = reader;
      const wb = read(result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = utils.sheet_to_json(ws);
      console.log(data);
      console.log(parseStudentData(data));
    } catch (err) {
      console.log(err);
    }
  };
  reader.readAsBinaryString(file);
};
