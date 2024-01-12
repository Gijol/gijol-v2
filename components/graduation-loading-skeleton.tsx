import { Container, Skeleton, Space, Stack, Title } from '@mantine/core';
import React from 'react';


export default function GraduationLoadingSkeleton() {
  return (
    <Container size="lg">
      <Title order={3} mb="lg" mt={40}>
        종합적인 현황 📋
      </Title>
      <Space h={16} />
      <Skeleton height={500} radius="sm" />
      <Space h={40} />
      <Title order={3} mb="lg" mt={40}>
        세부적인 현황 📑
      </Title>
      <Space h={16} />
      <Stack>
        <Skeleton height={60} radius="sm" />
        <Skeleton height={60} radius="sm" />
        <Skeleton height={60} radius="sm" />
        <Skeleton height={60} radius="sm" />
        <Skeleton height={60} radius="sm" />
        <Skeleton height={60} radius="sm" />
        <Skeleton height={60} radius="sm" />
      </Stack>
      <Space h={16} />
      <Title order={3} mt={40} mb="lg">
        영역별 피드백 모음
      </Title>
      <Space h={16} />
      <Skeleton height={360} radius="sm" />
      <Space h={80} />
    </Container>
  );
}
