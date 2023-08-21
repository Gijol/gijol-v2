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
  Code,
  Flex,
  Table,
  Skeleton,
} from '@mantine/core';
import { useDisclosure, useHover } from '@mantine/hooks';
import Link from 'next/link';
import { getCourseTagColor } from '../lib/utils/course';
import { useQuery } from '@tanstack/react-query';
import { useSingleCourse } from '../lib/hooks/course';
import { CourseHistory } from '../lib/types/course';

export default function CourseThumbnailWithDrawer({
  id,
  code,
  title,
  credit,
  tags,
  description,
  prerequisites,
}: {
  id: number;
  code: string;
  title: string;
  credit: number;
  description: string | null;
  prerequisites: string;
  tags?: string[];
}) {
  // Drawer open 상태 관리
  const { hovered, ref } = useHover();
  const [opened, { open, close }] = useDisclosure(false);

  // mutation으로 히스토리 관리
  const { data: single_course, isLoading: isCourseHistoryDataLoading, mutate } = useSingleCourse();
  const tagContent = tags?.map((tag) => {
    return (
      <Badge key={tag} radius="sm" px={6} color={getCourseTagColor(tag)}>
        {tag}
      </Badge>
    );
  });
  const none = ['none', 'NONE', 'None', '-', '', ' '];

  const rows = single_course?.courseHistoryResponses.map((element, idx) => (
    <tr key={idx}>
      <td>{element.year}</td>
      <td>{element.semester}</td>
      <td>{element.courseProfessor}</td>
      <td>{element.courseTime}</td>
      <td>{element.courseRoom}</td>
    </tr>
  ));

  return (
    <>
      <UnstyledButton
        onClick={() => {
          open();
          mutate(id);
        }}
        w="100%"
      >
        <Paper withBorder p="md" radius="md" ref={ref} bg={hovered ? 'gray.0' : undefined} my="sm">
          <Text size={rem(14)} mb={8} color="dimmed">
            {code}
          </Text>
          <Flex justify="space-between" wrap="wrap" gap="md" align="center">
            <Text size={rem(24)} weight={500} miw={300}>
              {title}
            </Text>
            <Group w="fit-content" position="apart">
              {tagContent}
              <Badge radius="sm" px={6}>
                {credit}학점
              </Badge>
            </Group>
          </Flex>
        </Paper>
      </UnstyledButton>
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        withCloseButton={false}
        overlayProps={{ opacity: 0.5, blur: 4 }}
        padding="xl"
        size="60%"
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
        <Text py="md">
          선 이수과목 :
          {none.includes(prerequisites) ? (
            <Text component="span" color="dimmed">
              {' '}
              없습니다! 😆
            </Text>
          ) : (
            <Code color="blue.4" mx="md">
              {prerequisites}
            </Code>
          )}
        </Text>
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
        <Text fz="md" fw={600} mt="xl" mb="sm">
          강의 히스토리
        </Text>
        {isCourseHistoryDataLoading ? (
          <Skeleton radius="sm" h={300} />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>연도</th>
                <th>학기</th>
                <th>교수명</th>
                <th>강의 시간대</th>
                <th>강의실</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        )}
      </Drawer>
    </>
  );
}
