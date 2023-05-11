import { Avatar, Box, Button, Group, MediaQuery, Popover, Stack, Sx, Text } from '@mantine/core';
import { getSession, signOut } from 'next-auth/react';
import { IconAt, IconChevronDown, IconIdBadge2 } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import useAuthState from '../lib/hooks/auth';
import { useEffect } from 'react';

export default function UserLoginPopover() {
  const { userData, isAuthenticated, isLoading, isUnAuthenticated, update, expires } =
    useAuthState();
  const router = useRouter();

  // 1시간마다 next-auth의 세션 업데이트 -> 해당 과정에서 구글에서 토큰 재발급 받는 과정이 진행된다.
  useEffect(() => {
    const interval = setInterval(() => update(), 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [update]);

  // 새 탭으로 이동할 때, 세션 업데이트 -> 해당 과정에서 구글서 토큰을 재발급 받는 과정이 진행된다.
  useEffect(() => {
    const visibilityHandler = () => document.visibilityState === 'visible' && update();
    window.addEventListener('visibilitychange', visibilityHandler, false);
    return () => window.removeEventListener('visibilitychange', visibilityHandler, false);
  }, [update]);

  return (
    <Box h="100%">
      <Popover withArrow shadow="md" position="bottom-end">
        <Popover.Target>
          <Button sx={btnStyle} variant="default" p={0} fullWidth h="100%">
            <Group spacing="xs" mr={8}>
              {isUnAuthenticated && (
                <>
                  <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                    <Avatar radius="xl" />
                  </MediaQuery>
                  <MediaQuery smallerThan="sm" styles={{ padding: 8 }}>
                    <Text size="xs">로그인 하세요</Text>
                  </MediaQuery>
                </>
              )}
              {isLoading && <Text>Loading...</Text>}
              {isAuthenticated && (
                <>
                  <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                    <Avatar src={userData?.image} radius="md" m={8} />
                  </MediaQuery>
                  <MediaQuery smallerThan="sm" styles={{ padding: 8 }}>
                    <Text size="xs">{userData?.name} 님</Text>
                  </MediaQuery>
                </>
              )}
            </Group>
            <IconChevronDown size={14} style={{ marginLeft: 6 }} />
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack>
            {isAuthenticated && (
              <Group noWrap>
                <Avatar src={userData?.image} size={80} radius="lg" m={12} />
                <div style={{ padding: 12 }}>
                  <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                    전기전자컴퓨터공학부
                  </Text>

                  <Text fz="lg" fw={500}>
                    {userData?.name} 님
                  </Text>

                  <Group noWrap spacing={10} mt={5}>
                    <IconIdBadge2 stroke={1.5} size="1rem" />
                    <Text fz="xs" c="dimmed">
                      20205098
                    </Text>
                  </Group>
                  <Group noWrap spacing={10} mt={3}>
                    <IconAt stroke={1.5} size="1rem" />
                    <Text fz="xs" c="dimmed" maw={150} sx={{ overflowX: 'hidden' }}>
                      {userData?.email}
                    </Text>
                  </Group>
                </div>
              </Group>
            )}
            {isUnAuthenticated ? (
              <Button fullWidth onClick={() => router.push('/login')}>
                로그인하러 가기 👉
              </Button>
            ) : (
              <Group grow>
                <Button variant="light" onClick={() => router.push('/dashboard/user')}>
                  내 정보 수정
                </Button>
                <Button onClick={() => signOut()} variant="light" color="red">
                  로그아웃
                </Button>
              </Group>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}

const btnStyle: Sx = {
  border: 'unset',
  backgroundColor: 'unset',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
};
