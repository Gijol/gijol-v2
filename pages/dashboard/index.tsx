import { Badge, Button, Card, Group, ScrollArea, Space, Text } from '@mantine/core';
import { homeContents } from '../../lib/const/contentData';
import { useRouter } from 'next/router';
import { useAuthState } from '../../lib/hooks/auth';

export default function HomePage() {
  const router = useRouter();
  const { isUnAuthenticated, userData } = useAuthState();
  console.log(userData?.id_token);
  console.log(userData?.access_token);
  const cntFeatures = homeContents.main.cntFeatures;
  const futureFeatures = homeContents.main.betaFeatures;
  return (
    <ScrollArea h="fit-content">
      <h1 style={{ textAlign: 'center' }}>🙌 Gijol v.2에 오신 것을 환영합니다! 🙌</h1>
      <h2 style={{ textAlign: 'start' }}>진행중인 서비스들</h2>
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
              <Text mt={8} mb={16}>
                {feat.description}
              </Text>
              {isUnAuthenticated ? (
                <Button fullWidth onClick={() => {}}>
                  로그인 하러가기 👉
                </Button>
              ) : (
                <Button onClick={() => router.push(feat.route)} fullWidth>
                  기능 이용하러 가기
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      <Space h={40} />
      <h2 style={{ textAlign: 'start' }}>개발중인 서비스들</h2>
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
