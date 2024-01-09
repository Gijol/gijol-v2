import { Notification, useMantineTheme } from '@mantine/core';
import React from 'react';

export default function CustomTooltip({ active, payload, label }: any) {
  const theme = useMantineTheme();
  if (!active || !payload) return null;
  return (
    <Notification
      withCloseButton={false}
      title={label}
      styles={{
        title: { color: theme.colors.gray[6] },
        description: { color: theme.colors.dark[6], fontSize: theme.fontSizes.md },
      }}
    >
      {payload[0].value} 학점
    </Notification>
  );
}
