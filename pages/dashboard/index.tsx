import { Button, Container, ScrollArea, Space, Text } from '@mantine/core';
import { homeContents } from '../../lib/const/contentData';
import { useRouter } from 'next/router';
import { useAuthState } from '../../lib/hooks/auth';
import DashboardFeatureCard from '../../components/DashboardFeatureCard';
import DashboardHeroHeader from '../../components/DashboardHeroHeader';

export default function HomePage() {
  const router = useRouter();
  const { isUnAuthenticated } = useAuthState();
  const cntFeatures = homeContents.main.cntFeatures;
  const futureFeatures = homeContents.main.betaFeatures;
  return (
    <ScrollArea h="fit-content">
      <DashboardHeroHeader />
      <Container size="lg">
        <Text size={24} my="md" fw={600}>
          진행중인 서비스들
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {cntFeatures.map((feat) => {
            const btn = isUnAuthenticated ? (
              <Button fullWidth variant="light" onClick={() => router.push('/login')}>
                로그인 하러가기 👉
              </Button>
            ) : (
              <Button variant="light" onClick={() => router.push(feat.route)} fullWidth>
                기능 이용하러 가기
              </Button>
            );
            return <DashboardFeatureCard key={feat.title} feat={feat} button={btn} />;
          })}
        </div>
        <Space h={40} />
        <Text size={24} my="md" fw={600}>
          개발중인 서비스들
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {futureFeatures.map((feat) => {
            return <DashboardFeatureCard feat={feat} key={feat.title} />;
          })}
        </div>
        <Space h={96} />
      </Container>
    </ScrollArea>
  );
}
