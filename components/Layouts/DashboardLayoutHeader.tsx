import { CSSProperties, Dispatch, SetStateAction } from 'react';
import { Burger, Container, Header, MediaQuery, Sx } from '@mantine/core';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { MantineTheme } from '@mantine/core';

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
          <h2>🎓 Gijol.v2</h2>
          <Container sx={headerContents}>
            <ColorSchemeToggle />
          </Container>
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
