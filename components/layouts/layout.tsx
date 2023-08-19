import { AppShell, useMantineTheme, clsx } from '@mantine/core';
import { ReactNode, useState } from 'react';
import { DashboardLayoutHeader } from './dashboard-layout-header';
import { useRouter } from 'next/router';
import { LayoutNavbar } from './layout-navbar';

export function Layout({ children }: { children: ReactNode }) {
  const theme = useMantineTheme();
  const cntRoute = useRouter();
  const [opened, setOpened] = useState(false);
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
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<LayoutNavbar opened={opened} />}
      header={<DashboardLayoutHeader theme={theme} opened={opened} setOpened={setOpened} />}
    >
      {children}
    </AppShell>
  );
}
