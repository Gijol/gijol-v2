import { Box, createStyles, Group, rem, ScrollArea, Select, Table, Text } from '@mantine/core';
import React, { useState } from 'react';
import { CourseWithGradeStatusType } from '../lib/types/score-status';

export default function CourseMyTableChart({
  dataForSelect,
  courseListWithPeriod,
}: {
  dataForSelect: { value: string; label: string }[];
  courseListWithPeriod: {
    period: string;
    grade: number | undefined;
    userTakenCourseList: CourseWithGradeStatusType[] | undefined;
  }[];
}) {
  /* 테이블 스타일 적용 */
  const { classes, cx } = useStyles();
  /* 수강한 강의 선택 */
  const [cntPeriod, setCntPeriod] = useState('2020년도 1학기');
  /* 수강 강의 목록 스크롤 여부 훅 */
  const [scrolled, setScrolled] = useState(false);
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
  return (
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
  );
}

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
