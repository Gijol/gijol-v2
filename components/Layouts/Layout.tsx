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
      sx={{ paddingRight: '16px' }}
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<LayoutNavbar opened={opened} />}
      // footer={<LayoutFooter />}x
      header={<LayoutHeader theme={theme} opened={opened} setOpened={setOpened} />}
    >
      {children}
    </AppShell>
  );
}
