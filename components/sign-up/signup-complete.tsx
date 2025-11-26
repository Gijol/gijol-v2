import React from 'react';
import { Button, Container, Space, Text } from '@mantine/core';
import { useRouter } from 'next/router';

export default function SignupComplete() {
  const router = useRouter();
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 40,
      }}
    >
      <Space h={16} />
      <Text align="center" size="xl" weight={500}>
        ✨ 이제 회원가입이 끝났습니다! 그럼 확인하러 가볼까요? ✨
      </Text>
      <Space h={32} />
      <Button size="lg" radius="md" onClick={() => router.push('/dashboard')}>
        대쉬보드로 돌아가기
      </Button>
    </Container>
  );
}
