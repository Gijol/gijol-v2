import { GradeReportParser } from '../parser/grade/gradeReportParser';
import { GradStatusResponseType, SingleCategoryType } from '@lib/types/grad';
import { UserStatusType } from '../../types';
import { notifications } from '@mantine/notifications';

// 정말 간단한 최소 검증 예시 — 필요하면 더 강화하면 됨
function isValidUserStatus(parsed: any): parsed is UserStatusType {
  if (!parsed || typeof parsed !== 'object') return false;

  // 학번
  if (!parsed.studentId) return false;

  // 수강 내역 배열
  if (!Array.isArray(parsed.userTakenCourseList)) return false;
  if (parsed.userTakenCourseList.length === 0) return false;

  // 최소한 첫 번째 row에 year/semester/credit 정도는 있어야 한다고 가정
  const first = parsed.userTakenCourseList[0];
  return !(!('year' in first) || !('semester' in first) || !('credit' in first));
}

export async function readFileAndParse(file: File): Promise<UserStatusType> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    // ✅ FileReader read timeout (예: 8초)
    const READ_TIMEOUT_MS = 8000;
    const readTimeoutId = window.setTimeout(() => {
      try {
        fileReader.abort();
      } catch {}
      const err = new Error('FILE_READ_TIMEOUT');
      console.error('[readFileAndParse] timeout:', err);
      notifications.show({
        color: 'red',
        title: '파일 읽기 시간 초과',
        message:
          '파일을 읽는 데 너무 오래 걸립니다. 올바른 Report card(KOR) 파일인지 확인해주세요.',
      });
      reject(err);
    }, READ_TIMEOUT_MS);

    fileReader.onload = () => {
      console.log('[readFileAndParse] FileReader onload fired');
      try {
        const { result } = fileReader;
        if (!result) {
          throw new Error('EMPTY_FILE_RESULT');
        }

        // 🔹 원래 쓰던 파서 호출
        const parsed = GradeReportParser.readXlsxFile(result as string);

        // 🔹 여기서 "이게 진짜 성적표인가?" 검증
        if (!isValidUserStatus(parsed)) {
          throw new Error('INVALID_GRADE_REPORT');
        }

        resolve(parsed);
      } catch (err) {
        console.error('[readFileAndParse] parse/validation error:', err);

        notifications.show({
          color: 'red',
          title: '파일 파싱 오류',
          message:
            '업로드하신 파일이 GIST 제우스 성적표 양식과 다릅니다.\n' +
            '제우스 → 성적 → 개인성적조회 → 우측 상단 "Report card(KOR)" 버튼으로 받은 원본 엑셀 파일을 다시 업로드해주세요.',
          withCloseButton: true,
        });
        reject(err);
      }
    };

    fileReader.onerror = (e) => {
      console.error('[readFileAndParse] FileReader onerror:', e);
      notifications.show({
        color: 'red',
        title: '파일 읽기 오류',
        message: '파일을 읽는 도중 문제가 발생했습니다. 다시 시도해주세요.',
        withCloseButton: true,
      });
      reject(fileReader.error ?? new Error('FILE_READ_ERROR'));
    };
    try {
      fileReader.readAsBinaryString(file);
    } catch (e) {
      console.error('[readFileAndParse] readAsBinaryString threw:', e);
      reject(e);
    }
  });
}

export function getPercentage(category?: SingleCategoryType): number {
  if (!category) return 0;
  const min = category.minConditionCredits ?? 1;
  const total = category.totalCredits;

  if (min <= 0) return 100;

  const pct = Math.round((total * 100) / min);
  return pct >= 100 ? 100 : pct;
}

export function extractOverallStatus(status: GradStatusResponseType | undefined) {
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

export function createSpecificStatusMessage(
  satisfied: boolean,
  percentage: number,
  total: number,
  my: number
) {
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
type Satisfaction = typeof satisfaction[number];
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
