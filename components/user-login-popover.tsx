import {
  Alert,
  Avatar,
  Box,
  Button,
  Group,
  MediaQuery,
  Popover,
  SimpleGrid,
  Stack,
  Sx,
  Text,
} from '@mantine/core';
import { signOut } from 'next-auth/react';
import {
  IconAlertCircle,
  IconAt,
  IconChevronDown,
  IconIdBadge2,
  IconSchool,
  IconUpload,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useUserInfo } from '../lib/hooks/user';
import { useAuthState, useMemberStatus } from '../lib/hooks/auth';
import { convertMajorTypeToText } from '../lib/utils/user';

export default function UserLoginPopover() {
  const { userData, isAuthenticated, isLoading, isUnAuthenticated } = useAuthState();
  const { data: userInfoData } = useUserInfo();
  const { isMember } = useMemberStatus();
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
                    <Text size="xs">{userInfoData?.name} 님</Text>
                  </MediaQuery>
                </>
              )}
            </Group>
            <IconChevronDown size={14} style={{ marginLeft: 6 }} />
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack w="fit-content" align="center">
            {isAuthenticated ? (
              <Stack align="center" spacing="xs">
                <Avatar src={userData?.image} size="4rem" radius="lg" m={12} />
                <Stack align="center" spacing="xs">
                  <Text fz="lg" fw={500} align="center">
                    {userInfoData?.name}
                  </Text>
                  {!isMember ? (
                    <Alert
                      icon={<IconAlertCircle size="1rem" />}
                      p="xs"
                      radius="sm"
                      maw={300}
                      variant="light"
                      my="sm"
                    >
                      엑셀 파일 정보 업로드를 하시면 더욱 많은 기능들을 이용하실 수 있습니다! 아래
                      버튼을 눌러 정보를 업로드 해주세요!
                    </Alert>
                  ) : (
                    <SimpleGrid cols={2} spacing="xs" p="md">
                      <Group spacing="xs">
                        <IconSchool stroke={1.5} size="1rem" />
                        <Text fz="xs">전공</Text>
                      </Group>
                      <Text fz="xs" c="dimmed">
                        {convertMajorTypeToText(userInfoData?.majorType as string)}
                      </Text>
                      <Group spacing="xs">
                        <IconIdBadge2 stroke={1.5} size="1rem" />
                        <Text fz="xs">학번</Text>
                      </Group>
                      <Text fz="xs" c="dimmed">
                        {userInfoData?.studentId}
                      </Text>
                      <Group spacing="xs">
                        <IconAt stroke={1.5} size="1rem" />
                        <Text fz="xs">이메일</Text>
                      </Group>
                      <Text fz="xs" c="dimmed" maw={150} sx={{ overflowX: 'hidden' }}>
                        {userData?.email}
                      </Text>
                    </SimpleGrid>
                  )}
                </Stack>
              </Stack>
            ) : (
              <></>
            )}
            {isUnAuthenticated ? (
              <Button fullWidth onClick={() => router.push('/login')}>
                로그인하러 가기 👉
              </Button>
            ) : (
              <Group miw={320} grow>
                {!isMember ? (
                  <Button
                    variant="light"
                    onClick={() => router.push('/login/signup')}
                    rightIcon={<IconUpload size="1rem" />}
                  >
                    정보 업로드
                  </Button>
                ) : (
                  <Button variant="light" onClick={() => router.push('/dashboard/user-info')}>
                    내 정보 수정
                  </Button>
                )}
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
