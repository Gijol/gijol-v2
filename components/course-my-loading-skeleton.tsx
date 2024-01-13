import { Container, Skeleton, Stack, Text } from '@mantine/core';
import React from 'react';

export default function CourseMyLoadingSkeleton() {
  return (
    <Container size="md">
      <Text size={32} mt={24} mb={32} weight={700}>
        학기별 강의 이수 현황
      </Text>
      <Skeleton height={400} radius="sm" my={40} />
      <Stack spacing="1rem">
        <Skeleton height="2rem" radius="sm" />
        <Skeleton height="2rem" radius="sm" />
        <Skeleton height="2rem" radius="sm" />
      </Stack>
      <Text size={32} my={32} weight={700}>
        학기별 성적 현황
      </Text>
      <Skeleton height={400} radius="sm" my={40} />
      <Skeleton height={400} radius="sm" my={40} />
    </Container>
  );
}
