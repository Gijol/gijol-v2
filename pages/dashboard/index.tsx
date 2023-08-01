import { Button, Container, ScrollArea, SimpleGrid, Space, Text } from '@mantine/core';
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
        <SimpleGrid
          cols={3}
          spacing="xl"
          breakpoints={[
            { maxWidth: 'md', cols: 2, spacing: 'xl' },
            { maxWidth: 'xs', cols: 1, spacing: 'xl' },
          ]}
        >
          {cntFeatures.map((feat) => {
            const btn = feat.with_auth ? (
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
        </SimpleGrid>
        <Space h={40} />
        <Text size={24} my="md" fw={600}>
          개발중인 서비스들
        </Text>
        <SimpleGrid
          cols={3}
          spacing="xl"
          breakpoints={[
            { maxWidth: 'md', cols: 2, spacing: 'xl' },
            { maxWidth: 'xs', cols: 1, spacing: 'xl' },
          ]}
        >
          {futureFeatures.map((feat) => {
            return <DashboardFeatureCard feat={feat} key={feat.title} />;
          })}
        </SimpleGrid>
        <Space h={96} />
      </Container>
    </ScrollArea>
  );
}
