import React, { useRef, useState, useMemo } from 'react';
import { Box, Button, Container, Group, Paper, Space, Stack, Text, Title } from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { useRouter } from 'next/router';

import Loading from '@components/loading';
import GradOverallStatus from '@components/grad-overall-status';
import GradSpecificDomainStatus from '@components/grad-specific-domain-status';
import GradRecommend from '@components/grad-recommend';

import {
  readFileAndParse,
  extractOverallStatus,
  getFeedbackNumbers,
} from '@utils/graduation/grad-formatter';
import type { UserStatusType } from '@lib/types/index';
import type {
  GradStatusRequestBody,
  GradStatusResponseType,
  TakenCourseType,
  SingleCategoryType,
} from '@lib/types/grad';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';

// 이미 만들어 둔 헬퍼들 (이전 local 페이지에서 쓰던 것들) — utils로 빼두는 걸 추천
export const STORAGE_KEY = 'gijol_grad_local_v1';

export const gradStatusFetchFn = async (payload: GradStatusRequestBody) => {
  const res = await fetch('/api/graduation/grad-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`grad-status ${res.status}: ${text}`);
  }
  return (await res.json()) as GradStatusResponseType;
};

export const inferEntryYear = (p: UserStatusType): number | null => {
  if ((p as any).entryYear) {
    const v = Number((p as any).entryYear);
    return Number.isFinite(v) && v > 1900 ? v : null;
  }
  if (p.studentId && String(p.studentId).length >= 4) {
    const year = Number(String(p.studentId).slice(0, 4));
    return Number.isFinite(year) && year > 1900 ? year : null;
  }
  return null;
};

export const toTakenCourses = (p: UserStatusType): TakenCourseType[] => {
  const list = (p as any).userTakenCourseList ?? [];
  return list.map((c: any) => ({
    year: Number(c.year) || 0,
    semester: c.semester || '',
    courseType: c.courseType || '기타',
    courseName: c.courseName || c.course || '',
    courseCode: c.courseCode || c.code || '',
    credit: Number(c.credit) || 0,
  }));
};

// gradStatus가 없을 때를 위한 임시 fallback
const convertParsedToGradStatus = (p: UserStatusType): GradStatusResponseType => {
  const taken = toTakenCourses(p);
  const totalCredits = taken.reduce((s, c) => s + (Number(c.credit) || 0), 0);

  const emptyCategory = (items: TakenCourseType[] = []): SingleCategoryType => ({
    messages: [],
    minConditionCredits: 1,
    satisfied: false,
    totalCredits: 0,
    userTakenCoursesList: { takenCourses: items },
  });

  const otherUnchecked = emptyCategory(taken);
  otherUnchecked.totalCredits = totalCredits;
  otherUnchecked.minConditionCredits = Math.max(totalCredits, 1);
  otherUnchecked.satisfied = true;

  return {
    graduationCategory: {
      languageBasic: emptyCategory(),
      scienceBasic: emptyCategory(),
      major: emptyCategory(),
      minor: emptyCategory(),
      humanities: emptyCategory(),
      etcMandatory: emptyCategory(),
      otherUncheckedClass: otherUnchecked,
    },
    totalCredits,
    totalSatisfied: false,
  };
};

type GradUploadPanelProps = {
  title?: string;
  redirectTo?: string; // 업로드 후 다른 페이지로 보내고 싶을 때 사용 (선택)
};

export function GradUploadPanel({ title = '졸업요건 파서', redirectTo }: GradUploadPanelProps) {
  const router = useRouter();
  const openRef = useRef<any>(null);

  const [file, setFile] = useState<FileWithPath | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isFetchingGradStatus, setIsFetchingGradStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { parsed, gradStatus, setFromParsed, reset } = useGraduationStore();

  // -------------------------
  // 파일 파싱 + API 호출
  // -------------------------
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

      // ✅ 전역 store에 저장 (API 결과 없으면 fallback 사용)
      setFromParsed({
        parsed: res,
        takenCourses: tc,
        gradStatus: grad ?? convertParsedToGradStatus(res),
      });

      // localStorage 저장
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
      } catch {
        // ignore
      }

      // 별도 redirect를 원하면 이동
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
  // -------------------------
  // 현재 parsed JSON 다운로드
  // -------------------------
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

  // -------------------------
  // 리셋
  // -------------------------
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

  // 1순위: store.gradStatus
  // 2순위: store.parsed 기반 fallback
  const gradStatusPreview: GradStatusResponseType | null = useMemo(
    () => gradStatus ?? (parsed ? convertParsedToGradStatus(parsed) : null),
    [gradStatus, parsed]
  );

  const overallProps = gradStatusPreview ? extractOverallStatus(gradStatusPreview) : null;
  const feedbackNumbers = gradStatusPreview ? getFeedbackNumbers(gradStatusPreview) : 0;

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
        <Button variant="default" onClick={handleReset}>
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

      {/* 졸업요건 미리보기 영역 */}
      {gradStatusPreview && overallProps ? (
        <>
          <Title order={3} mb="sm">
            졸업요건 충족 현황 (미리보기)
          </Title>

          <GradOverallStatus
            scrollIntoView={() => {}}
            totalCredits={overallProps.totalCredits}
            totalPercentage={overallProps.totalPercentage}
            overallStatus={overallProps.domains}
            minDomain={overallProps.minDomain}
            minDomainPercentage={overallProps.minDomainPercentage}
            feedbackNumbers={feedbackNumbers}
          />

          <Space h={32} />

          <Title order={3} mb="sm">
            영역별 세부 현황
          </Title>
          <GradSpecificDomainStatus specificDomainStatusArr={overallProps.categoriesArr} />

          <Space h={24} />

          <Title order={3} mt={32} mb="lg">
            영역별 피드백
          </Title>
          <GradRecommend specificDomainStatusArr={overallProps.categoriesArr} />
        </>
      ) : (
        <Box mt="md">
          <Text c="dimmed">
            아직 파싱된 데이터가 없습니다. 엑셀 파일을 업로드하고 &quot;파싱 및 졸업요건
            계산&quot;을 눌러 주세요.
          </Text>
        </Box>
      )}
    </Container>
  );
}
