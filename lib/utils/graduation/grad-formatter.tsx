import { GradStatusResponseType, SingleCategoryType } from '@lib/types/grad';

export function getPercentage(category?: SingleCategoryType): number {
  if (!category) return 0;
  const min = category.minConditionCredits ?? 1;
  const total = category.totalCredits;

  if (min <= 0) return 100;

  const pct = Math.round((total * 100) / min);
  return pct >= 100 ? 100 : pct;
}

export function extractOverallStatus(status: GradStatusResponseType | null | undefined) {
  if (!status) return undefined;

  const totalCredits = status?.totalCredits;
  const percentage = Math.round(((totalCredits as number) * 100) / 130);
  const totalPercentage = percentage >= 100 ? 100 : percentage;

  const languageBasic = status.graduationCategory.languageBasic;
  const scienceBasic = status.graduationCategory.scienceBasic;
  const major = status.graduationCategory.major;
  const minor = status.graduationCategory.minor;
  const humanities = status.graduationCategory.humanities;
  const etcMandatory = status.graduationCategory.etcMandatory;
  const otherUncheckedClass = status.graduationCategory.otherUncheckedClass;

  const categoriesArr = [
    { domain: '언어와 기초', status: languageBasic },
    { domain: '기초과학', status: scienceBasic },
    { domain: '전공', status: major },
    { domain: '부전공', status: minor },
    { domain: '인문사회', status: humanities },
    { domain: '연구 및 기타', status: etcMandatory },
    { domain: '자유학점', status: otherUncheckedClass },
  ];

  const domains = [
    {
      title: '언어와 기초',
      percentage: getPercentage(languageBasic),
      satisfied: languageBasic?.satisfied,
    },
    {
      title: '기초과학',
      percentage: getPercentage(scienceBasic),
      satisfied: scienceBasic?.satisfied,
    },
    { title: '전공', percentage: getPercentage(major), satisfied: major?.satisfied },
    { title: '부전공', percentage: getPercentage(minor), satisfied: minor?.satisfied },
    { title: '인문사회', percentage: getPercentage(humanities), satisfied: humanities?.satisfied },
    {
      title: '연구 및 기타',
      percentage: getPercentage(etcMandatory),
      satisfied: etcMandatory?.satisfied,
    },
    {
      title: '자유학점',
      percentage: getPercentage(otherUncheckedClass),
      satisfied: otherUncheckedClass?.satisfied,
    },
  ];

  let minDomainPercentage = getPercentage(languageBasic);
  let minDomain = '언어와 기초';

  domains.forEach((domain) => {
    if (domain.title === '부전공') return;

    if (domain.percentage <= minDomainPercentage) {
      minDomain = domain.title;
      minDomainPercentage = domain.percentage;
    }
  });
  return {
    categoriesArr,
    totalCredits,
    totalPercentage,
    minDomain,
    minDomainPercentage,
    domains,
  };
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

export function getFeedbackNumbers(status: GradStatusResponseType) {
  const l1 = status.graduationCategory.languageBasic.messages.length;
  const l2 = status.graduationCategory.scienceBasic.messages.length;
  const l3 = status.graduationCategory.humanities.messages.length;
  const l4 = status.graduationCategory.major.messages.length;
  const l5 = status.graduationCategory.minor.messages.length;
  const l6 = status.graduationCategory.etcMandatory.messages.length;
  const l7 = status.graduationCategory.otherUncheckedClass.messages.length;
  return l1 + l2 + l3 + l4 + l5 + l6 + l7;
}

export function createSpecificStatusMessage(satisfied: boolean, percentage: number, total: number, my: number) {
  if (satisfied) {
    return '전부 들으셨습니다!';
  } else {
    if (my > 0 && total - my <= 0) {
      return '학점은 채우셨지만 필수과목은 부족하네요..';
    } else if (my > 0 && total - my > 0) {
      return `${percentage}% 들으셨네요!`;
    } else {
      return '아직 수강하지 않으셨습니다';
    }
  }
}

const satisfaction = ['satisfied', 'unSatisfied', 'notRequired'] as const;
type Satisfaction = (typeof satisfaction)[number];
export function verifyStatus(status: boolean | undefined, title: string): Satisfaction {
  return !!status ? 'satisfied' : title === '부전공' ? 'notRequired' : 'unSatisfied';
}

function createStatusColor(verifiedStatus: Satisfaction): string {
  switch (verifiedStatus) {
    case 'satisfied':
      return 'green'; // green.5
    case 'unSatisfied':
      return 'red'; // red.5
    case 'notRequired':
      return 'blue'; // blue.5
    default:
      return 'gray'; // gray.5
  }
}
function createStatusMessage(verifiedStatus: Satisfaction): string {
  switch (verifiedStatus) {
    case 'satisfied':
      return '✅';
    case 'unSatisfied':
      return '❌';
    case 'notRequired':
      return '필수 아님';
    default:
      return '오류';
  }
}

export function getStatusColor(status: boolean | undefined, title: string) {
  return createStatusColor(verifyStatus(!!status, title));
}
export function getStatusMessage(status: boolean | undefined, title: string) {
  return createStatusMessage(verifyStatus(!!status, title));
}
