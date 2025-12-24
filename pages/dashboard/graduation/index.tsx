import React from 'react';
import {
  Container,
  Space,
  Title,
  Group,
  Text,
  Box,
  Paper,
  Badge,
  Stack,
  Divider,
  RingProgress,
  Center,
} from '@mantine/core';
import { useMediaQuery, useScrollIntoView } from '@mantine/hooks';

import GradOverallStatus from '@components/grad-overall-status';
import GradSpecificDomainStatus from '@components/grad-specific-domain-status';
import GradRecommend from '@components/grad-recommend';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';
import {
  extractOverallStatus,
  getDomainColor,
  getFeedbackNumbers,
} from '@utils/graduation/grad-formatter';
import UploadEmptyState from '@components/graduation/upload-empty-state';
import { inferEntryYear } from '@utils/graduation/grad-status-helper';

export default function GraduationStatusPage() {
  const matches = useMediaQuery(`(min-width: 48em)`);
  const { parsed, gradStatus } = useGraduationStore();
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({ offset: 80 });

  if (!parsed || !gradStatus) {
    return (
      <Container size="lg">
        <Title order={2} mt={40} mb="lg">
          🙏 졸업요건 현황
        </Title>
        <UploadEmptyState />
      </Container>
    );
  }

  const overallProps = extractOverallStatus(gradStatus);
  const feedbackNumbers = getFeedbackNumbers(gradStatus);

  if (!overallProps) {
    return (
      <Container size="lg">
        <Title order={2} mt={40} mb="lg">
          🙏 졸업요건 현황
        </Title>
        <Text c="dimmed">졸업요건 정보가 없습니다.</Text>
      </Container>
    );
  }

  const entryYear = inferEntryYear(parsed as any);
  const major = (parsed as any).major || (parsed as any).department || undefined;

  return (
    <Container size="lg">
      <Title order={2} mt={24} mb="md">
        🙏 졸업요건 현황
      </Title>

      {/* ✅ 전체 요약 + 영역 테이블 */}
      <GradOverallStatus
        scrollIntoView={scrollIntoView}
        totalCredits={overallProps.totalCredits}
        totalPercentage={overallProps.totalPercentage}
        overallStatus={overallProps.domains}
        minDomain={overallProps.minDomain}
        minDomainPercentage={overallProps.minDomainPercentage}
        feedbackNumbers={feedbackNumbers}
      />

      <Space h={36} />
      <Divider label="세부 영역별 현황" labelPosition="center" />
      <Space h={20} />

      {/* ✅ 세부 영역 현황 (아코디언) */}
      <GradSpecificDomainStatus specificDomainStatusArr={overallProps.categoriesArr} />

      <Space h={40} />
      <Divider label="추천 / 피드백" labelPosition="center" />
      <Space h={20} />

      {/* ✅ 추천/피드백 섹션에 ref 연결 → 상단 카드에서 스크롤 */}
      <Box ref={targetRef}>
        <GradRecommend specificDomainStatusArr={overallProps.categoriesArr} />
      </Box>

      <Space h={60} />
      <Center mt="lg" mb="xl" pb="xl">
        <Text size="md" c="dimmed" ta="center">
          지금까지{' '}
          <Text span fw={600}>
            졸업요건의 {overallProps.totalPercentage}%
          </Text>
          를 채워두신 상태예요. 남은 건 채워나가는 속도보다, 지금처럼 꾸준히 체크하는 습관입니다 🙂
        </Text>
      </Center>
    </Container>
  );
}

const generatePercentMsg = (percentage: number) => {
  if (percentage >= 100) {
    return '🎉 축하드려요! 졸업하실 수 있습니다! 🎉';
  } else if (percentage >= 80) {
    return '거의 다 왔어요! 조금만 더 힘내세요! 💪';
  } else if (percentage >= 50) {
    return '절반은 왔어요! 꾸준히 채워나가요! 📚';
  } else {
    return '아직 갈 길이 멀어요! 계획을 세워봐요! 📝';
  }
};
