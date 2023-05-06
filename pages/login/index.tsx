import Image from 'next/image';
import { useRouter } from 'next/router';
import { Text, Center, Paper, Stack, Input, Button, Divider, Group, Anchor } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import TossCap from '/public/images/tossfaceCap.png';
import GoogleIcon from '/public/images/googleIcon.svg';
import { signIn } from 'next-auth/react';

export default function Login() {
  const { height } = useViewportSize();
  const router = useRouter();
  return (
    <Center h={height}>
      <Paper w={350} h={560} p={40} withBorder>
        <Stack align="center" justify="space-around" h="100%">
          <Stack align="center">
            <Image src={TossCap} alt="Gijol Icon" width={64} height={64} />
            <Text size="xl" weight={600}>
              Gijol에 로그인하기
            </Text>
          </Stack>

          <Stack w={'100%'}>
            <Button
              fullWidth
              size="lg"
              variant="outline"
              leftIcon={<Image src={GoogleIcon} alt="Google icon" width={20} height={20} />}
              onClick={() => signIn('google', { callbackUrl: 'http://localhost:3000/dashboard' })}
            >
              구글로 로그인하기
            </Button>
          </Stack>

          <Group align="center">
            <Text size="sm">처음이신가요?</Text>
            <Anchor component="button" size="sm" onClick={() => router.push('/login/signup')}>
              회원가입 하러가기
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </Center>
  );
}