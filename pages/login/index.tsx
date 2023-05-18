import { useEffect, useState } from 'react';
import Image from 'next/image';
import router from 'next/router';
import { Text, Center, Paper, Stack, Button } from '@mantine/core';
import TossCap from '/public/images/tossfaceCap.png';
import GoogleIcon from '/public/images/googleIcon.svg';
import { useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { signIn } from 'next-auth/react';
import { getMembershipStatus } from '../../lib/utils/auth';
import { useAuthState } from '../../lib/hooks/auth';

export default function Login() {
  const { height } = useViewportSize();
  const { userData } = useAuthState();
  useEffect(() => {
    const redirectHandler = async () => {
      if (userData) {
        const isMember: 'SIGN_IN' | 'SIGN_UP' = await getMembershipStatus(
          userData.id_token as string
        ).then((res) => {
          notifications.show({
            id: 'checking if user is a member of gijol',
            loading: true,
            title: '지졸 회원여부를 검사중입니다',
            message: '회원 여부에 대한 검사가 진행되고 있으니 기다려주시길 바랍니다',
            autoClose: 500,
            withCloseButton: false,
          });
          return res;
        });
        if (isMember === 'SIGN_IN') {
          await router.push('/dashboard');
        } else if (isMember === 'SIGN_UP') {
          await router.push('/login/signup');
        }
      }
    };
    redirectHandler();
  }, [userData]);
  return (
    <Center h={height}>
      <Paper w={350} h={560} p={40} withBorder>
        <Stack align="center" justify="space-around" h="100%" pt={40}>
          <Stack align="center">
            <Image src={TossCap} alt="Gijol Icon" width={64} height={64} />
            <Text size="xl" weight={600}>
              Gijol에 로그인하기
            </Text>
          </Stack>

          <Stack w={'100%'} py={40}>
            <Button
              fullWidth
              size="lg"
              variant="outline"
              leftIcon={<Image src={GoogleIcon} alt="Google icon" width={20} height={20} />}
              onClick={() => signIn('google')}
            >
              구글로 로그인하기
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
}
