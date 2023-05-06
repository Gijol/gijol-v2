import React from 'react';
import Lottie from 'react-lottie-player';
import ThumbsUp from '../../public/lottie/thumbs-up.json';
import { Button, Container, Space, Text } from '@mantine/core';
import { FileWithPath } from '@mantine/dropzone';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { storeStatusInfo } from '../../lib/utils/grad';

class HTTPError extends Error {
  constructor(messages?: string) {
    super(messages);
    this.name = 'HTTP Error';
  }
}

export default function SignupComplete({ fileInfo }: { fileInfo: FileWithPath | undefined }) {
  const router = useRouter();
  const { data: session, status } = useSession();
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
      <Button
        size="lg"
        radius="md"
        onClick={() => {
          if (status === 'authenticated') {
            storeStatusInfo(fileInfo as File, session?.user)
              .then(async (res) => {
                const BASE_URL = 'https://dev-api.gijol.im';
                const userInfoStoreResponse = await fetch(
                  `${BASE_URL}/api/v1/auth/google/sign-up`,
                  {
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(res),
                    method: 'POST',
                  }
                ).then((res) => res.json());
                if (userInfoStoreResponse.status === 405) {
                  throw new HTTPError('지원하지 않는 학번입니다.');
                }
                if (userInfoStoreResponse.status === 500) {
                  throw new HTTPError('파일 입력 오류.');
                }
              })
              .then(() => {
                router.push('/dashboard');
              });
          }
        }}
      >
        대쉬보드로 돌아가기
      </Button>
    </Container>
  );
}
