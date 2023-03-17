import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { gradStatus } from '../../lib/atoms/gradStatus';
import {
  Accordion,
  Container,
  Group,
  Paper,
  Progress,
  Space,
  Text,
  Badge,
  RingProgress,
  Table,
  ScrollArea,
  createStyles,
  Alert,
  Grid,
  ThemeIcon,
  Button,
  Tabs,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconPresentationAnalytics,
  IconReportAnalytics,
  IconBolt,
  IconPhoto,
  IconMessageCircle,
  IconSettings,
} from '@tabler/icons-react';
import { useScrollIntoView } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  tableHead: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },
  background: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark : theme.white,
  },
}));

export default function Result() {
  const status = useRecoilValue(gradStatus);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });

  const { classes } = useStyles();

  useEffect(() => {
    console.log(status);
  }, [status]);

  const domains = [
    { percentage: 80, satisfied: false, name: '언어와 기초' },
    { percentage: 100, satisfied: true, name: '기초과학' },
    { percentage: 60, satisfied: false, name: '인문사회' },
    { percentage: 60, satisfied: false, name: '전공' },
    { percentage: 80, satisfied: false, name: '부전공' },
    { percentage: 40, satisfied: false, name: '연구 및 기타' },
    { percentage: 80, satisfied: false, name: '자유학점' },
  ];

  const elements = [
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
  ];

  const rows = elements.map((element, index) => (
    <tr key={index}>
      <td>{element.position}</td>
      <td>{element.name}</td>
      <td>{element.symbol}</td>
      <td>{element.mass}</td>
    </tr>
  ));

  const courseRows = domains.map((element, index) => (
    <tr key={index}>
      <td>{element.name}</td>
      <td>
        <Progress value={element.percentage} label={`${element.percentage}%`} size="xl" />
      </td>
      <td>
        <Badge color={element.satisfied ? 'green' : 'pink'}>
          {element.satisfied ? 'true' : 'false'}
        </Badge>
      </td>
    </tr>
  ));

  return (
    <Container>
      <h1>졸업요건 현황</h1>
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
      <Space h={40} />
      <h1>영역별 세부 현황</h1>
      <Space h={16} />
      <Accordion variant="contained" radius="md" defaultValue="customization">
        <Accordion.Item value="언어와 기초">
          <Accordion.Control>
            <Group>
              <Text w="fit-content">언어와 기초</Text>
              <Badge color="pink">unsatisfied</Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel py={16} className={classes.background}>
            <Container
              sx={{
                padding: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <RingProgress
                roundCaps
                size={280}
                sections={[{ value: 50, color: 'green', tooltip: '25학점' }]}
                label={
                  <Text align="center" px="xs">
                    언어와 기초 총학점
                  </Text>
                }
              />
              <Container px={32} w="100%">
                <ScrollArea h={280}>
                  <Space h={16} />
                  <Alert icon={<IconCircleCheck size="1rem" />} title="충족 요건" color="red">
                    130 학점을 넘어야 합니다!
                  </Alert>
                  <Space h={16} />
                  <Alert icon={<IconAlertCircle size="1rem" />} title="충족 요건" color="green">
                    모든 요건들을 충족했습니다! ✨
                  </Alert>
                  <Space h={16} />
                  <Alert icon={<IconAlertCircle size="1rem" />} title="충족 요건" color="green">
                    모든 요건들을 충족했습니다! ✨
                  </Alert>
                  <Space h={16} />
                  <Alert icon={<IconAlertCircle size="1rem" />} title="충족 요건" color="green">
                    모든 요건들을 충족했습니다! ✨
                  </Alert>
                </ScrollArea>
              </Container>
            </Container>
            <Space h={32} />
            <ScrollArea sx={{ width: '100%', backgroundColor: 'unset' }} h={300}>
              <Container
                sx={{ margin: 0, width: '100%', height: 'inherit', backgroundColor: 'inherit' }}
                px={32}
                py={0}
              >
                <Table
                  highlightOnHover
                  sx={{
                    position: 'relative',
                    width: 'inherit',
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
                      <th>수강학기</th>
                      <th>강의코드</th>
                      <th>강의명</th>
                      <th>학점</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </Container>
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Space h={16} />
      <Accordion variant="contained">
        <Accordion.Item value="인문사회">
          <Accordion.Control>
            <Group>
              <Text w="fit-content">인문 사회</Text>
              <Badge color="green">completed</Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>인문사회 내용</Text>
            <Space h={16} />
            <Progress value={100} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Space h={16} />
      <Accordion variant="contained">
        <Accordion.Item value="기초 과학">
          <Accordion.Control>
            <Group>
              <Text w="fit-content">기초과학</Text>
              <Badge color="pink">unsatisfied</Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>기초과학 내용</Text>
            <Space h={16} />
            <Progress value={40} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Space h={16} />
      <h1 ref={targetRef}>Gijol의 추천 목록</h1>
      <Paper withBorder py={32} px={16} radius="md" shadow="xs">
        <Tabs orientation="vertical" defaultValue="언어와 기초" h={300}>
          <Tabs.List>
            <Tabs.Tab value="언어와 기초" color="green">
              언어와 기초
            </Tabs.Tab>
            <Tabs.Tab value="기초과학">기초과학</Tabs.Tab>
            <Tabs.Tab value="인문사회" color="yellow">
              인문사회
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="언어와 기초" pl="md">
            <ScrollArea h={300}>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" color="green" my={8}>
                A 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" color="green" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" color="green" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" color="green" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" color="green" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" color="green" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="기초과학" pl="md">
            <ScrollArea h={300}>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" my={8}>
                A 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
              <Alert icon={<IconAlertCircle size="1rem" />} title="" my={8}>
                B 강의를 수강해야 합니다
              </Alert>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="인문사회" pl="md">
            인문사회
          </Tabs.Panel>
        </Tabs>
      </Paper>
      <Space h={80} />
    </Container>
  );
}
