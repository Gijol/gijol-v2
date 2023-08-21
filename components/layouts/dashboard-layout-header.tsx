import { CSSProperties } from 'react';
import { Burger, Button, Group, Header, MediaQuery, Text } from '@mantine/core';
import { MantineTheme } from '@mantine/core';
import Link from 'next/link';
import { SignInButton, useUser } from '@clerk/nextjs';
import UserLoginPopover from '../user-login-popover';

export function DashboardLayoutHeader({
  theme,
  opened,
  open,
}: {
  theme: MantineTheme;
  opened: boolean;
  open: () => void;
}) {
  const { isSignedIn } = useUser();

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
        <Group>
          {!isSignedIn ? (
            <Button component={SignInButton} afterSignInUrl="/login/new-user" variant="default">
              로그인하기
            </Button>
          ) : (
            <UserLoginPopover />
          )}
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
