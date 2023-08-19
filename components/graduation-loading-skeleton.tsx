import { Container, Skeleton, Space, Stack } from '@mantine/core';
import React from 'react';

export default function GraduationLoadingSkeleton() {
  return (
    <Container>
      <h1>졸업요건 현황</h1>
      <Space h={16} />
      <Skeleton height={500} radius="sm" />
      <Space h={40} />
      <h1>영역별 세부 현황</h1>
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
      <h1>영역별 피드백 모음</h1>
      <Space h={16} />
      <Skeleton height={360} radius="sm" />
      <Space h={80} />
    </Container>
  );
}
