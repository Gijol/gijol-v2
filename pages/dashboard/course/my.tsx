// pages/course/my.tsx
import React from 'react';
import {
  Col,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  Button,
  Box,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconQuestionMark } from '@tabler/icons-react';
import { useRouter } from 'next/router';

import CourseMyGradeChart from '@components/course-my-grade-chart';
import CourseMyTableChart from '@components/course-my-table-chart';
import CourseMyCreditChart from '@components/course-my-credit-chart';

import { convertGradeTo4Scale } from '@utils/status';
import { useMyCourseOverview } from '@hooks/useMyCourseOverview';

function OverallCreditCard({
  totalCredit,
  totalRequired,
}: {
  totalCredit: number;
  totalRequired: number;
}) {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  return (
    <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
      <Stack justify="space-between" h="100%">
        <Stack spacing={4}>
          <Group align="baseline">
            <Text fw={600} color="gray.6" mb="xs">
              총 학점
            </Text>
          </Group>
          <Group spacing={6}>
            <Text size={28} fw={500}>
              {totalCredit}
            </Text>
            <Text mt={5} size="lg" fw={500}>
              / {totalRequired} 학점
            </Text>
          </Group>
        </Stack>
        <Progress
          value={Math.min((Number(totalCredit) * 100) / totalRequired, 100)}
          bg="#bfdbfe80"
          h={theme.spacing.sm}
        />
      </Stack>
    </Paper>
  );
}

function OverallGradeCard({ averageGrade }: { averageGrade: number | null }) {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  return (
    <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
      <Stack justify="space-between" h="100%">
        <Stack spacing={4}>
          <Text fw={600} color="gray.6" mb="xs">
            평균 학점
          </Text>
          <Group spacing={6}>
            <Text size={28} fw={500}>
              {averageGrade ?? '-'}
            </Text>
            <Text mt={5} size="lg" fw={500}>
              / 4.5
            </Text>
          </Group>
        </Stack>
        {averageGrade != null && (
          <Group spacing="sm">
            <Text fw={500} size="sm" color="dimmed">
              GPA 환산 점수 : {convertGradeTo4Scale(averageGrade, 4.5)}
            </Text>
            <Tooltip
              label="정확하지 않으므로 참고용으로만 사용해주세요!"
              withArrow
              position="bottom"
            >
              <ThemeIcon radius="xl" variant="default" size="sm">
                <IconQuestionMark size="0.9rem" color={theme.colors.gray[7]} />
              </ThemeIcon>
            </Tooltip>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

function OverallSemesterCard({
  start_y,
  start_s,
  end_y,
  end_s,
}: {
  start_y?: number;
  start_s?: string;
  end_y?: number;
  end_s?: string;
}) {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  return (
    <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
      <Stack spacing={0} h="100%">
        <Text fw={600} color="gray.6" mb="xs">
          이수 학기
        </Text>
        <Group position="center" spacing="md" my="auto">
          <Text size="lg" fw={600}>
            {start_y}년도 {start_s}
          </Text>
          <Text> ~ </Text>
          <Text size="lg" fw={600}>
            {end_y}년도 {end_s}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

export default function My() {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const router = useRouter();

  const {
    parsed,
    courseListWithPeriod,
    totalCredit,
    overallAverageGrade,
    start_y,
    start_s,
    end_y,
    end_s,
    TOTAL_REQUIRED_CREDITS,
  } = useMyCourseOverview();

  // 아직 업로드된 데이터가 없을 때
  if (!parsed || !parsed.userTakenCourseList?.length) {
    return (
      <Container size="lg">
        <Title order={3} mb="lg" mt={40}>
          내 수강현황 📑
        </Title>
        <Paper p="xl" radius="md" withBorder>
          <Stack spacing="md">
            <Text>
              아직 수강 내역이 로드되지 않았어요.
              <br />
              먼저 <b>졸업요건 파서</b>에서 엑셀 파일을 업로드하면, 이 페이지에서 내 수강현황과
              학기별 통계를 확인할 수 있습니다.
            </Text>
            <Group>
              <Button onClick={() => router.push('/graduation')} color="blue">
                졸업요건 파서로 이동
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Title order={3} mb="lg" mt={40}>
        내 수강현황 📑
      </Title>

      <SimpleGrid cols={matches ? 3 : 1} my="xl">
        <OverallCreditCard totalCredit={totalCredit} totalRequired={TOTAL_REQUIRED_CREDITS} />
        <OverallGradeCard averageGrade={overallAverageGrade} />
        <OverallSemesterCard start_y={start_y} start_s={start_s} end_y={end_y} end_s={end_s} />
      </SimpleGrid>

      <Grid columns={12} gutter="xl">
        <Col lg={6} md={12}>
          <CourseMyCreditChart data={courseListWithPeriod} />
        </Col>
        <Col lg={6} md={12}>
          <CourseMyGradeChart data={courseListWithPeriod} />
        </Col>
        <Col lg={12} md={12}>
          <CourseMyTableChart data={courseListWithPeriod} />
        </Col>
      </Grid>
    </Container>
  );
}
