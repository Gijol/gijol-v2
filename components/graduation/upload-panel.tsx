// components/graduation/GradUploadPanel.tsx
import React, { useRef, useState } from 'react';
import { Box, Button, Container, Group, Space, Stack, Text, Title } from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { useRouter } from 'next/router';

import Loading from '@components/loading';
import { readFileAndParse } from '@utils/graduation/grad-formatter';
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
import { STORAGE_KEY } from '../../lib/stores/storage-key';

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
      const res = (await readFileAndParse(file as File)) as UserStatusType;

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

      setFromParsed({
        parsed: res,
        takenCourses: tc,
        gradStatus: grad ?? null,
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
      } catch {
        // ignore
      }

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || String(e));
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
      localStorage.removeItem(STORAGE_KEY);
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

      {/* ⬇️ 이 아래는 “슬롯” – 밖에서 원하는 UI를 넣을 수 있음 */}
      {children && <Box mt="md">{children({ parsed, gradStatus })}</Box>}
    </Container>
  );
}
