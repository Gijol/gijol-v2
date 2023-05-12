import { useEffect } from 'react';
import Image from 'next/image';
import router from 'next/router';
import { Text, Center, Paper, Stack, Button } from '@mantine/core';
import TossCap from '/public/images/tossfaceCap.png';
import GoogleIcon from '/public/images/googleIcon.svg';
import { useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { signIn } from 'next-auth/react';
import { getMembershipStatus } from '../../lib/utils/auth';
import useAuthState from '../../lib/hooks/auth';
import { IconCheck } from '@tabler/icons-react';

export default function Login() {
  const { height } = useViewportSize();
  const { userData } = useAuthState();
  useEffect(() => {
    const redirectHandler = async () => {
      if (userData) {
        notifications.show({
          id: 'checking if user is a member of gijol',
          loading: true,
          title: '지졸 회원여부를 검사중입니다',
          message: '회원 여부에 대한 검사가 진행되고 있으니 기다려주시길 바랍니다',
          autoClose: 500,
          withCloseButton: false,
        });
        const isMember: 'SIGN_IN' | 'SIGN_UP' = await getMembershipStatus(
          userData.id_token as string
        );
        if (isMember === 'SIGN_IN') {
          notifications.show({
            id: 'checking if user is a member of gijol',
            color: 'teal',
            title: '기존 회원이시군요!',
            message: '이제 대쉬보드로 이동할 것입니다!',
            icon: <IconCheck size="1rem" />,
            autoClose: 1000,
            withCloseButton: false,
          });
          await router.push('/dashboard');
        } else if (isMember === 'SIGN_UP') {
          notifications.show({
            id: 'checking if user is a member of gijol',
            color: 'teal',
            title: '처음 오셨군요!',
            message:
              '환영합니다! 서비스를 이용하기 전 몇 단계를 설정하는 페이지로 넘어갈 예정입니다!',
            icon: <IconCheck size="1rem" />,
            autoClose: 1000,
            withCloseButton: false,
          });
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
