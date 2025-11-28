import { homeContents } from '@const/content-data';

import {
  Button,
  Container,
  Group,
  List,
  Paper,
  ScrollArea,
  SimpleGrid,
  Space,
  Text,
  ThemeIcon,
} from '@mantine/core';

import DashboardHeroHeader from '@components/dashboard-hero-header';
import DashboardFeatureCard from '@components/dashboard-feature-card';
import { IconCheck, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();
  const cntFeatures = homeContents.main.cntFeatures;
  const futureFeatures = homeContents.main.betaFeatures;
  return (
    <ScrollArea h="fit-content">
      <DashboardHeroHeader />
      <Container size="lg">
        {/* ▶️ ZEUS 엑셀 업로드 안내 박스 */}
        <Paper
          radius="md"
          p="lg"
          mt={40}
          sx={(theme) => ({
            borderColor: theme.colors.red[6],
            borderWidth: 1,
            borderStyle: 'solid',
            backgroundColor: theme.colors.red[0],
          })}
        >
          <Group position="apart" align="flex-start">
            <div>
              <Text size="lg" fw={700} mb={6} color="red.6">
                먼저 성적표 엑셀을 업로드해주세요
              </Text>
              <Text size="sm" c="dimmed" mb="xs">
                현재 Gijol-v2는 <b>로그인 없이</b> 동작하며, 한 번의 엑셀 업로드로
                <b> 졸업요건 확인</b>과 <b>내 수강현황</b>을 확인할 수 있습니다.
              </Text>

              <Text size="sm" fw={500} mt="xs" mb={4}>
                ✅ 업로드해야 하는 파일 (ZEUS 기준):
              </Text>
              <List
                size="sm"
                spacing={4}
                icon={
                  <ThemeIcon size={18} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>학교 제우스(Zeus) 시스템 접속</List.Item>
                <List.Item>
                  상단 메뉴에서 <b>성적 &gt; 개인성적조회</b>로 이동
                </List.Item>
                <List.Item>
                  화면 <b>상단 우측</b>에 있는 <b>“Report card (KOR)”</b> 버튼 클릭
                </List.Item>
                <List.Item>다운로드된 엑셀 파일을 Gijol에서 업로드</List.Item>
              </List>
            </div>
            <Button
              size="lg"
              radius="md"
              leftIcon={<IconUpload size="1.2rem" />}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              sx={{
                fontWeight: 700,
                animation: 'pulse 1.8s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(0, 122, 255, .4)' },
                  '70%': { boxShadow: '0 0 0 12px rgba(0, 122, 255, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(0, 122, 255, 0)' },
                },
              }}
              onClick={() => router.push('/dashboard/graduation/upload')}
            >
              업로드하러 가기
            </Button>{' '}
          </Group>
        </Paper>

        <Space h={32} />

        {/* 🔹 지금 이용 가능한 기능들 (졸업요건 / 수강현황) */}
        <Text size={24} my="md" fw={600}>
          지금 이용 가능한 서비스
        </Text>
        <Text size="sm" c="dimmed" mb="sm">
          성적표 엑셀을 업로드하면, 아래 기능들을 바로 사용하실 수 있어요.
        </Text>
        <SimpleGrid
          cols={3}
          spacing="xl"
          breakpoints={[
            { maxWidth: 'md', cols: 2, spacing: 'xl' },
            { maxWidth: 'xs', cols: 1, spacing: 'xl' },
          ]}
        >
          {cntFeatures.map((feat) => (
            <DashboardFeatureCard key={feat.title} feat={feat} />
          ))}
        </SimpleGrid>
        <Space h={96} />
      </Container>
    </ScrollArea>
  );
}
