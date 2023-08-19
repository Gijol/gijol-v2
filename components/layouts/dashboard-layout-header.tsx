import { CSSProperties, Dispatch, SetStateAction, useEffect } from 'react';
import { Burger, Button, Group, Header, MediaQuery, Text } from '@mantine/core';
import { MantineTheme } from '@mantine/core';
import Link from 'next/link';
import { SignInButton, useAuth, UserButton, useUser } from '@clerk/nextjs';

export function DashboardLayoutHeader({
  theme,
  opened,
  setOpened,
}: {
  theme: MantineTheme;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}) {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const hi = async () => {
      console.log(await getToken({ template: 'gijol-token-test' }));
    };
    hi();
  }, [getToken]);

  return (
    <Header height={60} py="sm" px="lg">
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
          {!isSignedIn && (
            <Button component={SignInButton} afterSignInUrl="/login/new-user" variant="default">
              로그인하기
            </Button>
          )}
          <UserButton afterSignOutUrl="/dashboard" />
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
