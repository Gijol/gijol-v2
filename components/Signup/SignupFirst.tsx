import React from 'react';
import { Button, Container, Space, Stack, Text } from '@mantine/core';
import { signIn, useSession } from 'next-auth/react';
import { IconCircleCheck } from '@tabler/icons-react';
import Google from '/public/images/googleIcon.svg';
import Image from 'next/image';

export default function SignupFirst({ nextStep }: { nextStep: () => void }) {
  /* authenticated 상태 관리 */
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  return (
    <Container>
      <Stack align="center">
        <Text size="xl" weight={600} align="center">
          1. 우선 구글 계정으로 로그인 해주세요!
        </Text>
        <Space h={16} />
        <Button
          size="lg"
          variant="outline"
          my={8}
          fullWidth
          onClick={() => signIn('google', { callbackUrl: 'http://localhost:3000/login/signup' })}
          loading={isLoading}
          leftIcon={
            isAuthenticated ? (
              <IconCircleCheck color="#40C057" />
            ) : (
              <Image src={Google} alt={'google'} width={28} height={28} />
            )
          }
        >
          {isAuthenticated ? '구글 계정과 연동되었습니다!' : '구글로 로그인하기'}
        </Button>
        <Button disabled={!isAuthenticated} fullWidth size="lg" onClick={nextStep}>
          다음 과정으로
        </Button>
      </Stack>
    </Container>
  );
}
