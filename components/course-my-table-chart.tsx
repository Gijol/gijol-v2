import {
  Box,
  createStyles,
  Group,
  Paper,
  rem,
  ScrollArea,
  Select,
  Table,
  Text,
  Title,
} from '@mantine/core';
import React, { useState } from 'react';
import { CourseWithGradeStatusType } from '../lib/types/score-status';
import { CourseListWithPeriod } from '../lib/utils/status';

const generateSelectData = (courseListWithPeriod: CourseListWithPeriod[]) => {
  return courseListWithPeriod.map((periodWithList) => {
    return {
      value: periodWithList.year + '년도 ' + periodWithList.semester_str,
      label: periodWithList.year + '년도 ' + periodWithList.semester_str,
    };
  });
};

const generateTableList = (courseListWithPeriod: CourseListWithPeriod[], cntPeriod: string) => {
  return courseListWithPeriod
    ?.filter((periodList) => cntPeriod === periodList.year + '년도 ' + periodList.semester_str)
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
};

export default function CourseMyTableChart({ data }: { data: CourseListWithPeriod[] }) {
  /* 테이블 스타일 적용 */
  const { classes, cx } = useStyles();
  /* 수강한 강의 선택 */
  const [cntPeriod, setCntPeriod] = useState('2020년도 1학기');
  /* 수강 강의 목록 스크롤 여부 훅 */
  const [scrolled, setScrolled] = useState(false);

  const tableList = generateTableList(data, cntPeriod);
  const dataForSelect = generateSelectData(data);

  return (
    <Paper withBorder radius="md" p="xl">
      <Group position="apart" mb="xl">
        <Title order={3}>{cntPeriod}</Title>
        <Select
          placeholder="수강 시기를 고르세요"
          value={cntPeriod}
          onChange={(cnt) => setCntPeriod(cnt as string)}
          data={dataForSelect}
          size="sm"
        />
      </Group>
      <ScrollArea h={500} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
        <div className={classes.tableBorder}>
          <Table highlightOnHover horizontalSpacing="lg" verticalSpacing="sm">
            <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
              <tr>
                <th>강의 코드</th>
                <th>강의 명</th>
                <th>강의 종류</th>
                <th>학점</th>
                <th>성적</th>
              </tr>
            </thead>
            <tbody>{tableList}</tbody>
          </Table>
        </div>
      </ScrollArea>
    </Paper>
  );
}

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',
  },
  scrolled: {
    boxShadow: theme.shadows.sm,
  },
  tableBorder: {
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    position: 'relative',
  },
}));
