import { CSSProperties, Dispatch, SetStateAction } from 'react';
import { Burger, Group, Header, MediaQuery, Text } from '@mantine/core';
import { MantineTheme } from '@mantine/core';
import UserLoginPopover from '../user-login-popover';
import Link from 'next/link';

export function DashboardLayoutHeader({
  theme,
  opened,
  setOpened,
}: {
  theme: MantineTheme;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Header height={{ base: 50, md: 60 }} p="sm">
      <div style={headerContainer}>
        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>
        <MediaQuery smallerThan="sm" styles={{ fontSize: 16 }}>
          <Link href="/dashboard" style={{ color: 'black', textDecoration: 'none' }}>
            <Text size={24} weight={700}>
              🎓 Gijol.v2
            </Text>
          </Link>
        </MediaQuery>
        <Group>
          <UserLoginPopover />
        </Group>
      </div>
    </Header>
  );
}

const headerContainer: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
};
