import { Dispatch, SetStateAction } from 'react';
import { Burger, Container, Header, MediaQuery } from '@mantine/core';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { MantineTheme } from '@mantine/core';
import UserLoginPopover from '../UserLoginPopover';

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
      <Header height={{ base: 50, md: 60 }} p="sm">
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
          <h2>🎓 Gijol.v2</h2>
          <Container
            sx={{
              margin: 0,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            <UserLoginPopover />
            <ColorSchemeToggle />
          </Container>
        </div>
      </Header>
    </>
  );
}
