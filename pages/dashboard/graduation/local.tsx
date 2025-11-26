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

import { readFileAndParse } from '@utils/graduation/grad-formatter';
import type { UserStatusType } from '@lib/types/index';

// 새로 추가된 import: 기존 졸업 컴포넌트들과 유틸
import GradOverallStatus from '@components/grad-overall-status';
import GradSpecificDomainStatus from '@components/grad-specific-domain-status';
import GradRecommend from '@components/grad-recommend';
import type { GradStatusResponseType, SingleCategoryType } from '@lib/types/grad';
import { extractOverallStatus, getFeedbackNumbers } from '@utils/graduation/grad-formatter';

const STORAGE_KEY = 'gijol_grad_local_v1';

export default function Local() {
  const openRef = useRef<any>(null);
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<UserStatusType | null>(null);

  // parsed(UserStatusType) -> GradStatusResponseType로 변환하는 간단한 헬퍼
  // 실제 서버 로직과 다르지만, 컴포넌트 미리보기를 위해 최소한의 구조를 채웁니다.
  const convertParsedToGradStatus = (p: UserStatusType): GradStatusResponseType => {
    const taken = p.userTakenCourseList || [];
    const totalCredits = taken.reduce((s, c) => s + (Number(c.credit) || 0), 0);

    const mapTaken = taken.map((c) => ({
      year: Number(c.year) || 0,
      semester: c.semester || '',
      courseType: c.courseType || '기타',
      courseName: c.courseName || (c as any)['course'] || '',
      courseCode: c.courseCode || (c as any)['code'] || '',
      credit: Number(c.credit) || 0,
    }));

    // 기본 카테고리 템플릿
    const emptyCategory = (items: any[] = []): SingleCategoryType => ({
      messages: [],
      minConditionCredits: 1, // 0이면 퍼센트 계산에서 분모가 0이 될 수 있어 1로 설정
      satisfied: false,
      totalCredits: 0,
      userTakenCoursesList: { takenCourses: items },
    });

    // otherUncheckedClass 에만 모든 과목을 넣어 미리보기 제공
    const otherUnchecked = emptyCategory(mapTaken as any);
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

  const onParse = async () => {
    if (!file) return;
    setIsParsing(true);
    setError(null);
    try {
      const res = await readFileAndParse(file as File);
      setParsed(res as UserStatusType);
      // auto-save into localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
      } catch (e) {
        // ignore storage errors
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsParsing(false);
    }
  };

  const onLoadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return setError('로컬 저장된 데이터가 없습니다.');
      const obj = JSON.parse(raw) as UserStatusType;
      setParsed(obj);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  const onDownload = () => {
    if (!parsed) return setError('다운로드할 데이터가 없습니다.');
    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gijol_parsed_grad.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onClear = () => {
    setParsed(null);
    setFile(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const effectiveParsed = parsed as UserStatusType | null;

  // 변환된 gradStatus와 overall props
  const gradStatusPreview = effectiveParsed ? convertParsedToGradStatus(effectiveParsed) : null;
  const overallProps = gradStatusPreview ? extractOverallStatus(gradStatusPreview) : null;
  const feedbackNumbers = gradStatusPreview ? getFeedbackNumbers(gradStatusPreview) : 0;
  console.log(overallProps);
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
            <Text color="dimmed">여기에 엑셀 파일을 드롭하거나 파일 선택 버튼으로 올려주세요.</Text>
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
          <Text color="red">에러: {error}</Text>
        </Box>
      )}

      <Space h={20} />

      {/* 변환된 미리보기 컴포넌트들 */}
      {gradStatusPreview && overallProps ? (
        <>
          <Title order={3} mb="sm">
            파싱 결과 — 미리보기
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

          <Space h={40} />

          <Title order={3} mb="sm">
            세부적인 현황 (미리보기)
          </Title>
          <GradSpecificDomainStatus
            specificDomainStatusArr={gradStatusPreview ? overallProps.categoriesArr : []}
          />

          <Space h={16} />

          <Title order={3} mt={40} mb="lg">
            영역별 피드백 모음 (미리보기)
          </Title>
          <GradRecommend
            specificDomainStatusArr={gradStatusPreview ? overallProps.categoriesArr : []}
          />

          <Space h={40} />
        </>
      ) : (
        <Box mt="md">
          <Text color="dimmed">아직 파싱된 데이터가 없습니다. 파일을 업로드하여 파싱해주세요.</Text>
        </Box>
      )}

      <Space h={20} />

      {/* 원래 있던 원시 테이블도 유지 (디버깅용) */}
      {effectiveParsed ? (
        <>
          <Title order={3} mb="sm">
            원시 파싱 결과
          </Title>
          <Text size="sm" color="dimmed" mb={8}>
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
      ) : null}

      <Space h={80} />
    </Container>
  );
}
