import { CSSProperties, Dispatch, SetStateAction } from 'react';
import { Burger, Container, Group, Header, MediaQuery, Sx, Text } from '@mantine/core';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { MantineTheme } from '@mantine/core';
import UserLoginPopover from '../UserLoginPopover';

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
    <>
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
            <Text size={24} weight={700}>
              🎓 Gijol.v2
            </Text>
          </MediaQuery>
          <Group>
            <UserLoginPopover />
            <ColorSchemeToggle />
          </Group>
        </div>
      </Header>
    </>
  );
}

const headerContainer: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
};

const headerContents: Sx = {
  margin: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
};
