import { Alert, Paper, ScrollArea, Tabs } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { SingleCategoryType } from '../lib/types/grad';
import { getDomainColor } from '../lib/utils/grad';

export default function GradRecommend({
  specificDomainStatusArr,
}: {
  specificDomainStatusArr: { domain: string; status: SingleCategoryType | undefined }[];
}) {
  return (
    <>
      <Paper withBorder py={32} px={16} radius="md" shadow="xs">
        <Tabs orientation="vertical" defaultValue="언어와 기초" h={300}>
          <Tabs.List>
            {specificDomainStatusArr.map((category) => {
              return (
                <Tabs.Tab
                  key={category.domain}
                  value={category.domain}
                  color={getDomainColor(category.domain)}
                >
                  {category.domain}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
          {specificDomainStatusArr.map((category) => {
            return (
              <Tabs.Panel value={category.domain} pl="md">
                <ScrollArea h={300}>
                  {category.status?.satisfied && (
                    <Alert icon={<IconCircleCheck size="1rem" />} title="완료!" color="green">
                      모든 요건들을 충족했습니다! ✨
                    </Alert>
                  )}
                  {category.status?.messages.map((message) => {
                    return (
                      <Alert
                        key={message}
                        icon={<IconAlertCircle size="1rem" />}
                        title=""
                        color={getDomainColor(category.domain)}
                        my={8}
                      >
                        {message}
                      </Alert>
                    );
                  })}
                </ScrollArea>
              </Tabs.Panel>
            );
          })}
        </Tabs>
      </Paper>
    </>
  );
}
