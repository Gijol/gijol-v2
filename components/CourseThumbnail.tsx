import React from 'react';
import { Group, Paper, Text, Badge, Button } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import Link from 'next/link';
import { getCourseTagColor } from '../lib/utils/course';

export default function CourseThumbnail({
  code,
  title,
  credit,
  tags,
}: {
  code: string;
  title: string;
  credit: number;
  tags?: string[];
}) {
  const { hovered, ref } = useHover();
  const tagContent = tags?.map((tag) => {
    return (
      <Badge key={tag} radius="sm" px={6} color={getCourseTagColor(tag)}>
        {tag}
      </Badge>
    );
  });
  return (
    <Link href="/dashboard/course/search" style={{ textDecoration: 'none', color: 'black' }}>
      <Paper withBorder p="md" radius="md" ref={ref} bg={hovered ? 'gray.0' : undefined} my={20}>
        <Text size={14} mb={8} color="dimmed">
          {code}
        </Text>
        <Group position="apart">
          <Text size={24} weight={500} w="30rem">
            {title}
          </Text>
          <Group>
            {tagContent}
            <Badge radius="sm" px={6}>
              {credit}학점
            </Badge>
          </Group>
        </Group>
      </Paper>
    </Link>
  );
}
