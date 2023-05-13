import React from 'react';
import { Group, Paper, Text, Badge, Button } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import Link from 'next/link';

export default function CourseThumbnail() {
  const { hovered, ref } = useHover();
  return (
    <Link href="/dashboard/course/search" style={{ textDecoration: 'none', color: 'black' }}>
      <Paper withBorder p="md" radius="md" ref={ref} bg={hovered ? 'gray.0' : undefined}>
        <Text size={14} mb={8}>
          GS1234
        </Text>
        <Group position="apart">
          <Text size={24} weight={500} w="30rem">
            Course Name Course Name Course Name
          </Text>
          <Group>
            <Badge>기초교육학부</Badge>
            <Badge>3학점</Badge>
          </Group>
        </Group>
      </Paper>
    </Link>
  );
}
