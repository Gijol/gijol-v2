import {
  Accordion,
  Alert,
  Badge,
  Box,
  Flex,
  Group,
  RingProgress,
  ScrollArea,
  Space,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { SingleCategoryType } from '../lib/types/grad';
import {
  createSpecificStatusMessage,
  getDomainColor,
} from '../lib/utils/graduation/grad-formatter';

export default function GradSpecificDomainStatus({
  classes,
  specificDomainStatusArr,
}: {
  classes: any;
  specificDomainStatusArr: { domain: string; status: SingleCategoryType | undefined }[];
}) {
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
          >
            <Accordion.Item value={domainName}>
              <Accordion.Control>
                <Group>
                  <Text w="fit-content">{domainName}</Text>
                  <Badge
                    color={satisfied ? 'green' : category.domain === '부전공' ? 'blue' : 'red'}
                  >
                    {satisfied ? '충족' : category.domain === '부전공' ? '필수 아님' : '미충족'}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel py={16} className={classes.background} h="fit-content">
                <Flex direction="row" wrap="wrap">
                  <RingProgress
                    mx="md"
                    roundCaps
                    size={260}
                    sections={[
                      {
                        value: percentage,
                        color: getDomainColor(domainName),
                        tooltip: `${minConditionCredits}학점 중 ${totalCredits}학점`,
                      },
                    ]}
                    label={
                      <>
                        <Text
                          align="center"
                          px={32}
                          sx={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
                        >
                          {createSpecificStatusMessage(
                            satisfied,
                            percentage,
                            minConditionCredits,
                            totalCredits
                          )}
                        </Text>
                        <Text align="center">
                          <Badge variant="outline">
                            {minConditionCredits}학점 중 {totalCredits}학점 이수
                          </Badge>
                        </Text>
                      </>
                    }
                  />
                  <Stack miw={200} w={500} mx="auto">
                    <ScrollArea mah={280} h="fit-content">
                      <Space h={16} />
                      {satisfied && (
                        <Alert icon={<IconCircleCheck size="1rem" />} title="완료!" color="green">
                          모든 요건들을 충족했습니다! ✨
                        </Alert>
                      )}
                      {!satisfied &&
                        messages.map((message) => {
                          return (
                            <Alert
                              key={`${message.length} ${message}`}
                              icon={<IconAlertCircle size="1rem" />}
                              title="충족 요건"
                              color="red"
                              my={8}
                            >
                              {message}
                            </Alert>
                          );
                        })}
                    </ScrollArea>
                  </Stack>
                </Flex>
                <Space h={32} />
                <Box h="fit-content">
                  <Table highlightOnHover w="100%">
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
                    <tfoot>
                      <tr>
                        <th>합계</th>
                        <th></th>
                        <th></th>
                        <th style={{ fontWeight: 500 }}>{totalCredits} 학점</th>
                      </tr>
                    </tfoot>
                  </Table>
                  {elements?.length === 0 && (
                    <Text align="center" color="dimmed" my="xl" fw={500}>
                      수강하신 강의가 없습니다!
                    </Text>
                  )}
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </>
  );
}
