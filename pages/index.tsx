import {
  Container,
  Box,
  Center,
  Text,
  Stack,
  Button,
  Blockquote,
  Group,
  rem,
  SimpleGrid,
  Paper,
  ThemeIcon,
} from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import { CSSProperties } from 'react';
import router from 'next/router';
import Image from 'next/image';
import MainLayoutHeader from '../components/layouts/main-layout-header';
import UserReviews from '../components/carousel/UserReviews';
import macImg from '/public/images/MacBookAir.png';
import {
  IconPackages,
  IconPresentation,
  IconPresentationAnalytics,
  IconUser,
  TablerIconsProps,
} from '@tabler/icons-react';

export default function MainPage() {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });
  const service_section = services.map((s) => {
    return (
      <Paper key={s.name} withBorder shadow="sm" p="2rem" radius="lg">
        <ThemeIcon variant="gradient" size="2.8rem" gradient={{ from: 'indigo', to: 'cyan' }}>
          <s.Icon size="1.8rem" stroke={1} />
        </ThemeIcon>
        <Text fz="1.2rem" fw={600} py="md">
          {s.name}
        </Text>
        <Text size="sm" color="dimmed" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
          {s.description}
        </Text>
      </Paper>
    );
  });
  return (
    <>
      <MainLayoutHeader />

      {/* 메인 헤더 */}
      <Box w="100%">
        <Container maw={1200}>
          <Stack h="100%" justify="center" spacing={40} mt="5rem">
            <div>
              <Text
                size="3rem"
                weight={600}
                align="center"
                lh={1.4}
                color="gray.8"
                sx={{ letterSpacing: -1.6 }}
              >
                학교 생활의 모든 것
              </Text>
              <Text size={rem(48)} weight={600} align="center" lh={1.4} color="gray.8">
                Gijol과 함께
              </Text>
            </div>
            <Group position="center">
              <Button
                onClick={() =>
                  scrollIntoView({
                    alignment: 'center',
                  })
                }
                variant="light"
              >
                기능 보러가기
              </Button>
              <Button onClick={() => router.push('/dashboard')}>대쉬보드 이용하기</Button>
            </Group>
          </Stack>
          <Group position="center" my="6rem">
            <Image
              src={macImg}
              alt="macbook air image"
              width={700}
              height={400}
              style={macImgStyle}
            />
          </Group>
        </Container>
      </Box>

      {/* 지졸 설명 */}
      <Box w="100%" h="fit-content">
        <Container maw={1023} p="xl" h="100%">
          <Center h="100%" mt={60}>
            <Blockquote cite={'- Gijol 개발자 일동'}>
              <Text
                size="2rem"
                align="center"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                weight={500}
              >
                Gijol은 여러분들의 더욱 편리한
              </Text>
              <Text
                size={32}
                align="center"
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                weight={500}
              >
                학교생활을 만드는데 가장 큰 가치를 둡니다.
              </Text>
            </Blockquote>
          </Center>
          <UserReviews />
        </Container>
      </Box>

      {/*기능 설명 부분*/}
      <Box w="100%" h="fit-content">
        <Container maw={1023} p="xl" h="100%">
          <Text size="2rem" fw={600} align="center" color="gray.8" mt={40} mb={24} ref={targetRef}>
            Gijol은 다음과 같은 기능들을 제공합니다
          </Text>
          <SimpleGrid
            cols={3}
            py="2.5rem"
            breakpoints={[
              { maxWidth: 'sm', cols: 2 },
              { maxWidth: 'xs', cols: 1 },
            ]}
          >
            {service_section}
          </SimpleGrid>
        </Container>
      </Box>
    </>
  );
}

const macImgStyle: CSSProperties = {
  transform: 'perspective(75em), rotateX(18deg)',
  filter: 'drop-shadow(2px 4px 8px #868E96)',
};

interface MainService {
  name: string;
  description: string;
  Icon: (props: TablerIconsProps) => JSX.Element;
}

const services: MainService[] = [
  {
    name: '졸업요건 확인하기',
    description: '나의 졸업요건 충족 여부와 피드백을 받아보세요 ',
    Icon: IconPackages,
  },
  {
    name: '강의정보 확인하기',
    description: '매 학기 열리는 강의 정보를 검색해보세요',
    Icon: IconPresentationAnalytics,
  },
  {
    name: '내 정보 확인하기',
    description: '매 학기 열리는 강의 정보를 검색해보세요',
    Icon: IconUser,
  },
];
