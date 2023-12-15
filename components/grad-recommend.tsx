import { Alert, createStyles, Group, Paper, ScrollArea, Tabs, Text } from '@mantine/core';
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { SingleCategoryType } from '../lib/types/grad';
import {
  getDomainColor,
  getStatusColor,
  verifyStatus,
} from '../lib/utils/graduation/grad-formatter';

export default function GradRecommend({
  specificDomainStatusArr,
}: {
  specificDomainStatusArr: { domain: string; status: SingleCategoryType | undefined }[];
}) {
  const { classes } = useStyles();

  return (
    <Tabs
      orientation="horizontal"
      defaultValue="언어와 기초"
      variant="outline"
      styles={{
        tab: {
          padding: '0.5rem 1rem',
          fontSize: '1rem',
        },
      }}
    >
      <Tabs.List>
        {specificDomainStatusArr.map((category) => {
          const status = verifyStatus(category.status?.satisfied, category.domain);
          return (
            <Tabs.Tab key={category.domain} value={category.domain}>
              <Group position="apart">
                <Text>{category.domain}</Text>
                {status === 'satisfied' ? (
                  <IconCircleCheck size="1.5rem" color="#40c057" stroke={1.6} />
                ) : status === 'unSatisfied' ? (
                  <IconAlertTriangle size="1.5rem" color="#fa5252" stroke={1.6} />
                ) : (
                  <IconAlertCircle size="1.5rem" color="#228be6" stroke={1.6} />
                )}
              </Group>
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
      {specificDomainStatusArr.map((category) => {
        return (
          <Tabs.Panel key={`${category.domain} ${category.status}`} value={category.domain} mt="xl">
            <ScrollArea h={300}>
              {category.status?.satisfied && (
                <Alert
                  icon={<IconCircleCheck size="1rem" />}
                  color="green"
                  className={classes.alert}
                >
                  모든 요건들을 충족했습니다! ✨
                </Alert>
              )}
              {category.status?.messages.map((message) => {
                return (
                  <Alert
                    key={message}
                    icon={<IconAlertCircle size="1rem" />}
                    color={getDomainColor(category.domain)}
                    className={classes.alert}
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
  );
}

const useStyles = createStyles((theme) => ({
  alert: {
    borderRadius: '0.5rem',
    border: '1px solid',
  },
}));
