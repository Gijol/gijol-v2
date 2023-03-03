import { AppShell, useMantineTheme } from '@mantine/core';
import { ReactNode, useState } from 'react';
import { LayoutNavbar } from './LayoutNavbar';
import { LayoutFooter } from './LayoutFooter';
import { LayoutHeader } from './LayoutHeader';

export function Layout({ children }: { children: ReactNode }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<LayoutNavbar opened={opened} />}
      footer={<LayoutFooter />}
      header={<LayoutHeader theme={theme} opened={opened} setOpened={setOpened} />}
    >
      {children}
    </AppShell>
  );
}
