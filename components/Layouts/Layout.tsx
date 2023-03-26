import { AppShell, useMantineTheme, clsx } from '@mantine/core';
import { ReactNode, useState } from 'react';
import { LayoutHeader } from './LayoutHeader';
import { useRouter } from 'next/router';
import { LayoutNavbar } from './LayoutNavbar';

export function Layout({ children }: { children: ReactNode }) {
  const theme = useMantineTheme();
  const cntRoute = useRouter();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      className={clsx({ overflow: 'hidden' })}
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={cntRoute.pathname.includes('dashboard') ? <LayoutNavbar opened={opened} /> : <></>}
      header={<LayoutHeader theme={theme} opened={opened} setOpened={setOpened} />}
    >
      {children}
    </AppShell>
  );
}
