export const MAP_2021 = {
  // 1. 단순 텍스트 매핑 (Cell Address)
  basicInfo: {
    major: 'C4', // 소속
    studentId: 'C6', // 학번
    name: 'C7', // 성명
    contact: 'C8', // 연락처
  },

  // 2. 날짜/학기 치환 대상 셀
  dateFields: {
    title: 'B2', // "20XX년 X반기(X월) 졸업신청 및 졸업 이수요건 확인서" 포맷 / 졸업학기 연도, 전반기/후반기, 월 입력 필요
  },

  // 3. 복합 문자열 (포맷팅 필요)
  composites: {
    majorDetails: 'C5', // 부전공/복수전공/심화전공 - input 필드 필요
    summerSession: 'B34', // 해외대학 여름학기 - 학점 / 파견대학 명 / 교과목 명 / 파견학기 input 필드 필요
    studyAbroad: 'B35', // SAP - 학점 / 파견대학 명 / 교과목 명 / 파견학기 input 필드 필요
  },

  // 4. 학점 매핑 (done: 이수완료/E열, plan: 이수가능/F열)
  credits: {
    basic_languageBasic: { done: 'E12', plan: 'F12', total: 'G12' },
    basic_humanities: { done: 'E13', plan: 'F13', total: 'G13' },
    basic_software: { done: 'E14', plan: 'F14', total: 'G14' }, // 컴퓨터 프로그래밍 이수자는 면제
    basic_basicScience: { done: 'E15', plan: 'F15', total: 'G15' },
    basic_gistFreshmanSeminar: { done: 'E16', plan: 'F16', total: 'G16' }, // 신입생세미나 - 1학년 1학기 의무수강
    basic_total: { done: 'E17', plan: 'F17', total: 'G17' }, // basic total
    major_required: { done: 'E18', plan: 'F18', total: 'G18' },
    major_elective: { done: 'E19', plan: 'F19', total: 'G19' },
    research: { done: 'E20', plan: 'F20', total: 'G20' },
    free_universityCommon: { done: 'E21', plan: 'F21', total: 'G21' },
    free_humanities: { done: 'E22', plan: 'F22', total: 'G22' },
    free_langSw: { done: 'E23', plan: 'F23', total: 'G23' },
    free_basicScience: { done: 'E24', plan: 'F24', total: 'G24' },
    free_otherMajor: { done: 'E25', plan: 'F25', total: 'G25' },
    free_graduateCourse: { done: 'E26', plan: 'F26', total: 'G26' },
    major_research_free_total: { done: 'E27', plan: 'F27', total: 'G27' },
    total_required: { done: 'E28', plan: 'F28', total: 'G28' },
  },

  // 5. 무학점 필수 과목 매핑
  noCreditButRequired: {
    arts: { done: 'E29', plan: 'F29', total: 'G29' },
    sports: { done: 'E30', plan: 'F30', total: 'G30' },
    colloquium: { done: 'E31', plan: 'F31', total: 'G31' },
  },

  // 6. 시그니처 매핑
  signature: {
    applicant: 'B42', // 신청자 (인) 형태 / XXXX. XX. XX 형태 날짜 입력 필요 / 줄바꿈 있음 / 중앙 배열
  },
};
