import { Avatar, Box, Button, Group, MediaQuery, Popover, Stack, Sx, Text } from '@mantine/core';
import { signOut } from 'next-auth/react';
import { IconAt, IconChevronDown, IconIdBadge2 } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import useAuthState from '../lib/hooks/auth';

export default function UserLoginPopover() {
  const { userData, expires, isAuthenticated, isLoading, isUnAuthenticated } = useAuthState();
  const router = useRouter();
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
                {/*<Button variant="light">마이페이지</Button>*/}
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
