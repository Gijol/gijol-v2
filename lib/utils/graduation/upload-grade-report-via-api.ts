import { notifications } from '@mantine/notifications';
import type { UserStatusType } from '@lib/types/index';

type UploadErrorResponse = {
  error: string;
  message?: string;
  details?: string;
};

const UPLOAD_TIMEOUT_MS = 15_000; // 15초 (원하는 값으로 조정)

export async function uploadGradeReportViaApi(file: File): Promise<UserStatusType> {
  const controller = new AbortController();
  const timeoutId =
    typeof window !== 'undefined'
      ? window.setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS)
      : null;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/graduation/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (timeoutId !== null) window.clearTimeout(timeoutId);

    if (!res.ok) {
      let errBody: UploadErrorResponse | undefined;
      try {
        errBody = (await res.json()) as UploadErrorResponse;
      } catch {
        // ignore
      }

      const code = errBody?.error || 'UNKNOWN_ERROR';

      if (code === 'INVALID_GRADE_REPORT') {
        notifications.show({
          color: 'red',
          title: '성적표 형식 오류',
          message:
            '업로드하신 파일이 GIST 제우스 성적표 양식과 다릅니다.\n' +
            '제우스 → 성적 → 개인성적조회 → 우측 상단 "Report card(KOR)" 버튼으로 받은 원본 엑셀 파일을 다시 업로드해주세요.',
        });
      } else if (code === 'PARSE_TIMEOUT') {
        notifications.show({
          color: 'red',
          title: '파싱 시간 초과',
          message:
            '성적표를 파싱하는 데 시간이 너무 오래 걸립니다.\n' +
            '파일이 손상되었거나 Report card(KOR) 양식이 아닐 수 있습니다. 다시 확인해주세요.',
        });
      } else if (code === 'NO_FILE') {
        notifications.show({
          color: 'red',
          title: '파일 없음',
          message: '업로드된 파일이 없습니다. 다시 시도해주세요.',
        });
      } else {
        notifications.show({
          color: 'red',
          title: '업로드/파싱 오류',
          message:
            errBody?.message ||
            '성적표 파일을 처리하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
      }

      throw new Error(code);
    }

    const json = (await res.json()) as UserStatusType;
    return json;
  } catch (e: any) {
    if (timeoutId !== null) window.clearTimeout(timeoutId);

    // fetch 타임아웃 (AbortController)
    if (e?.name === 'AbortError') {
      console.error('[uploadGradeReportViaApi] fetch aborted by timeout');
      notifications.show({
        color: 'red',
        title: '요청 시간 초과',
        message:
          '성적표 업로드/파싱 요청이 너무 오래 걸립니다.\n' +
          '네트워크 상태를 확인하거나, 잠시 후 다시 시도해주세요.',
      });
      throw new Error('UPLOAD_REQUEST_TIMEOUT');
    }

    console.error('[uploadGradeReportViaApi] unexpected error', e);

    // 여기서도 generic fallback 알림
    notifications.show({
      color: 'red',
      title: '업로드 실패',
      message: '성적표 업로드 도중 오류가 발생했습니다. 다시 시도해주세요.',
    });

    throw e;
  }
}
