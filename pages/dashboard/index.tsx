import { Badge, Button, Card, Divider, Group, Paper, ScrollArea, Space, Text } from '@mantine/core';
import { homeContents } from '../../lib/utils/contentData';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSessionStorageGradStatus } from '../../lib/hooks/grad';

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();
  const { isAtomDefault } = useSessionStorageGradStatus();
  const onClickHandler = async (status: boolean) => {
    if (!status) {
      await router.push('/dashboard/course/result');
    } else {
      await router.push('/dashboard/course');
    }
  };

  const cntFeatures = homeContents.main.cntFeatures;
  const futureFeatures = homeContents.main.betaFeatures;
  return (
    <ScrollArea h="fit-content">
      <h1 style={{ textAlign: 'center' }}>🙌 Gijol v.2에 오신 것을 환영합니다! 🙌</h1>
      <Space h={16} />
      <h2 style={{ textAlign: 'start' }}>진행중인 서비스들</h2>
      <Divider />
      <Space h={16} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {cntFeatures.map((feat) => {
          return (
            <Card key={feat.title} shadow="xs" radius="md" p="lg" w={400} withBorder>
              <Group>
                <h3 style={{ marginTop: '8px', marginBottom: '8px' }}>{feat.title}</h3>
                <Badge color="green" variant="light">
                  이용가능
                </Badge>
              </Group>
              <Space h={8} />
              <Text>{feat.description}</Text>
              <Space h={16} />
              <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                {status === 'unauthenticated' ? (
                  <>
                    <Link href="/dashboard/course" style={{ textDecoration: 'none' }}>
                      <Button variant="subtle" fullWidth>
                        로그인 없이 바로 확인하기
                      </Button>
                    </Link>
                    <Link href="/api/auth/login" style={{ textDecoration: 'none' }}>
                      <Button fullWidth>로그인 하러가기</Button>
                    </Link>
                  </>
                ) : (
                  <Button onClick={() => onClickHandler(isAtomDefault)} fullWidth>
                    기능 이용하러 가기
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <Space h={40} />
      <h2 style={{ textAlign: 'start' }}>개발중인 서비스들</h2>
      <Divider />
      <Space h={16} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {futureFeatures.map((feat) => {
          return (
            <Card key={feat.title} shadow="xs" radius="md" p="lg" w={400} withBorder>
              <Group>
                <h3 style={{ marginTop: '8px', marginBottom: '8px' }}>{feat.title}</h3>
                <Badge color="red" variant="light">
                  개발중
                </Badge>
              </Group>
              <Space h={8} />
              <Text>{feat.description}</Text>
              <Space h={16} />
            </Card>
          );
        })}
      </div>
      <Space h={96} />
    </ScrollArea>
  );
}
