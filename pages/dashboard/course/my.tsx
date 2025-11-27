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
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconQuestionMark } from '@tabler/icons-react';
import { useRouter } from 'next/router';

import CourseMyGradeChart from '@components/course-my-grade-chart';
import CourseMyTableChart from '@components/course-my-table-chart';
import CourseMyCreditChart from '@components/course-my-credit-chart';

import { convertGradeTo4Scale, CourseListWithPeriod } from '@utils/status';
import { useMyCourseOverview } from '@hooks/useMyCourseOverview';
import { TOTAL_REQUIRED_CREDITS } from '@const/grad-status-constants';
import UploadEmptyState from '@components/graduation/upload-empty-state';

function OverallSemesterCard({
  start_y,
  start_s,
  end_y,
  end_s,
  semesterCount,
  avgCreditPerSemester,
  bestSemester,
}: {
  start_y?: number;
  start_s?: string;
  end_y?: number;
  end_s?: string;
  semesterCount: number;
  avgCreditPerSemester: number;
  bestSemester: any | null;
}) {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  const rangeLabel =
    start_y && start_s && end_y && end_s ? `${start_y}년 ${start_s} ~ ${end_y}년 ${end_s}` : '-';

  const bestLabel = bestSemester
    ? `${bestSemester.year}년 ${bestSemester.semester_str} (${bestSemester.grade.toFixed(2)} / 4.5)`
    : '-';

  return (
    <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
      <Stack spacing="xs" h="100%" justify="space-between">
        <Text size={18} fw={600} c="gray.7">
          🗃️ 이수 학기 정보
        </Text>
        <Group position="center">
          <Text size="xl" fw={600} sx={{ whiteSpace: 'nowrap' }}>
            {rangeLabel}
          </Text>
        </Group>

        <Stack>
          <Group spacing="xs">
            <Text size="sm" color="gray.7">
              총 이수 학기:
            </Text>
            <Text size="sm" fw={600}>
              {semesterCount}학기
            </Text>
          </Group>

          <Group spacing="xs">
            <Text size="sm" color="gray.7">
              학기당 평균 이수 학점:
            </Text>
            <Text size="sm" fw={600}>
              {avgCreditPerSemester}학점
            </Text>
          </Group>

          <Group spacing="xs">
            <Text size="sm" color="gray.7">
              최고 학기:
            </Text>
            <Text size="sm" fw={600}>
              {bestLabel}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}

function OverallAcademicCard({
  totalCredit,
  averageGrade,
  progress,
}: {
  totalCredit: number;
  totalRequired: number;
  averageGrade: number | null;
  progress: number; // 0~100
}) {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  return (
    <Stack spacing="md">
      <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
        {/* 학점 진행률 */}
        <Stack spacing={4}>
          <Text size={18} fw={600} c="gray.7">
            누적 이수 학점
          </Text>
          <Group align="baseline" spacing={8}>
            <Text size={28} fw={700}>
              {totalCredit}
            </Text>
            <Text size={18} fw={500}>
              / {TOTAL_REQUIRED_CREDITS}
            </Text>
          </Group>
          <Progress
            size={28}
            label={`${progress.toFixed(2)}%`}
            animate
            value={progress}
            radius="md"
          />
        </Stack>
      </Paper>
      <Paper radius="md" p="xl" withBorder>
        <Stack spacing="xs">
          <Text size={20} fw={600} c="gray.7">
            평균 학점
          </Text>

          <Group align="baseline" spacing={8}>
            <Text size={28} fw={700}>
              {averageGrade ?? '-'}
            </Text>
            <Text size={18} fw={500}>
              / 4.5
            </Text>
          </Group>

          {averageGrade != null && (
            <Group spacing="xs">
              <Text size="sm" color="dimmed">
                GPA(4.0 기준) 환산 : {convertGradeTo4Scale(averageGrade, 4.5)}
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
    </Stack>
  );
}

export default function My() {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  const {
    parsed,
    courseListWithPeriod,
    totalCredit,
    overallAverageGrade,
    start_y,
    start_s,
    end_y,
    end_s,
    semesterCount,
    avgCreditPerSemester,
    bestSemester,
    progress,
    studentId,
    majorName,
    entryYear,
    TOTAL_REQUIRED_CREDITS,
  } = useMyCourseOverview();

  // 아직 업로드된 데이터가 없을 때
  if (!parsed || !parsed.userTakenCourseList?.length) {
    return (
      <Container size="lg">
        <Title order={2} mb="lg" mt={40}>
          📑 수강현황
        </Title>
        <UploadEmptyState />
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Title order={2} mb="lg" mt={20}>
        📑 수강현황
      </Title>

      <Group spacing="md">
        <Text size="md" c="dimmed">
          학번: {studentId}
        </Text>
        <Text size="md" c="dimmed">
          전공: {majorName ?? '-'}
        </Text>
        <Text size="md" c="dimmed">
          부전공: {majorName ?? '-'}
        </Text>
        <Text size="md" c="dimmed">
          입학년도: {entryYear}년
        </Text>
      </Group>

      <SimpleGrid cols={matches ? 2 : 1} my="xl">
        <OverallAcademicCard
          totalCredit={totalCredit}
          totalRequired={TOTAL_REQUIRED_CREDITS}
          averageGrade={overallAverageGrade}
          progress={progress}
        />
        <OverallSemesterCard
          start_y={start_y}
          start_s={start_s}
          end_y={end_y}
          end_s={end_s}
          semesterCount={semesterCount}
          avgCreditPerSemester={avgCreditPerSemester}
          bestSemester={bestSemester}
        />
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
