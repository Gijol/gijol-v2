import Image from 'next/image';
import { Text, Center, Paper, Stack, Button, Alert } from '@mantine/core';
import TossCap from '/public/images/tossfaceCap.png';
import GoogleIcon from '/public/images/googleIcon.svg';
import { useViewportSize } from '@mantine/hooks';
import { signIn } from 'next-auth/react';
import { IconAlertCircle } from '@tabler/icons-react';

export default function Login() {
  const { height } = useViewportSize();
  return (
    <Center h={height}>
      <Paper w={450} h={560} p={40} withBorder>
        <Stack align="center" justify="space-around" h="100%" pt={40}>
          <Stack align="center">
            <Image src={TossCap} alt="Gijol Icon" width={64} height={64} />
            <Text size="xl" weight={600}>
              Gijol에 로그인하기
            </Text>
          </Stack>

          <Stack w={'100%'} py={40}>
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="주의사항!"
              color="red"
              styles={{
                title: {
                  fontSize: '0.8rem',
                  fontWeight: 600,
                },
                message: {
                  fontSize: '0.8rem',
                },
              }}
            >
              버클리와 같은{' '}
              <span style={{ fontWeight: 750 }}>해외 대학 측에서 제공해주는 구글 계정</span>으로
              로그인할 경우 <span style={{ fontWeight: 750 }}>심각한 오류</span>가 발생하는 것을
              확인했습니다. 반드시{' '}
              <span style={{ fontWeight: 750 }}>구글을 통해 직접 생성한 계정</span>을 이용해주시길
              바랍니다!
              <br />
              <br />
              만약 위와 같은 이유로 로그인에 오류가 발생했다면, 잠시 서비스를 1시간 반 정도 기다리신
              뒤에 이용하시는 것을 추천드립니다.
            </Alert>
            <Button
              fullWidth
              size="lg"
              variant="outline"
              leftIcon={<Image src={GoogleIcon} alt="Google icon" width={20} height={20} />}
              onClick={() =>
                signIn('google', { callbackUrl: `${window.location.origin}/dashboard` })
              }
            >
              구글로 로그인하기
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
}
