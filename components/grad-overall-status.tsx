// components/grad-overall-status.tsx (기존 파일 교체)

import {
  Badge,
  Button,
  Card,
  createStyles,
  Group,
  Paper,
  Progress,
  RingProgress,
  SimpleGrid,
  Space,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconBolt, IconPresentationAnalytics, IconReportAnalytics } from '@tabler/icons-react';
import { getStatusColor, getStatusMessage } from '@utils/graduation/grad-formatter';
import { useMediaQuery } from '@mantine/hooks';

type OverallDomain = {
  title: string;
  percentage: number;
  satisfied: boolean | undefined;
};

type Props = {
  scrollIntoView: (options?: any) => void;
  totalCredits: number | undefined;
  totalPercentage: number;
  overallStatus: OverallDomain[];
  minDomain: string;
  minDomainPercentage: number;
  feedbackNumbers: number;
};

export default function GradOverallStatus({
  scrollIntoView,
  totalCredits,
  totalPercentage,
  overallStatus,
  minDomain,
  minDomainPercentage,
  feedbackNumbers,
}: Props) {
  const matches = useMediaQuery(`(min-width: 48em)`);
  const { classes } = useStyles();

  const courseRows = overallStatus.map((element) => (
    <tr key={element.title}>
      <td>
        <Text className={classes.text_md_sm} fw={400}>
          {element.title}
        </Text>
      </td>
      <td className={classes.progressCell}>
        <Progress
          value={element.percentage}
          label={`${element.percentage}%`}
          size={18}
          radius="xl"
          color="indigo.4"
        />
      </td>
      <td className={classes.statusCell}>
        <Text size={matches ? 'lg' : 'md'}>
          {getStatusMessage(element.satisfied, element.title)}
        </Text>
      </td>
    </tr>
  ));

  return (
    <>
      <SimpleGrid
        cols={3}
        spacing="md"
        breakpoints={[
          { maxWidth: 'md', cols: 2 },
          { maxWidth: 'sm', cols: 1 },
        ]}
      >
        {/* 총 학점 카드 */}
        <Card radius="md" withBorder className={classes.card}>
          <Card.Section inheritPadding withBorder py="sm" px="md">
            <Group position="apart">
              <Text className={classes.text_md_sm} fw={600}>
                총 학점
              </Text>
              <ThemeIcon variant="subtle" size="md" color="dark">
                <IconPresentationAnalytics />
              </ThemeIcon>
            </Group>
          </Card.Section>
          <Card.Section component="div" px="md" py="sm">
            <Stack justify="space-between" h="auto">
              <Text size="xl" fw={600} pb="xs">
                {totalCredits ?? 0} 학점
              </Text>

              <Group position="apart">
                <Text size="sm" c="dimmed">
                  기준 학점 : 130
                </Text>
                <Badge variant="outline">{totalPercentage}% 이수중</Badge>
              </Group>
            </Stack>
          </Card.Section>
        </Card>

        {/* 최저 이수 영역 카드 */}
        <Card radius="md" withBorder className={classes.card}>
          <Card.Section inheritPadding withBorder py="sm" px="md">
            <Group position="apart">
              <Text className={classes.text_md_sm} fw={600}>
                최저 이수 영역
              </Text>
              <ThemeIcon variant="subtle" size="md" color="dark">
                <IconReportAnalytics />
              </ThemeIcon>
            </Group>
          </Card.Section>
          <Card.Section inheritPadding px="md" py="sm">
            <Stack>
              <Text size="xl" fw={600} pt={matches ? 'sm' : 4} pb="xs">
                {minDomain}
              </Text>
              <Group position="apart">
                <Text size="xs" c="dimmed" mb={4}>
                  이 영역을 우선적으로 채우는 것이 좋아요.
                </Text>
                <Badge color="orange" variant="outline">
                  {minDomainPercentage}% 이수중
                </Badge>
              </Group>
            </Stack>
          </Card.Section>
        </Card>

        {/* 피드백 카드 */}
        <Paper radius="md" p="sm" className={classes.feedback}>
          <Group position="apart" align="flex-start" mb="xs">
            <Text className={classes.text_md_sm} fw={600}>
              Gijol의 피드백
            </Text>
            <IconBolt color="#FCC419" />
          </Group>
          <Text size="xl" pb="xs">
            {feedbackNumbers} 개
          </Text>
          <Text size="xs" c="dimmed" mb="xs">
            부족한 영역을 중심으로 정리된 추천 사항이에요.
          </Text>
          <Button
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange' }}
            size={matches ? 'sm' : 'xs'}
            fullWidth
            onClick={() =>
              scrollIntoView({
                alignment: 'center',
              })
            }
            sx={{
              fontWeight: 700,
              animation: 'pulse 1.8s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(252, 196, 25, 0.6)' }, // yellow[4] with opacity
                '70%': { boxShadow: '0 0 0 12px rgba(252, 196, 25, 0)' }, // fades out
                '100%': { boxShadow: '0 0 0 0 rgba(252, 196, 25, 0)' },
              },
            }}
          >
            추천 / 피드백 보러가기
          </Button>
        </Paper>
      </SimpleGrid>

      <Space h={24} />

      {/* 전체 영역 테이블 */}
      <div className={classes.tableBorder}>
        <Table
          highlightOnHover
          horizontalSpacing={matches ? 'lg' : 'sm'}
          verticalSpacing={matches ? 'sm' : 'xs'}
          className={classes.table}
        >
          <thead className={classes.tableHead}>
            <tr>
              <th className={classes.tableCell} style={{ minWidth: 100 }}>
                영역
              </th>
              <th className={classes.tableCell}>충족도</th>
              <th className={classes.tableCell}>충족 여부</th>
            </tr>
          </thead>
          <tbody>{courseRows}</tbody>
        </Table>
      </div>

      <Space h={16} />
    </>
  );
}

const useStyles = createStyles((theme) => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  background: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    borderBottomRightRadius: '0.5rem',
    borderBottomLeftRadius: '0.5rem',
  },
  table: {
    width: '100%',
    backgroundColor: 'inherit',
  },
  tableHead: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },
  tableBorder: {
    border: '1px solid #dee2e6',
    borderRadius: theme.radius.md,
    overflowX: 'auto',
  },
  feedback: {
    border: `2px solid ${theme.colors.orange[4]}`,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    boxShadow: `0 0 16px 2px ${theme.colors.orange[1]}`,
  },
  tableCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: theme.fontSizes.sm,
  },
  text_md_sm: {
    fontSize: theme.fontSizes.md,
    '@media (max-width:48em)': {
      fontSize: theme.fontSizes.sm,
    },
  },
  text_xl_md: {
    fontSize: theme.fontSizes.xl,
    '@media (max-width:48em)': {
      fontSize: theme.fontSizes.md,
    },
  },
  text_sm_xs: {
    fontSize: theme.fontSizes.sm,
    '@media (max-width:48em)': {
      fontSize: theme.fontSizes.xs,
    },
  },
  progressCell: {
    minWidth: 220,
    verticalAlign: 'middle',
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  statusCell: {
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  },
}));
