import React from 'react';
import Lottie from 'react-lottie-player';
import ThumbsUp from '../../public/lottie/thumbs-up.json';
import { Button, Container, Space, Text } from '@mantine/core';
import { FileWithPath } from '@mantine/dropzone';
import { useRouter } from 'next/router';

class HTTPError extends Error {
  constructor(messages?: string) {
    super(messages);
    this.name = 'HTTP Error';
  }
}

export default function SignupComplete({ fileInfo }: { fileInfo: FileWithPath | undefined }) {
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
      <Lottie animationData={ThumbsUp} play style={{ width: '150', height: '150' }} loop={false} />
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
