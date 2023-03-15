import { Avatar, Button, MediaQuery, Popover, Space, Sx, Text } from '@mantine/core';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function UserLoginPopover() {
  const { user, isLoading } = useUser();
  return (
    <>
      <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
        <Popover position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Button sx={btnStyle} variant="default" p={4} pr={12}>
              {!user ? <Avatar radius="xl" /> : <Avatar src={user.picture} radius="md" />}
              <Space w="10px" />
              {isLoading && <Text>Loading...</Text>}
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
            </Button>
          </Popover.Target>
          <Popover.Dropdown sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!user ? (
              <Link href="/api/auth/login" style={{ textDecoration: 'none' }}>
                <Button>로그인</Button>
              </Link>
            ) : (
              <Link href="/api/auth/logout" style={{ textDecoration: 'none' }}>
                <Button>로그아웃</Button>
              </Link>
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
