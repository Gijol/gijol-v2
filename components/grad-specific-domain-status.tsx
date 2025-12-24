import {
  Accordion,
  Alert,
  Badge,
  Box,
  Card,
  createStyles,
  Divider,
  Flex,
  Group,
  Paper,
  RingProgress,
  ScrollArea,
  Space,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { SingleCategoryType } from '../lib/types/grad';
import { createSpecificStatusMessage, getDomainColor } from '@utils/graduation/grad-formatter';
import { matches } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';

export default function GradSpecificDomainStatus({
  specificDomainStatusArr,
}: {
  specificDomainStatusArr: { domain: string; status: SingleCategoryType | undefined }[];
}) {
  const matches = useMediaQuery(`(min-width: 48em)`);
  const { classes } = useStyles();
  return (
    <>
      {specificDomainStatusArr.map((category) => {
        const domainName = category.domain;
        const { minConditionCredits, totalCredits, satisfied, messages } =
          category.status as SingleCategoryType;
        const temp = Math.round((totalCredits * 100) / minConditionCredits);
        const percentage = totalCredits === 0 ? 0 : temp >= 100 ? 100 : temp;

        const elements = category.status?.userTakenCoursesList.takenCourses;
        const rows = elements?.map((element) => {
          return (
            <tr key={`${category.domain} ${element.semester} ${element.courseName}`}>
              <td>
                {element.year} {element.semester}
              </td>
              <td>{element.courseCode}</td>
              <td>
                <Group>
                  {element.courseName}{' '}
                  {element.courseType && <Badge size="xs">{element.courseType}</Badge>}
                </Group>
              </td>
              <td>{element.credit}</td>
            </tr>
          );
        });

        return (
          <Accordion
            key={`${category.domain} ${category.status?.satisfied}`}
            variant="contained"
            radius="md"
            defaultValue="customization"
            my={16}
            styles={{
              chevron: { marginLeft: matches ? 20 : 4 },
              content: { padding: matches ? 16 : 0 },
            }}
          >
            <Accordion.Item value={domainName}>
              <Accordion.Control p={matches ? 'md' : 'xs'}>
                <Group position="apart">
                  <Group>
                    <Text w="fit-content" size={matches ? 'xl' : 'md'} weight={500}>
                      {domainName}
                    </Text>
                    <Badge
                      color={satisfied ? 'green' : category.domain === '부전공' ? 'blue' : 'red'}
                      variant="dot"
                      size={matches ? 'lg' : 'md'}
                    >
                      {minConditionCredits}학점 중 {totalCredits}학점
                    </Badge>
                  </Group>
                  <RingProgress
                    roundCaps
                    size={matches ? 64 : 48}
                    thickness={matches ? 4 : 3}
                    sections={[
                      {
                        value: percentage,
                        color: getDomainColor(domainName),
                        tooltip: `${minConditionCredits}학점 중 ${totalCredits}학점`,
                      },
                    ]}
                    label={
                      <Text
                        fz={matches ? 'md' : 'sm'}
                        align="center"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
                      >
                        {percentage}
                      </Text>
                    }
                  />
                </Group>
              </Accordion.Control>
              <Accordion.Panel className={classes.background} h="fit-content">
                <Stack miw={200} w="100%" mb={40}>
                  <Title order={matches ? 3 : 4}>요구사항</Title>
                  <ScrollArea mah={280} h="fit-content">
                    <Space h={16} />
                    {satisfied && (
                      <Alert
                        icon={<IconCircleCheck size="1rem" />}
                        color="green"
                        className={classes.alert}
                      >
                        모든 요건들을 충족했습니다! ✨
                      </Alert>
                    )}
                    {!satisfied &&
                      messages.map((message) => {
                        return (
                          <Alert
                            key={`${message.length} ${message}`}
                            icon={<IconAlertCircle size="1rem" />}
                            className={classes.alert}
                            color="red"
                            my={8}
                          >
                            {message}
                          </Alert>
                        );
                      })}
                  </ScrollArea>
                </Stack>
                <Stack h="fit-content">
                  <Title order={matches ? 3 : 4}>수강한 강의 목록</Title>
                  <div className={classes.tableBorder}>
                    <Table
                      highlightOnHover
                      w="100%"
                      horizontalSpacing={matches ? 'lg' : 'sm'}
                      verticalSpacing={matches ? 'sm' : 'xs'}
                    >
                      <thead className={classes.tableHead}>
                        <tr>
                          <th className={classes.tableCell} style={{ minWidth: 120 }}>
                            수강학기
                          </th>
                          <th className={classes.tableCell} style={{ minWidth: 100 }}>
                            강의코드
                          </th>
                          <th className={classes.tableCell} style={{ minWidth: 220 }}>
                            강의명
                          </th>
                          <th className={classes.tableCell}>학점</th>
                        </tr>
                      </thead>
                      <tbody>{rows}</tbody>
                      <tfoot>
                        <tr>
                          <th>합계</th>
                          <th></th>
                          <th></th>
                          <th style={{ fontWeight: 500, minWidth: 80 }}>{totalCredits} 학점</th>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>

                  {elements?.length === 0 && (
                    <Text align="center" color="dimmed" my="xl" fw={500}>
                      수강하신 강의가 없습니다!
                    </Text>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </>
  );
}

const useStyles = createStyles((theme) => ({
  tableHead: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    borderRadius: theme.radius.md,
  },
  background: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark : theme.white,
    borderBottomRightRadius: '0.5rem',
    borderBottomLeftRadius: '0.5rem',
    padding: theme.spacing.xl,
    '@media (max-width: 48em)': {
      padding: theme.spacing.xs,
    },
  },
  alert: {
    borderRadius: '0.5rem',
    border: '1px solid',
    '@media (max-width: 48em)': {
      padding: theme.spacing.xs,
    },
  },
  tableBorder: {
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    overflowX: 'auto',
  },
  tableCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));
