import { Badge, Button, Card, Container, Divider, Group, Paper, Space, Text } from '@mantine/core';
import { homeContents } from '../lib/utils/contentData';
import { useAuth0 } from '../lib/hooks/auth';

export default function HomePage() {
  const { authenticated: auth } = useAuth0();
  const cntFeatures = homeContents.main.cntFeatures;
  const futureFeatures = homeContents.main.betaFeatures;
  return (
    <div>
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
                <h3>{feat.title}</h3>
                <Badge color="green" variant="light">
                  이용가능
                </Badge>
              </Group>
              <Text>{feat.description}</Text>
              <Space h={16} />
              <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                {!auth ? (
                  <>
                    <Button variant="subtle" fullWidth>
                      로그인없이 바로 확인하기
                    </Button>
                    <Button fullWidth>로그인 하러가기</Button>
                  </>
                ) : (
                  <Button fullWidth>기능 이용하러 가기</Button>
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
                <h3>{feat.title}</h3>
                <Badge color="red" variant="light">
                  개발중
                </Badge>
              </Group>
              <Text>{feat.description}</Text>
              <Space h={16} />
            </Card>
          );
        })}
      </div>
      <Space h={96} />
    </div>
  );
}
