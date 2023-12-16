import React, { Fragment } from 'react';
import {
  Col,
  Container,
  Flex,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { getSortedCourseStatus } from '../../../lib/utils/status';
import { useCourseStatus } from '../../../lib/hooks/course';
import { useMediaQuery } from '@mantine/hooks';
import Loading from '../../../components/loading';
import CourseMyCreditChart from '../../../components/course-my-credit-chart';
import CourseMyGradeChart from '../../../components/course-my-grade-chart';
import CourseMyTableChart from '../../../components/course-my-table-chart';
import { useUser } from '@clerk/nextjs';
import CourseMyLoadingSkeleton from '../../../components/course-my-loading-skeleton';
import { useMemberStatus } from '../../../lib/hooks/auth';
import DashboardFileUploadEncouragement from '../../../components/dashboard-file-upload-encouragement';
import DashboardUnsignedPage from '../../../components/dashboard-unsigned-page';
import { IconCalendar, IconCalendarEvent } from '@tabler/icons-react';

export default function My() {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  // Clerk 사용하는 부분 !!
  const { data, isLoading, isInitialLoading, isFetching } = useCourseStatus();
  const { isSignedIn, isLoaded: isAuthStateLoaded } = useUser();
  const { data: status, isLoading: isMemberStatusLoading } = useMemberStatus();

  /* 연도 및 학기별 수강한 강의 목록*/
  const courseListWithPeriod = getSortedCourseStatus(data).filter(
    (i) => (i.userTakenCourseList?.length as number) > 0
  );

  /* 학기 시작과 끝 조사하기 */
  const start_y = courseListWithPeriod.at(0)?.year;
  const start_s = courseListWithPeriod.at(0)?.semester_str;
  const end_y = courseListWithPeriod.at(-1)?.year;
  const end_s = courseListWithPeriod.at(-1)?.semester_str;

  const overall_credit = (
    <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
      <Stack justify="space-between" h="100%">
        <Stack spacing={4}>
          <Group align="baseline">
            <Text fw={600} color="gray.6" mb="md">
              총 학점
            </Text>
          </Group>
          <Group spacing={6}>
            <Text size={28} fw={500}>
              {data?.totalCredit}
            </Text>
            <Text mt={5} size="lg" fw={500}>
              / 130 학점
            </Text>
          </Group>
        </Stack>
        <Progress
          value={((data?.totalCredit as number) * 100) / 130}
          bg="#bfdbfe80"
          h={theme.spacing.sm}
        />
      </Stack>
    </Paper>
  );

  const overall_grade = (
    <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
      <Stack justify="space-between" h="100%">
        <Stack spacing={4}>
          <Text fw={600} color="gray.6" mb="md">
            평균 학점
          </Text>
          <Group spacing={6}>
            <Text size={28} fw={500}>
              {data?.averageGrade}
            </Text>
            <Text mt={5} size="lg" fw={500}>
              / 4.5
            </Text>
          </Group>
        </Stack>
        <Progress />
      </Stack>
    </Paper>
  );

  const overall_semester = (
    <Paper radius="md" p={matches ? 'xl' : 'xs'} withBorder>
      <Stack spacing={0} h="100%">
        <Text fw={600} color="gray.6" mb="md">
          이수 학기
        </Text>
        <Flex justify="space-around" mb="xl" my="auto">
          <Text size="xl" fw={600}>
            {start_y}년도 {start_s}
          </Text>
          <Text>~</Text>
          <Text size="xl" fw={600}>
            {end_y}년도 {end_s}
          </Text>
        </Flex>
      </Stack>
    </Paper>
  );

  if (!isAuthStateLoaded || isMemberStatusLoading) {
    return <Loading content="잠시만 기다려 주세요" />;
  }

  if (isAuthStateLoaded && !isSignedIn) {
    return <DashboardUnsignedPage />;
  }

  if (isAuthStateLoaded && isSignedIn && status?.isNewUser) {
    return <DashboardFileUploadEncouragement />;
  }

  if (!status?.isNewUser && (isLoading || isInitialLoading || isFetching)) {
    return <CourseMyLoadingSkeleton />;
  }

  return (
    <Container size="lg">
      <SimpleGrid cols={matches ? 3 : 1} my="xl">
        {overall_credit}
        {overall_grade}
        {overall_semester}
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
  // }
}
