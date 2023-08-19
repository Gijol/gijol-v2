import React, { Fragment } from 'react';
import {
  Box,
  Center,
  Container,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
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

export default function My() {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.spacing.md})`);

  // Clerk 사용하는 부분 !!
  const { data, isLoading, isInitialLoading, isFetching } = useCourseStatus();
  const { isSignedIn, isLoaded: isAuthStateLoaded } = useUser();

  /* 연도 및 학기별 수강한 강의 목록*/
  const courseListWithPeriod = getSortedCourseStatus(data);

  /* 학기 시작과 끝 조사하기 */
  const dateStart = courseListWithPeriod.at(0)?.period;
  const dateEnd = courseListWithPeriod.at(-1)?.period;
  const dataSet = [
    {
      label: '총 이수 학점',
      content: `${data?.totalCredit} 학점 / 130 학점`,
    },
    {
      label: '이수 학기',
      content: `${dateStart} ~ ${dateEnd}`,
    },
    {
      label: '학기별 평균 학점',
      content: `${data?.averageGrade}`,
    },
  ];

  const dataForTable = courseListWithPeriod.map((periodWithList) => {
    return {
      name: periodWithList.period,
      수강학점: periodWithList.userTakenCourseList?.reduce((acc, cnt) => acc + cnt.credit, 0),
    };
  });

  const dataForLineChart = courseListWithPeriod
    .map((periodWithList) => {
      return {
        period: periodWithList.period,
        학점: periodWithList.grade ?? 0,
      };
    })
    .filter((item) => item.학점 !== 0);

  const dataForSelect = courseListWithPeriod.map((periodWithList) => {
    return {
      value: periodWithList.period,
      label: periodWithList.period,
    };
  });
  const overall = dataSet.map((data) => {
    return (
      <Fragment key={data.label}>
        <Text ml={8} w={150} weight={600}>
          {data.label}
        </Text>
        <Text>{data.content}</Text>
      </Fragment>
    );
  });

  if (!isAuthStateLoaded) {
    return <Loading content="잠시만 기다려 주세요" />;
  }

  if (isAuthStateLoaded && !isSignedIn) {
    return (
      <Center>
        <Text>로그인 해주세용...</Text>
      </Center>
    );
  }

  if (isLoading || isFetching || isInitialLoading) {
    return <CourseMyLoadingSkeleton />;
  }

  return (
    <Container size="md">
      <Text size={32} mt={24} mb={32} weight={700}>
        학기별 강의 이수 현황
      </Text>

      <Paper w="100%" h={400} my={40} pr={matches ? 40 : 0} pl={0} radius="md">
        <CourseMyCreditChart dataForTable={dataForTable} />
      </Paper>

      <SimpleGrid cols={2} px="md">
        {overall}
      </SimpleGrid>

      <Text size={32} my={32} weight={700}>
        학기별 성적 현황
      </Text>
      <Paper w="100%" h={400} my={40} pr={40} radius="md">
        <CourseMyGradeChart dataForLineChart={dataForLineChart} />
      </Paper>

      <CourseMyTableChart
        dataForSelect={dataForSelect}
        courseListWithPeriod={courseListWithPeriod}
      />
    </Container>
  );
  // }
}
