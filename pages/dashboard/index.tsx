import { Container, ScrollArea, SimpleGrid, Space, Text } from '@mantine/core';
import { homeContents } from '../../lib/const/content-data';
import { useRouter } from 'next/router';
import DashboardFeatureCard from '../../components/dashboard-feature-card';
import DashboardHeroHeader from '../../components/dashboard-hero-header';

export default function HomePage() {
  const router = useRouter();
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
            return <DashboardFeatureCard key={feat.title} feat={feat} />;
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
