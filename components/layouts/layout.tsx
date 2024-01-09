import { AppShell, useMantineTheme, clsx } from '@mantine/core';
import { ReactNode } from 'react';
import { DashboardLayoutHeader } from './dashboard-layout-header';
import { useRouter } from 'next/router';
import { LayoutNavbar } from './layout-navbar';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

export function Layout({ children }: { children: ReactNode }) {
  const theme = useMantineTheme();
  const cntRoute = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const matches = useMediaQuery('(min-width: 48em)');
  const isDashboard = cntRoute.pathname.includes('dashboard');
  if (!isDashboard) {
    return <>{children}</>;
  }
  return (
    <AppShell
      className={clsx({ overflow: 'hidden' })}
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          paddingRight: theme.spacing['md'],
          wordBreak: 'keep-all',
          whiteSpace: 'pre-wrap',
          '@media (max-width: 48em)': {
            paddingLeft: theme.spacing['xs'],
            paddingRight: theme.spacing['xs'],
          },
          boxSizing: 'border-box',
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<LayoutNavbar matches={matches} opened={opened} onClose={close} />}
      header={<DashboardLayoutHeader theme={theme} opened={opened} open={open} />}
    >
      {children}
    </AppShell>
  );
}
