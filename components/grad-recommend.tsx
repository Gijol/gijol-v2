import {
  Alert,
  Badge,
  Box,
  createStyles,
  Divider,
  Group,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconListCheck,
  IconTargetArrow,
} from '@tabler/icons-react';
import type { SingleCategoryType } from '@lib/types/grad';
import {
  getDomainColor,
  verifyStatus,
  getPercentage, // 필요하면 grad-formatter에서 export 하거나, 아래에서 직접 계산해도 됨
} from '@utils/graduation/grad-formatter';
import { useMediaQuery } from '@mantine/hooks';

type Props = {
  specificDomainStatusArr: { domain: string; status: SingleCategoryType | undefined }[];
};

export default function GradRecommend({ specificDomainStatusArr }: Props) {
  const { classes } = useStyles();
  const matches = useMediaQuery('(min-width: 48em)');

  if (!specificDomainStatusArr || specificDomainStatusArr.length === 0) {
    return null;
  }

  return (
    <Paper withBorder radius="md" p={matches ? 'lg' : 'md'} className={classes.wrapper}>
      <Tabs
        orientation="horizontal"
        defaultValue={specificDomainStatusArr[0]?.domain}
        variant="default"
        keepMounted={false}
      >
        <Tabs.List>
          {specificDomainStatusArr.map((category) => {
            const status = verifyStatus(category.status?.satisfied, category.domain);

            return (
              <Tabs.Tab key={category.domain} value={category.domain}>
                <Group spacing={6} noWrap>
                  <Text>{category.domain}</Text>
                  {status === 'satisfied' ? (
                    <IconCircleCheck size="1.2rem" color="#40c057" stroke={1.6} />
                  ) : status === 'unSatisfied' ? (
                    <IconAlertTriangle size="1.2rem" color="#fa5252" stroke={1.6} />
                  ) : (
                    <IconAlertCircle size="1.2rem" color="#228be6" stroke={1.6} />
                  )}
                </Group>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        {specificDomainStatusArr.map((category) => {
          const status = category.status;
          const statusType = verifyStatus(status?.satisfied, category.domain);
          const domainColor = getDomainColor(category.domain);

          const minCredits = status?.minConditionCredits ?? 0;
          const totalCredits = status?.totalCredits ?? 0;
          const percentage =
            minCredits > 0 ? Math.min(100, Math.round((totalCredits * 100) / minCredits)) : 0;

          const messages = status?.messages ?? [];

          const hasMessages = messages.length > 0;

          // 우선순위 1순위: 첫 번째 메시지
          const primaryMessage = hasMessages ? messages[0] : null;
          const secondaryMessages = hasMessages ? messages.slice(1) : [];

          return (
            <Tabs.Panel key={category.domain} value={category.domain} mt="md">
              {/* 상단 요약 영역 */}
              <Group position="apart" align="flex-start" spacing={matches ? 'lg' : 'sm'} mb="md">
                <Stack spacing={4}>
                  <Group spacing="xs">
                    <Text fw={600} fz={matches ? 'lg' : 'md'}>
                      {category.domain}
                    </Text>
                    <Badge
                      color={
                        statusType === 'satisfied'
                          ? 'green'
                          : statusType === 'unSatisfied'
                          ? 'red'
                          : 'blue'
                      }
                      variant="light"
                    >
                      {statusType === 'satisfied'
                        ? '충족됨'
                        : statusType === 'unSatisfied'
                        ? '부족'
                        : '선택 사항'}
                    </Badge>
                  </Group>

                  <Group spacing="xs">
                    <Text fz={matches ? 'sm' : 'xs'} c="dimmed">
                      {minCredits > 0
                        ? `${minCredits}학점 필요 중 ${totalCredits}학점 이수`
                        : `총 ${totalCredits}학점 이수`}
                    </Text>
                    {minCredits > 0 && (
                      <Badge size="sm" variant="outline" color={domainColor}>
                        {percentage}% 진행
                      </Badge>
                    )}
                  </Group>
                </Stack>

                {minCredits > 0 && (
                  <Box className={classes.progressWrapper}>
                    <Text fz={matches ? 'xs' : 10} c="dimmed" mb={4} align="right">
                      이수 진행률
                    </Text>
                    <Progress
                      value={percentage}
                      label={`${percentage}%`}
                      size="xl"
                      radius="xl"
                      color={domainColor}
                      animate
                      w={matches ? 200 : 140}
                    />
                  </Box>
                )}
              </Group>

              <Divider my="sm" />

              {/* 피드백 / 추천 영역 */}
              <Stack spacing="sm">
                {/* 1) 전체 상태 요약 메시지 */}
                {statusType === 'satisfied' && (
                  <Alert
                    icon={<IconCircleCheck size="1rem" />}
                    color="green"
                    className={classes.alert}
                  >
                    모든 요건을 충족했습니다! 🎉 이 영역은 더 이상 신경 쓰지 않아도 괜찮아요.
                  </Alert>
                )}

                {statusType === 'notRequired' && (
                  <Alert
                    icon={<IconAlertCircle size="1rem" />}
                    color="blue"
                    className={classes.alert}
                  >
                    부전공 등 선택 영역입니다. 관심이 있다면 해당 영역의 과목을 추가로 이수해
                    보세요.
                  </Alert>
                )}

                {statusType === 'unSatisfied' && !hasMessages && (
                  <Alert
                    icon={<IconAlertTriangle size="1rem" />}
                    color="red"
                    className={classes.alert}
                  >
                    아직 이 영역의 졸업요건을 충족하지 못했습니다. 아래 요건을 다시 확인해 주세요.
                  </Alert>
                )}

                {/* 2) 우선순위 추천 (맨 앞 메세지 하나 강조) */}
                {primaryMessage && statusType === 'unSatisfied' && (
                  <Paper
                    radius="md"
                    withBorder
                    p={matches ? 'sm' : 'xs'}
                    className={classes.primaryCard}
                  >
                    <Group align="flex-start" spacing="sm" noWrap>
                      <ThemeIcon radius="xl" size={32} color={domainColor} variant="light">
                        <IconTargetArrow size="1.2rem" />
                      </ThemeIcon>
                      <Box>
                        <Text fw={600} fz={matches ? 'sm' : 'xs'} mb={2}>
                          지금 가장 먼저 할 일
                        </Text>
                        <Text fz={matches ? 'sm' : 'xs'}>{primaryMessage}</Text>
                      </Box>
                    </Group>
                  </Paper>
                )}

                {/* 3) 나머지 추천/피드백 리스트 */}
                {secondaryMessages.length > 0 && (
                  <Box>
                    <Group spacing={6} mb={4}>
                      <ThemeIcon radius="xl" size={24} color={domainColor} variant="subtle">
                        <IconListCheck size="1rem" />
                      </ThemeIcon>
                      <Text fw={500} fz={matches ? 'sm' : 'xs'}>
                        추가로 이런 것들을 확인해보세요
                      </Text>
                    </Group>
                    <ScrollArea h={180}>
                      <Stack spacing={6}>
                        {secondaryMessages.map((msg, idx) => (
                          <Group
                            key={`${category.domain}-${idx}`}
                            align="flex-start"
                            spacing={8}
                            noWrap
                          >
                            <Text
                              fz={matches ? 'xs' : 10}
                              fw={600}
                              c="dimmed"
                              className={classes.index}
                            >
                              {idx + 2}
                            </Text>
                            <Text fz={matches ? 'sm' : 'xs'}>{msg}</Text>
                          </Group>
                        ))}
                      </Stack>
                    </ScrollArea>
                  </Box>
                )}

                {/* 메시지가 아예 없는 경우 (데이터가 없거나 아직 규칙이 적지 않은 영역) */}
                {!hasMessages && statusType !== 'satisfied' && statusType !== 'notRequired' && (
                  <Text fz={matches ? 'sm' : 'xs'} c="dimmed">
                    이 영역에 대한 상세 피드백이 아직 없습니다. 학사편람과 졸업요건 표를 함께 확인해
                    주세요.
                  </Text>
                )}
              </Stack>
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </Paper>
  );
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor: 'transparent',
  },
  alert: {
    borderRadius: '0.5rem',
    border: '1px solid',
    '@media (max-width: 48em)': {
      padding: theme.spacing.xs,
    },
  },
  primaryCard: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.yellow[0],
    borderColor: theme.colors.yellow[4],
  },
  progressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  index: {
    width: 18,
    textAlign: 'right',
  },

  // Tab Panel (내용 영역)
  panel: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },
}));
