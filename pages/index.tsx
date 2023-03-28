import { Container, Box, Center, Text, Stack, Button, Blockquote } from '@mantine/core';
import MainLayoutHeader from '../components/Layouts/MainLayoutHeader';
import Image from 'next/image';
import macImg from '/public/images/MacBookAir.png';
import { CSSProperties } from 'react';
import SnowParticles from '../components/SnowParticles';

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
            <Stack h={'100%'} justify={'center'} w={'fit-content'} spacing={40}>
              <div>
                <Text size={40} weight={600} align={'start'} lh={1.4} color={'white'}>
                  학교 생활의 모든 것
                </Text>
                <Text size={40} weight={600} align={'start'} lh={1.4} color={'white'}>
                  Gijol과 함께
                </Text>
              </div>
              <Button>대쉬보드 이용하러 가기</Button>
            </Stack>
            <Image
              src={macImg}
              alt={'macbook air image'}
              width={700}
              height={400}
              style={macImgStyle}
            />
          </Container>
        </SnowParticles>
      </Box>
      <Box
        w={'100%'}
        h={500}
        sx={{ background: 'linear-gradient(180deg, rgba(10,35,64,1) 0%, rgba(40,62,81,1) 100%)' }}
      >
        <Container maw={1023} p={'xl'} h={'100%'}>
          <Center h={'100%'}>
            <Blockquote cite={'- Gijol 개발자 일동'}>
              <Text
                size={32}
                align={'center'}
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                weight={500}
              >
                Gijol은 여러분들의 더욱 편리한
              </Text>
              <Text
                size={32}
                align={'center'}
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                weight={500}
              >
                학교생활을 만드는데 가장 큰 가치를 둡니다.
              </Text>
            </Blockquote>
          </Center>
        </Container>
      </Box>
      <Box w={'100%'} h={800}>
        <Container maw={1023} p={'xl'} h={'100%'}>
          <Center h={'100%'}>
            <Blockquote cite={'- Gijol 개발자 일동'}>
              <Text size={32} align={'center'}>
                Gijol은 여러분들이 더욱 편리한
              </Text>
              <Text size={32} align={'center'}>
                학교생활을 할 수 있는데 가장 큰 가치를 둡니다.
              </Text>
            </Blockquote>
          </Center>
        </Container>
      </Box>
    </>
  );
}

const macImgStyle: CSSProperties = {
  transform: 'perspective(75em), rotateX(18deg)',
  filter: 'drop-shadow(4px 8px 12px #141517)',
};
