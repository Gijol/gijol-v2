interface CreditCommon {
  completed: number;
  inProgress: number;
  total: number;
}
//해외대학 공통 구조
export interface OuterUnivCommon {
  subjects: string[];
  totalCredits: string;
  universityName: string;
  semester: string;
}

export interface UserInfo {
  date: string;
  semester: string;
  affiliation: string;
  studentNumber: string;
  name: string;
  contact: string;
}

export interface BasicAndCommon {
  languageBasics: CreditCommon;
  humanitiesAndSocial: CreditCommon;
  software: CreditCommon;
  basicScience: CreditCommon;
  gistFreshman: CreditCommon;
  gistMajorExploration: CreditCommon;
}

// major & research & free
export interface MajorAndResearchAndFree {
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
export interface NoCreditsRequired {
  artPracticalSkills: CreditCommon;
  physicalEducationPracticalSkills: CreditCommon;
  gistCollegeColloquium: CreditCommon;
}

// outer university
export interface OuterUniversity {
  summerSession: OuterUnivCommon;
  studyAbroadProgram: OuterUnivCommon;
}

export interface ParsedCertJsonType {
  OU: OuterUniversity;
  user_info: UserInfo;
  B_C: BasicAndCommon;
  M_R_F: MajorAndResearchAndFree;
  NOC: NoCreditsRequired;
}
