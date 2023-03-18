import { GradStatusType, SingleCategoryType } from '../types/grad';

class HTTPError extends Error {
  constructor(messages?: string) {
    super(messages);
    this.name = 'HTTP Error';
  }
}

export default async function postGradStatusFile(
  gradeStatusFile: File,
  majorType: string
): Promise<GradStatusType> {
  const BASE_URL = 'https://dev-api.gijol.im';
  const payload = new FormData();

  payload.append('majorType', majorType);
  payload.append('multipartFile', gradeStatusFile);

  const gradResultResponse = await fetch(`${BASE_URL}/graduation`, {
    method: 'POST',
    body: payload,
  })
    .then((res) => res.json())
    .then((data) => data);
  if (gradResultResponse.status === 405) {
    throw new HTTPError('지원하지 않는 학번입니다.');
  }
  if (gradResultResponse.status === 500) {
    throw new HTTPError('파일 입력 오류.');
  }
  return gradResultResponse;
}

export function getPercentage(status: SingleCategoryType) {
  const minCredit = status.minConditionCredits;
  const myCredit = status.totalCredits;
  const result = Math.round((myCredit * 100) / minCredit);
  if (result >= 100) {
    return 100;
  } else if (myCredit === 0) {
    return 0;
  } else {
    return result;
  }
}

export function getOverallStatus(status: GradStatusType) {
  const totalCredits = status.totalCredits;
  const percentage = Math.round((totalCredits * 100) / 130);
  const totalPercentage = percentage >= 100 ? 100 : percentage;

  const languageBasic = status.graduationCategory.languageBasic;
  const scienceBasic = status.graduationCategory.scienceBasic;
  const major = status.graduationCategory.major;
  const minor = status.graduationCategory.minor;
  const humanities = status.graduationCategory.humanities;
  const etcMandatory = status.graduationCategory.etcMandatory;
  const otherUncheckedClass = status.graduationCategory.otherUncheckedClass;
  const arr = [
    {
      title: '언어와 기초',
      percentage: getPercentage(languageBasic),
      satisfied: languageBasic.satisfied,
    },
    {
      title: '기초과학',
      percentage: getPercentage(scienceBasic),
      satisfied: scienceBasic.satisfied,
    },
    { title: '전공', percentage: getPercentage(major), satisfied: major.satisfied },
    { title: '부전공', percentage: getPercentage(minor), satisfied: minor.satisfied },
    { title: '인문사회', percentage: getPercentage(humanities), satisfied: humanities.satisfied },
    {
      title: '연구 및 기타',
      percentage: getPercentage(etcMandatory),
      satisfied: etcMandatory.satisfied,
    },
    {
      title: '자유학점',
      percentage: getPercentage(otherUncheckedClass),
      satisfied: otherUncheckedClass.satisfied,
    },
  ];
  let minDomainPercentage = getPercentage(languageBasic);
  let minDomain = '언어와 기초';
  arr.forEach((domain) => {
    if (domain.title === '부전공') {
      return;
    }
    if (domain.percentage <= minDomainPercentage) {
      minDomain = domain.title;
      minDomainPercentage = domain.percentage;
    }
  });
  return { totalCredits, totalPercentage, minDomain, minDomainPercentage, overall: arr };
}

export function getDomainColor(name: string) {
  switch (name) {
    case '언어와 기초':
      return 'green';
    case '기초과학':
      return 'blue';
    case '전공':
      return 'red';
    case '부전공':
      return 'orange';
    case '인문사회':
      return 'yellow';
    case '연구 및 기타':
      return 'grape';
    case '자유학점':
      return 'gray';
    default:
      return 'indigo';
  }
}
