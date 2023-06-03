import {
  Container,
  Box,
  Center,
  Text,
  Stack,
  Button,
  Blockquote,
  ThemeIcon,
  Tabs,
} from '@mantine/core';
import { IconPackages, IconSchool, IconExternalLink } from '@tabler/icons-react';
import MainLayoutHeader from '../components/Layouts/MainLayoutHeader';
import Image from 'next/image';
import { CSSProperties } from 'react';
import SnowParticles from '../components/SnowParticles';
import MainPageFnTab from '../components/Tab/MainPageFnTab';
import macImg from '/public/images/MacBookAir.png';
import dashboardImg from '/public/images/Gijol_Dasboard.png';
import UserReviews from '../components/Carousel/UserReviews';
import router from 'next/router';

export default function MainPage() {
  return (
    <>
      <MainLayoutHeader />
      <Box w="100%">
        <SnowParticles>
          <Container
            h={700}
            maw={1200}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack h="100%" justify="center" w="fit-content" spacing={40}>
              <div>
                <Text size={40} weight={600} align="start" lh={1.4} color="white">
                  학교 생활의 모든 것
                </Text>
                <Text size={40} weight={600} align="start" lh={1.4} color="white">
                  Gijol과 함께
                </Text>
              </div>
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                대쉬보드 이용하러 가기
              </Button>
            </Stack>
            <Image
              src={macImg}
              alt="macbook air image"
              width={700}
              height={400}
              style={macImgStyle}
            />
          </Container>
        </SnowParticles>
      </Box>
      <Box
        w="100%"
        h="fit-content"
        sx={{
          background: 'linear-gradient(180deg, rgba(10,35,64,1) 0%, rgba(23,46,72,1) 100%)',
          border: '1px solid rgba(241, 245, 249, 0.05)',
        }}
      >
        <Container maw={1023} p="xl" h="100%">
          <Center h="100%" mt={60}>
            <Blockquote cite={'- Gijol 개발자 일동'}>
              <Text
                size={32}
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
      <Box w="100%" h={1400} bg="#172e48" sx={{ border: '1px solid rgba(241, 245, 249, 0.05)' }}>
        <Container maw={1023} p="xl" h="100%">
          <ThemeIcon variant="gradient" size={60} gradient={{ from: 'indigo', to: 'cyan' }} mt={60}>
            <IconPackages size={36} stroke={1.2} />
          </ThemeIcon>
          <Text component="h2" size={36} align="start" color="white" mt={40} mb={24}>
            Gijol이 제공하는 기능들
          </Text>
          <Text component="p" size={16} align="start" color="dimmed">
            Gijol에서는 아래와 같은 기능들을 이용할 수 있습니다. 몇몇 기능들은 아직 개발중에 있으니
            지켜봐주세요!
          </Text>
          <MainPageFnTab c="gray" mt={56} defaultValue="gradStatus">
            <Tabs.List sx={{ borderBottom: '1px solid rgba(241, 245, 249, 0.05)' }}>
              <Tabs.Tab c="gray" value="gradStatus" icon={<IconSchool size="1rem" />}>
                졸업요건
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="gradStatus" pt="md" c="gray.2">
              <Text py={24} align="start" size="lg" color="gray.2">
                ZEUS 사이트에서 개인 성적 엑셀 파일을 다운로드 받아 업로드하면 해당 파일을 분석하여
                졸업요건 충족 여부를 알려드리며 충족되지 않은 부분들에 대한 피드백을 드립니다!
              </Text>
              <Container py="xl">
                <Image src={dashboardImg} alt="macbook air image" width={800} height={500} />
              </Container>
              <Button
                mt={40}
                size="lg"
                variant="gradient"
                leftIcon={<IconExternalLink size="0.9rem" />}
                onClick={() => router.push('/dashboard')}
              >
                기능 이용해보러 가기
              </Button>
            </Tabs.Panel>
          </MainPageFnTab>
        </Container>
      </Box>
    </>
  );
}

const macImgStyle: CSSProperties = {
  transform: 'perspective(75em), rotateX(18deg)',
  filter: 'drop-shadow(4px 8px 12px #141517)',
};
