import React, { Fragment, useState } from 'react';
import {
  Box,
  Container,
  createStyles,
  Divider,
  Group,
  Paper,
  rem,
  ScrollArea,
  Select,
  Table,
  Text,
} from '@mantine/core';
import { fakeUserData } from '../../../lib/const/fakeUserData';
import {
  Bar,
  BarChart,
  LineChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from 'recharts';
import { getSortedCourseStatus, getUserScoreFromTakenCourseList } from '../../../lib/utils/status';
import { useAuthState } from '../../../lib/hooks/auth';
import { useCourseStatus } from '../../../lib/hooks/course';

const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

export default function My() {
  const { data } = useCourseStatus();
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  /* 수강한 강의 선택 */
  const [cntPeriod, setCntPeriod] = useState('2020년도 1학기');
  /* 연도 및 학기별 수강한 강의 목록*/
  const courseListWithPeriod = getSortedCourseStatus(data);
  const list = courseListWithPeriod
    ?.filter((periodList) => cntPeriod === periodList.period)
    ?.at(0)
    ?.userTakenCourseList?.map((course) => {
      return (
        <tr key={`${course.courseCode} + ${course.grade}`}>
          <td>{course.courseCode}</td>
          <td>{course.courseName}</td>
          <td>{course.courseType}</td>
          <td>{course.credit}</td>
          <td>{course.grade}</td>
        </tr>
      );
    });

  /* 학기 시작과 끝 조사하기 */
  const dateStart = courseListWithPeriod.at(0)?.period;
  const dateEnd = courseListWithPeriod.at(-1)?.period;

  const dataSet = [
    {
      label: '총 이수 학점',
      content: `${fakeUserData.totalCredit} 학점 / 130 학점`,
    },
    {
      label: '이수 학기',
      content: `${dateStart} ~ ${dateEnd}`,
    },
    {
      label: '학기별 평균 학점',
      content: `${fakeUserData.averageGrade}`,
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
        <Group>
          <Text ml={8} w={150} weight={600}>
            {data.label}
          </Text>
          <Text>{data.content}</Text>
        </Group>
        <Divider my={12} />
      </Fragment>
    );
  });
  return (
    <Container size="md">
      <Text size={32} mt={24} mb={32} weight={700}>
        학기별 강의 이수 현황
      </Text>
      <Paper w="100%" h={400} my={40} pr={40} pl={0} radius="md">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={300} height={100} data={dataForTable}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              padding={{ left: 20 }}
              fontSize={12}
              tick={{ width: 30 }}
              tickSize={8}
              interval={1}
            />
            <YAxis dataKey="수강학점" />
            <Tooltip />
            <Bar
              type="monotone"
              dataKey="수강학점"
              fill="#4593fc"
              onClick={(data) => setCntPeriod(data.name)}
            >
              <LabelList dataKey="수강학점" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Box>{overall}</Box>
      <Text size={32} my={32} weight={700}>
        학기별 성적 현황
      </Text>
      <Paper w="100%" h={400} my={40} pr={40} radius="md">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={300} height={100} data={dataForLineChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              padding={{ left: 40, right: 40 }}
              fontSize={12}
              tick={{ width: 30 }}
              tickSize={8}
              interval={0}
            />
            <YAxis dataKey="학점" domain={[2.0, 4.5]} />
            <Tooltip />
            <Line type="monotone" dataKey="학점" stroke="#8884d8" dot={{ r: 6 }}>
              <LabelList dataKey="학점" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      <Box p={40} mb={100}>
        <Group position="apart">
          <Text size={24} weight={600} m={16}>
            {cntPeriod}
          </Text>
          <Select
            placeholder="수강 시기를 고르세요"
            value={cntPeriod}
            onChange={(cnt) => setCntPeriod(cnt as string)}
            data={dataForSelect}
          />
        </Group>
        <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
          <Table miw={700}>
            <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
              <tr>
                <th>강의 코드</th>
                <th>강의 명</th>
                <th>강의 종류</th>
                <th>학점</th>
                <th>성적</th>
              </tr>
            </thead>
            <tbody>{list}</tbody>
          </Table>
        </ScrollArea>
      </Box>
    </Container>
  );
}
