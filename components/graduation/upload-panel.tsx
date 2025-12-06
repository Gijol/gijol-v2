// components/graduation/GradUploadPanel.tsx
import React, { useRef, useState } from 'react';
import { Box, Button, Container, Group, Space, Text, Title } from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { useRouter } from 'next/router';

import Loading from '@components/loading';
import type { UserStatusType } from '@lib/types/index';
import type {
  GradStatusRequestBody,
  GradStatusResponseType,
  TakenCourseType,
} from '@lib/types/grad';
import {
  gradStatusFetchFn,
  inferEntryYear,
  toTakenCourses,
} from '@utils/graduation/grad-status-helper';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';
import { PARSED_EDITABLE_STATE_KEY } from '../../lib/stores/storage-key';
import { uploadGradeReportViaApi } from '@utils/graduation/upload-grade-report-via-api';

type GradUploadPanelProps = {
  title?: string;
  redirectTo?: string; // 업로드 후 이동하고 싶을 때 (선택)
  /**
   * 업로드/파싱 이후, 아래쪽에 보여줄 커스텀 UI (표, 미리보기 등)
   * parsed, gradStatus는 store에서 읽어서 내려줌
   */
  children?: (ctx: {
    parsed: UserStatusType | null;
    gradStatus: GradStatusResponseType | null;
  }) => React.ReactNode;
};

export function GradUploadPanel({
  title = '졸업요건 파서',
  redirectTo,
  children,
}: GradUploadPanelProps) {
  const router = useRouter();
  const openRef = useRef<any>(null);

  const [file, setFile] = useState<FileWithPath | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isFetchingGradStatus, setIsFetchingGradStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { parsed, gradStatus, setFromParsed, reset } = useGraduationStore();

  // 파일 파싱 + 졸업요건 API 호출 + store 저장
  const handleParse = async () => {
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      // ✅ 1) 서버(API Route)를 통해 업로드 + 파싱
      const res = (await uploadGradeReportViaApi(file as File)) as UserStatusType;

      // ✅ 2) takenCourses, entryYear, major 추출
      const tc: TakenCourseType[] = toTakenCourses(res);
      const entryYear = inferEntryYear(res);
      const userMajor = (res as any).major || (res as any).department || undefined;

      if (!entryYear) {
        setError(
          '학번(입학년도)을 파싱할 수 없습니다. studentId 또는 entryYear 정보를 확인해주세요.'
        );
      }

      const payload: GradStatusRequestBody = {
        entryYear: entryYear ?? new Date().getFullYear(),
        takenCourses: tc,
        userMajor,
        userMinors: [],
      };

      // ✅ 3) 졸업요건 계산 API 호출
      setIsFetchingGradStatus(true);
      let grad: GradStatusResponseType | null = null;

      try {
        grad = await gradStatusFetchFn(payload);
      } catch (e: any) {
        console.error('grad status fetch error', e);
        setError(e?.message || String(e));
      } finally {
        setIsFetchingGradStatus(false);
      }

      // ✅ 4) store 업데이트
      setFromParsed({
        parsed: res,
        takenCourses: tc,
        gradStatus: grad ?? null,
        userMajor: ''
      });

      // ✅ 5) localStorage 저장
      try {
        localStorage.setItem(PARSED_EDITABLE_STATE_KEY, JSON.stringify(res));
      } catch {
        // ignore
      }

      // ✅ 6) redirect 옵션
      if (redirectTo) {
        await router.push(redirectTo);
      }
    } catch (e: any) {
      console.error('handleParse error:', e);

      // uploadGradeReportViaApi에서 이미 notifications를 띄우지만,
      // 패널 레벨에서도 사용자에게 한 줄 에러를 보여주고 싶으면 아래처럼 처리
      if (e instanceof Error) {
        if (e.message === 'INVALID_GRADE_REPORT') {
          setError(
            'GIST 제우스 성적표 양식이 아닌 파일입니다.\n' +
              '제우스 → 성적 → 개인성적조회 → "Report card(KOR)" 엑셀 파일을 다시 업로드해주세요.'
          );
        } else if (e.message === 'UPLOAD_REQUEST_TIMEOUT') {
          setError(
            '업로드/파싱 요청 시간이 초과되었습니다. 파일이 제우스 성적표 양식이 맞는지 확인하시고, 네트워크 상태를 점검한 후 다시 시도해주세요.'
          );
        } else {
          setError('파일을 처리하는 도중 예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('파일을 처리하는 도중 오류가 발생했습니다. 다시 시도해주세요.');
      }

      // ❗ 에러 시 Dropzone 파일 초기화 → “다시 업로드” 유도
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const onDownload = () => {
    if (!parsed) return setError('다운로드할 데이터가 없습니다.');
    const blob = new Blob([JSON.stringify(parsed, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gijol_parsed_grad.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setError(null);
    setFile(null);
    reset();
    try {
      localStorage.removeItem(PARSED_EDITABLE_STATE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <Container size="lg">
      <Title order={2} my={20}>
        {title}
      </Title>

      {/* 업로드 / 파싱 영역 */}
      <Dropzone
        openRef={openRef}
        onDrop={(files) => setFile(files?.[0] ?? null)}
        activateOnClick={false}
        accept={[MIME_TYPES.xls, MIME_TYPES.xlsx]}
        h={140}
      >
        <Group position="center" style={{ height: '100%' }}>
          {!file ? (
            <Text c="dimmed">여기에 엑셀 파일을 드롭하거나 파일 선택 버튼으로 올려주세요.</Text>
          ) : (
            <Text>{file.name || file.path}</Text>
          )}
        </Group>
      </Dropzone>

      <Group mt="md">
        <Button onClick={() => openRef.current?.()} variant="outline">
          파일 선택
        </Button>
        <Button onClick={handleParse} disabled={!file || isParsing} color="blue">
          파싱 및 졸업요건 계산
        </Button>
        <Button onClick={onDownload} disabled={!parsed} variant="default">
          JSON 다운로드
        </Button>
        <Button variant="default" onClick={handleReset} color="gray">
          리셋
        </Button>
      </Group>

      {isParsing && <Loading content="파싱 중입니다..." />}

      {isFetchingGradStatus && (
        <Box mt="sm">
          <Text c="dimmed">졸업요건 계산 중입니다...</Text>
        </Box>
      )}

      {error && (
        <Box mt="md">
          <Text c="red">에러: {error}</Text>
        </Box>
      )}

      <Space h={24} />

      {children && <Box mt="md">{children({ parsed, gradStatus })}</Box>}
    </Container>
  );
}
