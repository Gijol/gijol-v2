import {
  Accordion,
  Alert,
  Badge,
  Container,
  Group,
  RingProgress,
  ScrollArea,
  Space,
  Table,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';

export default function GradSpecificDomainStatus({ classes, rows }: { classes: any; rows: any }) {
  return (
    <>
      <Accordion variant="contained" radius="md" defaultValue="customization" my={16}>
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
    </>
  );
}
