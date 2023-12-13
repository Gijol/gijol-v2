export type TextInputProps = {
  value: string;
  label: string;
  placeholder: string;
};

export const section_titles = [
  '신청자 정보',
  '기초 및 교양 학점',
  '전공 | 연구 | 자유선택 학점',
  '무학점 필수',
  '해외대학 학점',
] as const;

export type SectionTitleType = typeof section_titles[number];

export const sections: Array<{
  title: string;
  section_label: SectionTitleType;
  inputs: Array<TextInputProps>;
}> = [
  {
    title: 'user_info',
    section_label: '신청자 정보',
    inputs: [
      { value: 'year', label: '연도', placeholder: '제출 연도를 입력하세요' },
      { value: 'semester', label: '전/후반기', placeholder: '전/후반기 여부를 입력하세요' },
      { value: 'month', label: '신청 월', placeholder: '신청 월을 입력하세요' },
      { value: 'affiliation', label: '소속', placeholder: '소속을 입력하세요' },
      { value: 'studentNumber', label: '학번', placeholder: '학번을 입력하세요' },
      { value: 'name', label: '성명', placeholder: '성명을 입력하세요' },
      { value: 'contact', label: '연락처', placeholder: '연락처를 입력하세요' },
    ],
  },
  {
    title: 'user_b&c_credits',
    section_label: '기초 및 교양 학점',
    inputs: [
      {
        value: 'languageBasics',
        label: '언어의 기초',
        placeholder: '언어의 기초 학점을 입력하세요',
      },
      {
        value: 'humanitiesAndSocial',
        label: '인문사회',
        placeholder: '인문사회 학점을 입력하세요',
      },
      { value: 'software', label: '소프트웨어', placeholder: '소프트웨어 학점을 입력하세요' },
      { value: 'basicScience', label: '기초과학', placeholder: '기초과학 학점을 입력하세요' },
      { value: 'gistFreshman', label: 'GIST 새내기', placeholder: 'GIST 새내기 학점을 입력하세요' },
      {
        value: 'gistMajorExploration',
        label: 'GIST 전공탐색',
        placeholder: 'GIST 전공탐색 학점을 입력하세요',
      },
    ],
  },
  {
    title: 'mrf_credits',
    section_label: '전공 | 연구 | 자유선택 학점',
    inputs: [
      { value: 'majorRequired', label: '전공필수', placeholder: '전공필수 학점을 입력하세요' },
      { value: 'majorElective', label: '전공선택', placeholder: '전공선택 학점을 입력하세요' },
      {
        value: 'thesisResearch',
        label: '학사논문연구',
        placeholder: '학사논문연구 학점을 입력하세요',
      },
      {
        value: 'universityCommonSubjects',
        label: '대학 공통 교과목',
        placeholder: '대학 공통 교과목 학점을 입력하세요',
      },
      {
        value: 'humanitiesAndSocial',
        label: '인문사회',
        placeholder: '인문사회 학점을 입력하세요',
      },
      {
        value: 'languageSelectionSoftware',
        label: '언어선택/소프트웨어',
        placeholder: '언어선택/소프트웨어 학점을 입력하세요',
      },
      {
        value: 'basicScienceSelection',
        label: '기초과학선택',
        placeholder: '기초과학선택 학점을 입력하세요',
      },
      { value: 'otherMajor', label: '타전공', placeholder: '타전공 학점을 입력하세요' },
      {
        value: 'graduateSchoolSubjects',
        label: '대학원 교과목',
        placeholder: '대학원 교과목 학점을 입력하세요',
      },
    ],
  },
  {
    title: 'no_credit_required',
    section_label: '무학점 필수',
    inputs: [
      { value: 'artPracticalSkills', label: '예능실기', placeholder: '예능실기 학점을 입력하세요' },
      {
        value: 'physicalEducationPracticalSkills',
        label: '체육실기',
        placeholder: '체육실기 학점을 입력하세요',
      },
      {
        value: 'gistCollegeColloquium',
        label: 'GIST대학 콜로퀴움',
        placeholder: 'GIST대학 콜로퀴움 학점을 입력하세요',
      },
    ],
  },
  {
    title: 'overseas_university_credits',
    section_label: '해외대학 학점',
    inputs: [
      {
        value: 'summerSemesterSubjectsAndCredits',
        label: '해외대학 여름학기 파견 이수 인정 교과목 및 학점',
        placeholder: '해외대학 여름학기 파견 이수 인정 교과목 및 학점을 입력하세요',
      },
      {
        value: 'dispatchUniversityName',
        label: '파견 대학명',
        placeholder: '파견 대학명을 입력하세요',
      },
      { value: 'overseasSubjectName', label: '교과목 명', placeholder: '교과목 명을 입력하세요' },
      {
        value: 'overseasDispatchSemester',
        label: '파견학기',
        placeholder: '파견학기를 입력하세요',
      },
      {
        value: 'studyAbroadProgramSubjectsAndCredits',
        label: 'Study Abroad Program 이수 교과목 및 학점',
        placeholder: 'Study Abroad Program 이수 교과목 및 학점을 입력하세요',
      },
      {
        value: 'studyAbroadDispatchUniversityName',
        label: '파견 대학명',
        placeholder: '파견 대학명을 입력하세요',
      },
      {
        value: 'studyAbroadSubjectName',
        label: '교과목 명',
        placeholder: '교과목 명을 입력하세요',
      },
      {
        value: 'studyAbroadDispatchSemester',
        label: '파견학기',
        placeholder: '파견학기를 입력하세요',
      },
    ],
  },
];
