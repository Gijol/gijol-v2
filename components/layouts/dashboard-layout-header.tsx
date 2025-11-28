import { CSSProperties } from 'react';
import { Burger, Header, MediaQuery, Text } from '@mantine/core';
import { MantineTheme } from '@mantine/core';
import Link from 'next/link';

export function DashboardLayoutHeader({
  theme,
  opened,
  open,
}: {
  theme: MantineTheme;
  opened: boolean;
  open: () => void;
}) {
  return (
    <Header height={60} py="sm" px="lg">
      <div style={headerContainer}>
        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
          <Burger opened={opened} onClick={open} size="sm" color={theme.colors.gray[6]} mr="xl" />
        </MediaQuery>
        <MediaQuery smallerThan="sm" styles={{ fontSize: 16 }}>
          <Link href="/dashboard" style={{ color: 'black', textDecoration: 'none' }}>
            <Text size={24} weight={700}>
              🎓 Gijol.v2
            </Text>
          </Link>
        </MediaQuery>
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
