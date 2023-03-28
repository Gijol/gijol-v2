import { Avatar, Button, MediaQuery, Popover, Space, Sx, Text } from '@mantine/core';
import { signIn, signOut, useSession } from 'next-auth/react';
import { IconChevronRight } from '@tabler/icons-react';

export default function UserLoginPopover() {
  const { data, status } = useSession();
  const user = data?.user;
  return (
    <>
      <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
        <Popover position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Button sx={btnStyle} variant="default" p={4} pr={12}>
              {status === 'unauthenticated' && <Avatar radius="xl" />}
              {status === 'authenticated' && <Avatar src={user?.image} radius="md" />}
              <Space w="10px" />
              {status === 'loading' && <Text>Loading...</Text>}
              {!user ? (
                <Text>로그인 하세요</Text>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    fontSize: 'smaller',
                  }}
                >
                  <Text>{user.name}</Text>
                  <Text>{user.email}</Text>
                </div>
              )}
              <Space w={2} />
              <IconChevronRight size={16} />
            </Button>
          </Popover.Target>
          <Popover.Dropdown sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!user ? (
              <Button onClick={() => signIn()}>로그인</Button>
            ) : (
              <Button onClick={() => signOut()}>로그아웃</Button>
            )}
          </Popover.Dropdown>
        </Popover>
      </MediaQuery>
    </>
  );
}

const btnStyle: Sx = {
  height: '100%',
  border: 'unset',
  backgroundColor: 'unset',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  fontSize: '14px',
};
