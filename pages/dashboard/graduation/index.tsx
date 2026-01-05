import React, { useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  Paper,
  SimpleGrid,
  createStyles,
  ThemeIcon,
  List,
  Progress,
  RingProgress,
  Badge,
  Accordion,
  ScrollArea,
  rem,
} from '@mantine/core';

import { extractOverallStatus, getPercentage } from '@utils/graduation/grad-formatter';
import UploadEmptyState from '@components/graduation/upload-empty-state';
import { IconAlertTriangle, IconCircleCheck, IconTrendingUp } from '@tabler/icons-react';
import { buildCourseListWithPeriod, calcAverageGrade } from '@utils/course/analytics';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';

const TOTAL_REQUIRED_CREDITS = 130;
const toOrdinal = (n: number) => {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}`;
};

export default function GraduationStatusPage() {
  const { classes } = useStyles();
  const { parsed, gradStatus } = useGraduationStore();

  if (!parsed || !gradStatus) {
    return (
      <Container fluid px={0} className={classes.page}>
        <Stack spacing="lg">
          <Group position="apart" align="flex-end" spacing="xs">
            <div>
              <Title order={2}>Academic HUD</Title>
              <Text size="sm" className={classes.muted}>
                Track your graduation progress
              </Text>
            </div>
          </Group>
          <Paper className={classes.card} p="lg">
            <UploadEmptyState />
          </Paper>
        </Stack>
      </Container>
    );
  }

  const overallProps = extractOverallStatus(gradStatus);
  const totalCreditsEarned = overallProps?.totalCredits ?? 0;
  const creditsRemaining = Math.max(0, TOTAL_REQUIRED_CREDITS - totalCreditsEarned);

  const courseListWithPeriod = useMemo(() => buildCourseListWithPeriod(parsed), [parsed]);
  const overallAverageGrade = useMemo(
    () => calcAverageGrade(courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? [])),
    [courseListWithPeriod]
  );
  const validTermGrades = courseListWithPeriod.filter((t) => t.grade && t.grade > 0);
  const gradeDelta =
    validTermGrades.length >= 2
      ? validTermGrades[validTermGrades.length - 1].grade -
        validTermGrades[validTermGrades.length - 2].grade
      : null;

  const semesterCount = courseListWithPeriod.length;
  const standingLabel =
    semesterCount >= 7
      ? '고인물'
      : semesterCount >= 5
      ? '3학년'
      : semesterCount >= 3
      ? '2학년'
      : semesterCount > 0
      ? '1학년'
      : '-';
  const semesterLabel = semesterCount ? `${toOrdinal(semesterCount)} 학기` : '-';

  const requirements =
    overallProps?.categoriesArr.map(({ domain, status }) => {
      const required = status?.minConditionCredits ?? 0;
      const earned = status?.totalCredits ?? 0;
      return {
        domain,
        required,
        earned,
        percentage: getPercentage(status),
        satisfied: status?.satisfied ?? false,
        messages: status?.messages ?? [],
        courses: status?.userTakenCoursesList?.takenCourses ?? [],
      };
    }) ?? [];
  const traits = ['글로벌 러너', '융합 지향', '꾸준한 달성가'];
  const semesterActivity = ['S1', 'S2', 'Su', 'S3', 'S4', 'S5', 'S6'];

  if (!overallProps) {
    return (
      <Container fluid px={0} className={classes.page}>
        <Stack spacing="lg">
          <Group position="apart" align="flex-end" spacing="xs">
            <div>
              <Title order={2}>졸업요건 충족 현황</Title>
              <Text size="sm" className={classes.muted}>
                졸업요건 정보가 없습니다.
              </Text>
            </div>
          </Group>
          <Paper className={classes.card} p="lg">
            <Text className={classes.muted}>졸업요건 정보가 없습니다.</Text>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return (
    <Container fluid px={0} className={classes.page}>
      <Stack spacing="lg">
        <Group position="apart" align="flex-start" spacing="sm">
          <div>
            <Title order={2}>📋 졸업요건 충족 현황</Title>
            <Text size="sm" className={classes.muted}>
              졸업요건 이수 현황을 한눈에 확인해보세요.
            </Text>
          </div>
        </Group>

        <SimpleGrid
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: 'lg', cols: 2 },
            { maxWidth: 'sm', cols: 1 },
          ]}
        >
          <Stack spacing="lg">
            <Paper className={`${classes.card} ${classes.highlightCard}`} p="lg">
              <Stack spacing="md" align="center">
                <RingProgress
                  size={230}
                  thickness={16}
                  roundCaps
                  sections={[{ value: overallProps.totalPercentage, color: '#4f46e5' }]}
                  label={
                    <Stack spacing={2} align="center">
                      <Text className={classes.progressValue}>{overallProps.totalPercentage}%</Text>
                      <Text size="xs" className={classes.muted}>
                        Complete
                      </Text>
                    </Stack>
                  }
                />
                <Stack spacing={6} align="center">
                  <Text className={classes.dDay}>D-{creditsRemaining}</Text>
                  <Text size="sm" className={classes.subLabel}>
                    Credits Remaining
                  </Text>
                </Stack>
                <div className={classes.totalPill}>
                  <Text size="sm" className={classes.muted}>
                    Total <span className={classes.pillHighlight}>{totalCreditsEarned}</span> /{' '}
                    {TOTAL_REQUIRED_CREDITS}
                  </Text>
                </div>
              </Stack>
            </Paper>

            <Paper className={classes.card} p="lg">
              <Stack spacing="sm">
                <Group position="apart" align="center" spacing="xs">
                  <Text className={classes.metricLabel}>누적 GPA</Text>
                  {gradeDelta !== null ? (
                    <Group spacing={4} align="center">
                      <IconTrendingUp size={16} color={gradeDelta >= 0 ? '#2fb344' : '#f03e3e'} />
                      <Text
                        size="sm"
                        className={gradeDelta >= 0 ? classes.deltaPositive : classes.deltaNegative}
                      >
                        {gradeDelta >= 0 ? '+' : ''}
                        {gradeDelta.toFixed(2)}
                      </Text>
                    </Group>
                  ) : (
                    <Text size="sm" className={classes.muted}>
                      최근 변화 없음
                    </Text>
                  )}
                </Group>
                <Group align="baseline" spacing={6}>
                  <Text className={classes.gpaValue}>
                    {overallAverageGrade != null ? overallAverageGrade.toFixed(2) : '-'}
                  </Text>
                  <Text size="sm" className={classes.gpaScale}>
                    / 4.5
                  </Text>
                </Group>
                <Text size="xs" className={classes.muted}>
                  누적 평균 학점을 기준으로 계산했어요.
                </Text>
              </Stack>
            </Paper>

            <Paper className={classes.card} p="lg">
              <Stack spacing="xs">
                <Text className={classes.metricLabel}>내 정보</Text>
                <div className={classes.infoRow}>
                  <Text className={classes.infoKey}>학번</Text>
                  <Text className={classes.infoValue}>{parsed.studentId ?? '-'}</Text>
                </div>
                <div className={classes.infoRow}>
                  <Text className={classes.infoKey}>구분</Text>
                  <Text className={classes.infoValue}>{standingLabel}</Text>
                </div>
                <div className={classes.infoRow}>
                  <Text className={classes.infoKey}>학기</Text>
                  <Text className={classes.infoValue}>{semesterLabel}</Text>
                </div>
              </Stack>
            </Paper>
          </Stack>

          <Paper className={`${classes.card} ${classes.requirementsCard}`} p="lg">
            <Stack spacing="md" className={classes.requirementsBody}>
              <Group position="apart" align="center" spacing="xs">
                <Text size="lg" className={classes.sectionTitle}>
                  영역별 이수 현황
                </Text>
              </Group>
              <ScrollArea
                className={classes.scrollArea}
                type="hover"
                scrollHideDelay={200}
                offsetScrollbars
                classNames={{ viewport: classes.scrollViewport }}
              >
                <Accordion chevronPosition="right" multiple={false}>
                  {requirements.map((req) => (
                    <Accordion.Item
                      key={req.domain}
                      value={req.domain}
                      className={classes.accordionItem}
                    >
                      <Accordion.Control className={classes.accordionControl}>
                        <Stack spacing={8}>
                          <Group position="apart" noWrap>
                            <Group spacing="sm" noWrap>
                              {req.satisfied ? (
                                <IconCircleCheck size={20} color="green" />
                              ) : (
                                <IconAlertTriangle size={20} color="orange" />
                              )}
                              <div>
                                <Text className={classes.accordionLabel}>{req.domain}</Text>
                              </div>
                            </Group>
                            <Text size="sm" className={classes.accordionValue}>
                              {req.earned}/{req.required || '-'}
                            </Text>
                          </Group>
                          <Stack spacing={4}>
                            <Progress value={req.percentage} size="sm" radius="lg" color="gray" />
                            <Text size="xs" className={classes.muted}>
                              {req.earned}학점 / {req.required || '-'}학점
                            </Text>
                          </Stack>
                        </Stack>
                      </Accordion.Control>
                      <Accordion.Panel className={classes.accordionPanel}>
                        <Stack spacing="md">
                          {!req.satisfied && req.messages.length > 0 && (
                            <Stack spacing={6}>
                              {req.messages.map((msg) => (
                                <Group key={msg} spacing="xs" align="flex-start">
                                  <ThemeIcon size={18} radius="xl" variant="light" color="yellow">
                                    <IconAlertTriangle size={12} />
                                  </ThemeIcon>
                                  <Text size="sm" color="yellow.9">
                                    {msg}
                                  </Text>
                                </Group>
                              ))}
                            </Stack>
                          )}

                          <Stack spacing="xs">
                            <Group spacing="xs">
                              <Text size="xs" className={classes.muted}>
                                이수 과목
                              </Text>
                              <Badge size="xs" variant="light" color="gray">
                                {req.courses.length}
                              </Badge>
                            </Group>
                            {req.courses.length > 0 ? (
                              <>
                                <div className={classes.courseHeader}>
                                  <Text>코드</Text>
                                  <Text>과목명</Text>
                                  <Text>이수학기</Text>
                                  <Text>학점</Text>
                                </div>
                                {req.courses.map((course, idx) => (
                                  <div
                                    key={`${course.courseCode}-${idx}`}
                                    className={classes.courseItem}
                                  >
                                    <Badge size="sm" radius="sm" variant="outline" color="gray">
                                      {course.courseCode ?? '-'}
                                    </Badge>
                                    <Text size="sm" fw={400} lineClamp={1}>
                                      {course.courseName ?? '-'}
                                    </Text>
                                    <Text className={classes.courseMeta}>
                                      {course.year ?? '-'} {course.semester ?? '-'}
                                    </Text>
                                    <Text size="xs" fw={400}>
                                      {course.credit ?? 0}학점
                                    </Text>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <Text size="sm" className={classes.muted}>
                                아직 등록된 과목이 없습니다.
                              </Text>
                            )}
                          </Stack>
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </ScrollArea>
            </Stack>
          </Paper>

          <Stack spacing="lg">
            <Paper className={classes.card} p="lg">
              <Stack spacing="md">
                <Group position="apart" align="center" spacing="xs">
                  <Text size="lg" className={classes.sectionTitle}>
                    My Key Traits
                  </Text>
                </Group>
                <List spacing="xs">
                  {traits.map((trait) => (
                    <List.Item key={trait} className={classes.listItem}>
                      {trait}
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </Paper>

            <Paper className={classes.card} p="lg">
              <Stack spacing="md">
                <Group position="apart" align="center" spacing="xs">
                  <Text size="lg" className={classes.sectionTitle}>
                    학기 활동
                  </Text>
                </Group>
                <div className={classes.pillRow}>
                  {semesterActivity.map((label) => (
                    <div key={label} className={classes.pill}>
                      {label}
                    </div>
                  ))}
                </div>
              </Stack>
            </Paper>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

const useStyles = createStyles((theme) => ({
  page: {
    paddingTop: theme.spacing.xl as unknown as number,
    paddingBottom: (theme.spacing.xl as unknown as number) * 2,
    paddingLeft: 0,
    paddingRight: 0,
  },
  card: {
    border: '1px solid #e2e8f0',
    backgroundColor: theme.white,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    borderRadius: theme.radius.md,
  },
  highlightCard: {
    borderColor: theme.colors.gray[3],
  },
  requirementsCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  requirementsBody: {
    flex: 1,
  },
  scrollArea: {
    maxHeight: '70vh',
  },
  scrollViewport: {
    paddingRight: rem(8),
  },
  progressValue: {
    fontWeight: 800,
    fontSize: rem(32),
    lineHeight: 1.1,
  },
  dDay: {
    fontWeight: 700,
    fontSize: rem(22),
    letterSpacing: '-0.01em',
  },
  subLabel: {
    color: theme.colors.gray[6],
    letterSpacing: '0.02em',
  },
  totalPill: {
    padding: theme.spacing.xs,
    borderRadius: 999,
    border: `1px solid ${theme.colors.gray[2]}`,
    backgroundColor: theme.colors.gray[0],
  },
  pillHighlight: {
    color: theme.colors.indigo[6],
    fontWeight: 800,
  },
  metricLabel: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    color: theme.colors.gray[6],
    fontSize: theme.fontSizes.xs,
  },
  gpaValue: {
    fontWeight: 800,
    fontSize: rem(28),
    lineHeight: 1.1,
  },
  gpaScale: {
    color: theme.colors.gray[6],
    fontWeight: 600,
  },
  deltaPositive: {
    color: theme.colors.green[6],
    fontWeight: 700,
  },
  deltaNegative: {
    color: theme.colors.red[6],
    fontWeight: 700,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm}px 0`,
    borderBottom: `1px solid ${theme.colors.gray[2]}`,
    '&:last-of-type': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
  },
  infoKey: {
    color: theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
  },
  infoValue: {
    fontWeight: 700,
    color: theme.black,
  },
  sectionTitle: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  muted: {
    color: theme.colors.gray[6],
  },
  statCard: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    rowGap: rem(6),
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[6],
  },
  statValue: {
    fontWeight: 700,
    fontSize: rem(20),
    color: theme.black,
    lineHeight: 1.2,
  },
  accordionItem: {
    border: `1px solid ${theme.colors.gray[3]}`,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.white,
    transition: 'box-shadow 120ms ease',
    '&:hover': {
      boxShadow: '0 6px 12px rgba(15, 23, 42, 0.08)',
    },
    '& + &': {
      marginTop: theme.spacing.sm,
    },
  },
  accordionControl: {
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
  },
  accordionLabel: {
    fontWeight: 700,
  },
  accordionValue: {
    fontWeight: 600,
    color: theme.colors.gray[7],
  },
  accordionPanel: {
    padding: `${theme.spacing.md}px ${theme.spacing.md}px`,
    borderTop: `1px solid ${theme.colors.gray[2]}`,
  },
  courseItem: {
    display: 'grid',
    gridTemplateColumns: '64px 1fr 120px 60px',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.sm,
  },
  courseMeta: {
    color: theme.colors.gray[6],
    fontSize: theme.fontSizes.xs,
  },
  courseHeader: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 120px 60px',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    color: theme.colors.gray[6],
    fontSize: theme.fontSizes.xs,
    fontWeight: 600,
  },
  listItem: {
    color: theme.colors.gray[7],
    fontWeight: 500,
    borderRadius: theme.radius.md,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
  },
  pillRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
    gap: theme.spacing.xs,
  },
  pill: {
    borderRadius: theme.radius.md,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    backgroundColor: theme.colors.gray[0],
    border: `1px solid ${theme.colors.gray[2]}`,
    textAlign: 'center',
    fontWeight: 600,
    color: theme.colors.gray[7],
  },
}));
