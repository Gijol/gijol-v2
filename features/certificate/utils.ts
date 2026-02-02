import { CertificateFormValues, CreditValue } from './schema';

const getDefaultCreditValues = (): CreditValue => ({
  completed: 0,
  inProgress: 0,
  total: 0,
});

export const getDefaultFormValues = (): CertificateFormValues => ({
  USER: {
    date: '',
    semester: '전반기', // Default to avoid validation error? Or undefined to force selection. Schema requires enum.
    affiliation: '',
    studentNumber: '',
    name: '',
    contact: '',
    majorDetails: '',
    minorMajor: '',
    doubleMajor: '',
    intensiveMajor: '',
  },
  B_C: {
    languageBasics: getDefaultCreditValues(),
    humanitiesAndSocial: getDefaultCreditValues(),
    software: getDefaultCreditValues(),
    basicScience: getDefaultCreditValues(),
    gistFreshman: getDefaultCreditValues(),
    gistMajorExploration: getDefaultCreditValues(),
    freshmanSeminar: getDefaultCreditValues(),
  },
  M_R_F: {
    majorRequired: getDefaultCreditValues(),
    majorElective: getDefaultCreditValues(),
    thesisResearch: getDefaultCreditValues(),
    universityCommonSubjects: getDefaultCreditValues(),
    humanitiesAndSocial: getDefaultCreditValues(),
    languageSelectionSoftware: getDefaultCreditValues(),
    basicScienceSelection: getDefaultCreditValues(),
    otherMajor: getDefaultCreditValues(),
    graduateSchoolSubjects: getDefaultCreditValues(),
  },
  NC: {
    arts: getDefaultCreditValues(),
    sports: getDefaultCreditValues(),
    colloquium: getDefaultCreditValues(),
  },
  OU: {
    summerSession: {
      credits: undefined,
      university: '',
      subjects: [],
      semester: '',
    },
    studyAbroad: {
      credits: undefined,
      university: '',
      subjects: [],
      semester: '',
    },
  },
});
