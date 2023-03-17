import React from 'react';
import { Badge, Button, Grid, Group, Paper, Space, Table, Text, ThemeIcon } from '@mantine/core';
import { IconBolt, IconPresentationAnalytics, IconReportAnalytics } from '@tabler/icons-react';

export default function GradOverallStatus({ classes, scrollIntoView, courseRows }: any) {
  return (
    <>
      <Paper withBorder p={40} radius="md" shadow="xs">
        <Grid gutter="md">
          <Grid.Col span={4}>
            <Paper radius="md" withBorder h={160} p={8}>
              <Group p={8}>
                <ThemeIcon variant="light" size="lg">
                  <IconPresentationAnalytics />
                </ThemeIcon>
                <Text size="md" weight={650}>
                  총 학점
                </Text>
              </Group>
              <Text size="xl" align="start" p={8} pl={14}>
                100 학점
              </Text>
              <Group p={8}>
                <Text size="sm" color="dimmed" weight={600}>
                  총 학점 : 130
                </Text>
                <Badge>80% 이수중</Badge>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper radius="md" withBorder h={160} p={8}>
              <Group p={8}>
                <ThemeIcon variant="light" size="lg" color="orange">
                  <IconReportAnalytics />
                </ThemeIcon>
                <Text size="md" weight={650}>
                  최저 이수 영역
                </Text>
              </Group>
              <Text size="xl" align="start" p={8} pl={14}>
                연구 및 기타
              </Text>
              <Group p={8}>
                <Text size="sm" color="dimmed" weight={600}>
                  총 학점 : 130
                </Text>
                <Badge color="orange">40% 이수중</Badge>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper radius="md" withBorder h={160} p={8}>
              <Group p={8}>
                <ThemeIcon variant="light" size="lg" color="yellow">
                  <IconBolt />
                </ThemeIcon>
                <Text size="md" weight={650}>
                  Gijol의 피드백
                </Text>
              </Group>
              <Text size="xl" align="start" p={8} pl={14}>
                10 개
              </Text>
              <Group p={8}>
                <Button
                  variant="light"
                  size="xs"
                  color="yellow"
                  fullWidth
                  onClick={() =>
                    scrollIntoView({
                      alignment: 'center',
                    })
                  }
                >
                  바로 확인하러 가기
                </Button>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>
        <Space h={24} />
        <Table
          highlightOnHover
          horizontalSpacing="lg"
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: 'inherit',
          }}
        >
          <thead
            className={classes.tableHead}
            style={{
              position: 'sticky',
              top: 0,
            }}
          >
            <tr>
              <th>영역</th>
              <th>충족도</th>
              <th>충족 여부</th>
            </tr>
          </thead>
          <tbody>{courseRows}</tbody>
        </Table>
        <Space h={16} />
      </Paper>
    </>
  );
}
