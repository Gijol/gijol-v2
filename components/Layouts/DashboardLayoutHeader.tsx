import { CSSProperties, Dispatch, SetStateAction, useEffect } from 'react';
import { Burger, Button, Group, Header, MediaQuery, Text } from '@mantine/core';
import { MantineTheme } from '@mantine/core';
import UserLoginPopover from '../UserLoginPopover';
import Link from 'next/link';
import { useAuthState, useMemberStatus } from '../../lib/hooks/auth';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

export function DashboardLayoutHeader({
  theme,
  opened,
  setOpened,
}: {
  theme: MantineTheme;
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
}) {
  const { isAuthenticated } = useAuthState();
  const { isMember, error } = useMemberStatus();
  const router = useRouter();
  // 구글로 로그인 한 이후이더라도, 우리 서버에 파일을 업로드 하지 않았다면, 업로드하도록 진행
  useEffect(() => {
    if (typeof isMember !== 'undefined' && isAuthenticated && !isMember) {
      modals.open({
        id: 'file-upload-warning',
        title: '강의 이수 내역을 업로드 해주세요',
        styles: {
          title: { fontWeight: 700, fontSize: 20, lineHeight: 1.5 },
        },
        centered: true,
        children: (
          <>
            <Text>
              <Text color="red" pt={8} pb={24} align="center" weight={600}>
                로그인 이후 강의 이수 내역 파일을 <br /> 업로드 하지 않으셨습니다
              </Text>
              이 경우, 서비스를 정상적으로 이용하시기 어려울 것입니다. 보다 나은 서비스 이용을
              원하신다면, 해당 파일을 업로드 해주시면 감사하겠습니다!
            </Text>
            <Button
              onClick={() => {
                modals.closeAll();
                router.push('/login/signup');
              }}
              mt={16}
              fullWidth
              color="red"
            >
              파일 업로드 하러 가기 👉
            </Button>
          </>
        ),
        closeOnEscape: true,
      });
    }
  }, [isMember, isAuthenticated]);

  useEffect(() => {
    if (error) {
      signOut();
    }
  }, [error]);

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
