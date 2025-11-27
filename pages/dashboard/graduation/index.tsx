import React, { useRef, useState } from 'react';
import {
  Container,
  Space,
  Title,
  Group,
  Button,
  Text,
  Box,
  Table,
  ScrollArea,
} from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';

import Loading from '@components/loading';

import {
  readFileAndParse,
  extractOverallStatus,
  getFeedbackNumbers,
} from '@utils/graduation/grad-formatter';
import type { UserStatusType } from '@lib/types/index';
import GradOverallStatus from '@components/grad-overall-status';
import GradSpecificDomainStatus from '@components/grad-specific-domain-status';
import GradRecommend from '@components/grad-recommend';
import type {
  GradStatusResponseType,
  GradStatusRequestBody,
  SingleCategoryType,
  TakenCourseType,
} from '@lib/types/grad';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';

export const STORAGE_KEY = 'gijol_grad_local_v1';

export const gradStatusFetchFn = async (payload: GradStatusRequestBody) => {
  try {
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
  } catch (error) {
    console.error('grad-status api error:', error);
    throw error;
  }
};

// 헬퍼: UserStatusType에서 입학년도 추정
export const inferEntryYear = (p: UserStatusType): number | null => {
  // 1) 타입에 entryYear가 직접 들어있다면 사용
  if ((p as any).entryYear) {
    const v = Number((p as any).entryYear);
    return Number.isFinite(v) && v > 1900 ? v : null;
  }
  // 2) studentId의 앞 4자리를 학번으로 사용 (예: 2021****)
  if (p.studentId && String(p.studentId).length >= 4) {
    const year = Number(String(p.studentId).slice(0, 4));
    return Number.isFinite(year) && year > 1900 ? year : null;
  }
  return null;
};

// -------------------------
// 헬퍼: UserStatusType -> TakenCourseType[]
// TODO: 여러 포맷 대응 목적으로 두긴 좋은데, 좀 더 깔끔한 방법 고민 필요
// -------------------------
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

