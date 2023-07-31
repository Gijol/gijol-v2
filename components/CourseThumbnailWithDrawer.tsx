import React from 'react';
import {
  Group,
  Paper,
  Text,
  Badge,
  Button,
  UnstyledButton,
  Box,
  Drawer,
  rem,
  Spoiler,
} from '@mantine/core';
import { useDisclosure, useHover } from '@mantine/hooks';
import Link from 'next/link';
import { getCourseTagColor } from '../lib/utils/course';

export default function CourseThumbnailWithDrawer({
  code,
  title,
  credit,
  tags,
  description,
}: {
  code: string;
  title: string;
  credit: number;
  description: string | null;
  tags?: string[];
}) {
  const { hovered, ref } = useHover();
  const [opened, { open, close }] = useDisclosure(false);
  const tagContent = tags?.map((tag) => {
    return (
      <Badge key={tag} radius="sm" px={6} color={getCourseTagColor(tag)}>
        {tag}
      </Badge>
    );
  });
  return (
    <>
      <UnstyledButton onClick={open} w="100%">
        <Paper withBorder p="md" radius="md" ref={ref} bg={hovered ? 'gray.0' : undefined} my="sm">
          <Text size={rem(14)} mb={8} color="dimmed">
            {code}
          </Text>
          <Group position="apart">
            <Text size={rem(24)} weight={500} w="30rem">
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
      </UnstyledButton>
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        withCloseButton={false}
        overlayProps={{ opacity: 0.5, blur: 4 }}
        padding="xl"
        size="40%"
      >
        <Text color="dimmed">{code}</Text>
        <Text size="2rem" fw={600} mt="sm">
          {title}
        </Text>
        <Group mt="md" spacing="xs">
          {tags?.map((t) => (
            <Badge key={t} color={getCourseTagColor(t)}>
              {t}
            </Badge>
          ))}
          <Badge>{credit}학점</Badge>
        </Group>
        <Text fz="md" fw={600} mt="lg">
          강의소개
        </Text>
        <Paper p="xl" withBorder radius="lg" bg="gray.0" mt="sm">
          <Spoiler
            maxHeight={120}
            showLabel="Show more"
            hideLabel="Hide"
            sx={{ wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}
          >
            {description ?? (
              <Text align="center" color="gray.6">
                아직 데이터가 없습니다... 😓
              </Text>
            )}
          </Spoiler>
        </Paper>
      </Drawer>
    </>
  );
}
