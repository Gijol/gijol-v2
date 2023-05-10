import React from 'react';
import { Button, Container, Space, Stack, Text } from '@mantine/core';
import { signIn, useSession } from 'next-auth/react';
import { IconCircleCheck } from '@tabler/icons-react';
import Google from '/public/images/googleIcon.svg';
import Image from 'next/image';
import { BASE_DEV_URL } from '../../lib/const';
import useAuthState from '../../lib/hooks/auth';

export default function Signup3({ nextStep }: { nextStep: () => void }) {
  const { isLoading, isAuthenticated } = useAuthState();
  return (
    <Container>
      <Stack align="center">
        <Text size="xl" weight={600} align="center">
          3. 마지막으로 구글 계정과 연동 해주세요!
        </Text>
        <Space h={16} />
        <Button
          size="lg"
          variant="outline"
          my={8}
          fullWidth
          onClick={() => signIn('google', { callbackUrl: `${BASE_DEV_URL}/login/signup` })}
          loading={isLoading}
          leftIcon={
            isAuthenticated ? (
              <IconCircleCheck color="#40C057" />
            ) : (
              <Image src={Google} alt={'google'} width={28} height={28} />
            )
          }
        >
          {isAuthenticated ? '구글 계정과 연동되었습니다!' : '구글와 계정 연동하기'}
        </Button>
        <Button disabled={!isAuthenticated} fullWidth size="lg" onClick={nextStep}>
          다음 과정으로
        </Button>
      </Stack>
    </Container>
  );
}
