import {
  Alert,
  Avatar,
  Box,
  Button,
  Group,
  Popover,
  SimpleGrid,
  Stack,
  Sx,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconAt, IconIdBadge2, IconSchool, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useUserInfo } from '../lib/hooks/user';
import { convertMajorTypeToText } from '../lib/utils/user';
import { useClerk, useUser } from '@clerk/nextjs';
import { useMemberStatus } from '../lib/hooks/auth';

export default function UserLoginPopover() {
  const { user, isSignedIn } = useUser();
  const { data: userInfoData } = useUserInfo();
  const { data: status } = useMemberStatus();
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <Box h="100%">
      <Popover withArrow shadow="md" position="bottom-end">
        <Popover.Target>
          <Button sx={btnStyle} variant="default" p={0} fullWidth h="100%">
            <Avatar src={user?.imageUrl} radius="md" m={8} />
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack w="fit-content" align="center">
            <Stack align="center" spacing="xs">
              <Avatar src={user?.imageUrl} size="4rem" radius="lg" m={12} />
              <Stack align="center" spacing="xs">
                <Text fz="lg" fw={500} align="center">
                  {user?.fullName}
                </Text>
                {status?.isNewUser ? (
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
                      {userInfoData?.email}
                    </Text>
                  </SimpleGrid>
                )}
              </Stack>
            </Stack>
            <Group miw={320} grow>
              {status?.isNewUser ? (
                <Button
                  variant="light"
                  onClick={() => router.push('/login/sign-up')}
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
