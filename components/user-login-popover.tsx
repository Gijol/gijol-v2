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

export default function UserLoginPopover() {
  const { user, isSignedIn } = useUser();
  const { data: userInfoData } = useUserInfo();
  const status = { isNewUser: false };
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
                  {userInfoData?.name ?? '게스트'}
                </Text>
                <SimpleGrid cols={2} spacing="xs" p="md">
                  <Group spacing="xs">
                    <IconSchool stroke={1.5} size="1rem" />
                    <Text fz="xs">전공</Text>
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {convertMajorTypeToText(userInfoData?.majorType as string) ?? '-'}
                  </Text>
                  <Group spacing="xs">
                    <IconIdBadge2 stroke={1.5} size="1rem" />
                    <Text fz="xs">학번</Text>
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {userInfoData?.studentId ?? '-'}
                  </Text>
                  <Group spacing="xs">
                    <IconAt stroke={1.5} size="1rem" />
                    <Text fz="xs">이메일</Text>
                  </Group>
                  <Text fz="xs" c="dimmed" maw={150} sx={{ overflowX: 'hidden' }}>
                    {userInfoData?.email ?? '-'}
                  </Text>
                </SimpleGrid>
              </Stack>
            </Stack>
            <Group miw={320} grow>
              <Button variant="light" onClick={() => router.push('/dashboard/user-info')}>
                내 정보 수정
              </Button>
              {isSignedIn ? (
                <Button onClick={() => signOut()} variant="light" color="red">
                  로그아웃
                </Button>
              ) : (
                <Button
                  onClick={() => console.log('Sign-out skipped in anonymous mode')}
                  variant="light"
                  color="red"
                >
                  로그아웃
                </Button>
              )}
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
