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
  createStyles,
  Title,
  Stack,
} from '@mantine/core';
import { useDisclosure, useHover } from '@mantine/hooks';
import { useSingleCourse } from '../lib/hooks/course';
import { getCourseTagColor } from '@utils/course/tag-color';

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
  const { classes } = useStyles();

  // Drawer open 상태 관리
  const { hovered, ref } = useHover();
  const [opened, { open, close }] = useDisclosure(false);

  // mutation으로 히스토리 관리
  const { data: single_course, isLoading: isCourseHistoryDataLoading, mutate } = useSingleCourse();
  const tagContent = tags?.map((tag) => {
    const color = getCourseTagColor(tag);
    return (
      <Badge
        key={tag}
        radius="sm"
        px={6}
        color={color}
        variant="light"
        sx={(theme) => ({
          fontWeight: 550,
          borderColor: theme.colors[color as string][5],
        })}
      >
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
        <Paper withBorder p="md" radius="md" ref={ref} bg={hovered ? 'gray.0' : undefined} h="100%">
          <Stack justify="space-between" h="100%">
            <Text size="md" mb={8} color="dimmed">
              {code}
            </Text>
            <Text size={rem(24)} weight={500} w="fit-content">
              {title}
            </Text>
            <Group w="fit-content" position="apart" spacing="xs" mt="xl">
              {tagContent}
              <Badge
                radius="sm"
                px={6}
                fw={550}
                sx={(theme) => ({
                  borderColor: theme.colors.blue[5],
                })}
              >
                {credit}학점
              </Badge>
            </Group>
          </Stack>
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
            <Badge variant="dot" radius="md" size="lg" key={t} color={getCourseTagColor(t)}>
              {t}
            </Badge>
          ))}
          <Badge variant="dot" radius="md" size="lg">
            {credit}학점
          </Badge>
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
        <Title order={3} mt="xl" mb="sm">
          강의소개
        </Title>
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
        <Title order={3} mt="xl" mb="sm">
          강의 히스토리
        </Title>
        {isCourseHistoryDataLoading ? (
          <Skeleton radius="sm" h={300} />
        ) : (
          <div className={classes.tableBorder}>
            <Table highlightOnHover horizontalSpacing="lg" verticalSpacing="sm">
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
          </div>
        )}
      </Drawer>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  tableBorder: {
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
}));
