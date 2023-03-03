import { Dispatch, SetStateAction } from 'react';
import { Burger, Header, MediaQuery, Text } from '@mantine/core';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { MantineTheme } from '@mantine/core';

export function LayoutHeader({
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
      <Header height={{ base: 50, md: 70 }} p="md">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />
          </MediaQuery>
          <h2>🎓 Gijol_v2</h2>
          <ColorSchemeToggle />
        </div>
      </Header>
    </>
  );
}
