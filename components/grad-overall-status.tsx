import {
  Badge,
  Button,
  Card,
  createStyles,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Space,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconBolt, IconPresentationAnalytics, IconReportAnalytics } from '@tabler/icons-react';
import { getStatusColor, getStatusMessage } from '../lib/utils/graduation/grad-formatter';

export default function GradOverallStatus({
  scrollIntoView,
  totalCredits,
  totalPercentage,
  overallStatus,
  minDomain,
  minDomainPercentage,
  feedbackNumbers,
}: {
  scrollIntoView: any;
  totalCredits: number | undefined;
  totalPercentage: number;
  overallStatus: { title: string; percentage: number; satisfied: boolean | undefined }[];
  minDomain: string;
  minDomainPercentage: number;
  feedbackNumbers: number;
}) {
  const { classes } = useStyles();
  const courseRows = overallStatus.map((element) => (
    <tr key={element.title}>
      <td width={280}>
        <Text size="md" weight={400}>
          {element.title}
        </Text>
      </td>
      <td width={280}>
        <Progress
          value={element.percentage}
          label={`${element.percentage}%`}
          size="xl"
          color="blue.4"
        />
      </td>
      <td>
        <Badge color={getStatusColor(element.satisfied, element.title)} variant="dot" size="lg">
          {getStatusMessage(element.satisfied, element.title)}
        </Badge>
      </td>
    </tr>
  ));
  return (
    <>
      <SimpleGrid
        breakpoints={[
          { minWidth: 'md', cols: 3, spacing: 'md' },
          { minWidth: 'sm', cols: 2, spacing: 'md' },
          { minWidth: 'xs', cols: 1, spacing: 'md' },
        ]}
      >
        <Card h="160" radius="md" withBorder>
          <Card.Section withBorder py="sm" px="md">
            <Group position="apart">
              <Text size="md" weight={500}>
                총 학점
              </Text>
              <ThemeIcon variant="subtle" size="md" color="dark">
                <IconPresentationAnalytics />
              </ThemeIcon>
            </Group>
          </Card.Section>
          <Card.Section component={Stack} px="md" py="sm" justify="space-between">
            <Text size="xl" align="start" py="sm">
              {totalCredits} 학점
            </Text>
            <Group>
              <Text size="md" color="dimmed" weight={500}>
                총 학점 : 130
              </Text>
              <Badge>{totalPercentage}% 이수중</Badge>
            </Group>
          </Card.Section>
        </Card>
        <Card h={160} radius="md" withBorder>
          <Card.Section withBorder py="sm" px="md">
            <Group position="apart">
              <Text size="md" weight={500}>
                최저 이수 영역
              </Text>
              <ThemeIcon variant="subtle" size="md" color="dark">
                <IconReportAnalytics />
              </ThemeIcon>
            </Group>
          </Card.Section>
          <Card.Section component={Stack} px="md" py="sm" justify="space-between">
            <Text size="xl" align="start" py="sm">
              {minDomain}
            </Text>
            <Group>
              <Badge color="orange">{minDomainPercentage}% 이수중</Badge>
            </Group>
          </Card.Section>
        </Card>
        <Paper radius="md" h={160} p={8} className={classes.feedback}>
          <Group p={8} position="apart">
            <Text size="md" weight={500}>
              Gijol의 피드백
            </Text>
            <IconBolt color="#FCC419" />
          </Group>
          <Text size="xl" align="start" p={8} pl={14}>
            {feedbackNumbers} 개
          </Text>
          <Group p={8}>
            <Button
              variant="outline"
              size="sm"
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
      </SimpleGrid>
      <Space h={24} />
      <div className={classes.tableBorder}>
        <Table
          highlightOnHover
          horizontalSpacing="lg"
          verticalSpacing="sm"
          className={classes.table}
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
      </div>
      <Space h={16} />
    </>
  );
}

const useStyles = createStyles((theme) => ({
  background: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark : theme.white,
    borderBottomRightRadius: '0.5rem',
    borderBottomLeftRadius: '0.5rem',
  },
  table: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'inherit',
  },
  tableHead: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    borderRadius: theme.radius.md,
  },
  tableBorder: {
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  feedback: {
    border: `2px solid ${theme.colors.orange[4]}`,
    backgroundColor: 'transparent',
    boxShadow: `0 0 16px 2px ${theme.colors.orange[1]}`,
  },
}));