export default function Index() {
  const openRef = useRef<any>(null);

  const [file, setFile] = useState<FileWithPath | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingGradStatus, setIsFetchingGradStatus] = useState(false);

  const {
    parsed,
    takenCourses: storeTakenCourses,
    gradStatus,
    setFromParsed,
    reset,
  } = useGraduationStore();

  // -------------------------
  // 로컬 프리뷰용: Parsed -> GradStatusResponseType (fallback)
  // -------------------------
  const convertParsedToGradStatus = (p: UserStatusType): GradStatusResponseType => {
    const taken = toTakenCourses(p);
    const totalCredits = taken.reduce((s, c) => s + (Number(c.credit) || 0), 0);

    const emptyCategory = (items: TakenCourseType[] = []): SingleCategoryType => ({
      messages: [],
      minConditionCredits: 1, // 0이면 퍼센트 계산 분모 문제를 피하기 위해 1로 설정
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

  // -------------------------
  // 파일 파싱 + API 호출
  // -------------------------
  const onParse = async () => {
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      const res = (await readFileAndParse(file as File)) as UserStatusType;

      const tc = toTakenCourses(res);
      const entryYear = inferEntryYear(res);
      const userMajor = (res as any).major || (res as any).department || undefined;

      if (!entryYear) {
        setError(
          '학번(입학년도)을 파싱할 수 없습니다. studentId 또는 entryYear 정보를 확인해주세요.'
        );
      }

      const payload: GradStatusRequestBody = {
        entryYear: entryYear ?? new Date().getFullYear(), // fallback: 현재 연도
        takenCourses: tc,
        userMajor,
        userMinors: [], // 추후 부전공 정보가 생기면 채우기
      };

      setIsFetchingGradStatus(true);
      let grad: GradStatusResponseType | null = null;

      try {
        grad = await gradStatusFetchFn(payload);
        console.log('grad-status api response:', grad);
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

      // auto-save into localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
      } catch {
        // ignore storage errors
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || String(e));
    } finally {
      setIsParsing(false);
    }
  };

  // -------------------------
  // 로컬 저장된 raw JSON 불러오기 + store 채우기
  // -------------------------
  const onLoadFromStorage = async () => {
    setError(null);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return setError('로컬 저장된 데이터가 없습니다.');

      const obj = JSON.parse(raw) as UserStatusType;

      const tc = toTakenCourses(obj);
      const entryYear = inferEntryYear(obj);
      const userMajor = (obj as any).major || (obj as any).department || undefined;

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
        console.log('grad-status api response:', grad);
      } catch (e: any) {
        console.error('grad status fetch error', e);
        setError(e?.message || String(e));
      } finally {
        setIsFetchingGradStatus(false);
      }

      setFromParsed({
        parsed: obj,
        takenCourses: tc,
        gradStatus: grad ?? convertParsedToGradStatus(obj),
      });
    } catch (e: any) {
      setError(e?.message || String(e));
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
  const onClear = () => {
    setError(null);
    setFile(null);
    reset(); // ✅ store 초기화
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const effectiveParsed = parsed as UserStatusType | null;

  // 1순위: store.gradStatus
  // 2순위: store.parsed 기반 fallback
  const gradStatusPreview: GradStatusResponseType | null =
    gradStatus ?? (parsed ? convertParsedToGradStatus(parsed) : null);

  const overallProps = gradStatusPreview ? extractOverallStatus(gradStatusPreview) : null;
  const feedbackNumbers = gradStatusPreview ? getFeedbackNumbers(gradStatusPreview) : 0;

  return (
    <Container size="lg">
      <Title order={2} my={20}>
        졸업요건 파서 — 로컬 전용 (로그인 불필요)
      </Title>

      <Space h={8} />

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
        <Button onClick={onParse} disabled={!file || isParsing} color="blue">
          로컬에서 파싱
        </Button>
        <Button onClick={onLoadFromStorage} variant="default">
          로컬 불러오기
        </Button>
        <Button onClick={onDownload} disabled={!parsed} color="teal">
          JSON 다운로드
        </Button>
        <Button onClick={onClear} color="gray">
          리셋
        </Button>
      </Group>

      {isParsing && <Loading content="파싱 중입니다... 잠시만 기다려주세요." />}

      {error && (
        <Box mt="md">
          <Text c="red">에러: {error}</Text>
        </Box>
      )}

      <Space h={20} />

      {/* 변환된 미리보기 컴포넌트들 */}
      {gradStatusPreview && overallProps ? (
        <>
          <Title order={3} mb="sm">
            파싱 결과 — 미리보기
          </Title>

          {isFetchingGradStatus && (
            <Box my="sm">
              <Text c="dimmed">분류 서버에서 응답을 기다리는 중...</Text>
            </Box>
          )}

          {/* grad-status API 원시 결과 (디버깅 + 요약 테이블) */}
          {gradStatus && (
            <Box my="md" p="md" style={{ background: '#f8f9fa', borderRadius: 8 }}>
              <Group position="apart">
                <Text fw={600}>분류 결과 (원시)</Text>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => console.log('gradStatusFromApi', gradStatus)}
                >
                  콘솔 출력
                </Button>
              </Group>

              <Box mt="sm" style={{ maxHeight: 240, overflow: 'auto', padding: 8 }}>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'keep-all',
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(gradStatus, null, 2)}
                </pre>
              </Box>

              <Box mt="sm">
                <Text fw={600} size="sm">
                  카테고리 요약
                </Text>
                <Table striped>
                  <thead>
                    <tr>
                      <th>영역</th>
                      <th>총 학점</th>
                      <th>충족 여부</th>
                      <th>과목 수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gradStatus.graduationCategory).map(([k, cat]: any) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{cat.totalCredits}</td>
                        <td>{cat.satisfied ? '충족' : '미충족'}</td>
                        <td>{cat.userTakenCoursesList?.takenCourses?.length ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Box>
            </Box>
          )}

          <Space h={40} />

          {/* 전체 요약 카드 */}
          <GradOverallStatus
            scrollIntoView={() => {}}
            totalCredits={overallProps.totalCredits}
            totalPercentage={overallProps.totalPercentage}
            overallStatus={overallProps.domains}
            minDomain={overallProps.minDomain}
            minDomainPercentage={overallProps.minDomainPercentage}
            feedbackNumbers={feedbackNumbers}
          />

          <Space h={40} />

          <Title order={3} mb="sm">
            세부적인 현황 (미리보기)
          </Title>
          <GradSpecificDomainStatus specificDomainStatusArr={overallProps.categoriesArr} />

          <Space h={16} />

          <Title order={3} mt={40} mb="lg">
            영역별 피드백 모음 (미리보기)
          </Title>
          <GradRecommend specificDomainStatusArr={overallProps.categoriesArr} />

          <Space h={40} />
        </>
      ) : (
        <Box mt="md">
          <Text c="dimmed">아직 파싱된 데이터가 없습니다. 파일을 업로드하여 파싱해주세요.</Text>
        </Box>
      )}

      <Space h={20} />

      {/* 원시 파싱 결과 테이블 (디버깅용) */}
      {effectiveParsed && (
        <>
          <Title order={3} mb="sm">
            원시 파싱 결과
          </Title>
          <Text size="sm" c="dimmed" mb={8}>
            학번: {effectiveParsed.studentId} · 총 과목 수:{' '}
            {effectiveParsed.userTakenCourseList?.length ?? 0}
          </Text>

          <ScrollArea style={{ height: 420 }}>
            <Table striped highlightOnHover verticalSpacing="xs" fontSize="sm">
              <thead>
                <tr>
                  <th>연도</th>
                  <th>학기</th>
                  <th>구분</th>
                  <th>과목코드</th>
                  <th>과목명</th>
                  <th>학점</th>
                  <th>성적</th>
                </tr>
              </thead>
              <tbody>
                {effectiveParsed.userTakenCourseList?.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td>{c.year ?? c['year'] ?? '-'}</td>
                    <td>{c.semester ?? c['semester'] ?? '-'}</td>
                    <td>{c.courseType ?? c['courseType'] ?? '-'}</td>
                    <td>{c.courseCode ?? c['courseCode'] ?? c['code'] ?? '-'}</td>
                    <td
                      style={{
                        maxWidth: 420,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.courseName ?? c['courseName'] ?? c['course'] ?? '-'}
                    </td>
                    <td>{c.credit ?? c['credit'] ?? '-'}</td>
                    <td>{c.grade ?? c['grade'] ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </>
      )}

      <Space h={80} />
    </Container>
  );
}
