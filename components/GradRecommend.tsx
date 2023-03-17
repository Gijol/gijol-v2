import { Alert, Paper, ScrollArea, Tabs } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function GradRecommend() {
  return (
    <>
      <Paper withBorder py={32} px={16} radius="md" shadow="xs">
        <Tabs orientation="vertical" defaultValue="언어와 기초" h={300}>
          <Tabs.List>
            <Tabs.Tab value="언어와 기초" color="green">
              언어와 기초
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
        </Tabs>
      </Paper>
    </>
  );
}
