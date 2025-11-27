import React from 'react';
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
  Stack,
  Paper,
} from '@mantine/core';

import GradOverallStatus from '@components/grad-overall-status';
import GradSpecificDomainStatus from '@components/grad-specific-domain-status';
import GradRecommend from '@components/grad-recommend';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';
import { extractOverallStatus, getFeedbackNumbers } from '@utils/graduation/grad-formatter';
import UploadEmptyState from '@components/graduation/upload-empty-state';

export default function Index() {
  const { parsed, gradStatus } = useGraduationStore();

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
    return <Text>졸업요건 정보가 없습니다.</Text>;
  }

  return (
    <Container size="lg">
      <Title order={2} mt={20} mb="md">
        🙏 졸업요건 현황
      </Title>

      <Group spacing="md">
        <Text size="md" c="dimmed" mb="lg">
          학번: {parsed.studentId}
        </Text>{' '}
        <Text size="md" c="dimmed" mb="lg">
          총 이수 학점: {overallProps.totalCredits}학점
        </Text>
      </Group>

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
        세부적인 졸업요건 충족 현황
      </Title>
      <GradSpecificDomainStatus specificDomainStatusArr={overallProps.categoriesArr} />

      <Space h={32} />

      <Title order={3} mb="sm">
        영역별 추천/피드백
      </Title>
      <GradRecommend specificDomainStatusArr={overallProps.categoriesArr} />

      <Space h={60} />
    </Container>
  );
}
