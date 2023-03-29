import React from 'react';
import { Carousel } from '@mantine/carousel';
import { Avatar, Badge, Center, Group, Paper, Stack, Text } from '@mantine/core';

export default function UserReviews() {
  return (
    <Carousel
      my={80}
      height={'fit-content'}
      slideSize="100%"
      controlsOffset={'xl'}
      controlSize={24}
      styles={(theme) => ({
        slide: {
          minWidth: 600,
          backgroundColor: 'inherit',
          border: 'unset',
          margin: '0 200px',
        },
      })}
    >
      <Carousel.Slide>
        <Center h={'100%'}>
          <Paper
            bg={'#1e293b'}
            w={544}
            h={'fit-content'}
            mah={340}
            p={'xl'}
            pb={40}
            shadow={'sm'}
            radius={16}
            sx={{
              boxShadow: 'inset 0 1px 0 0 #ffffff0d',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 16,
            }}
          >
            <Group p={'md'}>
              <Avatar variant={'filled'} size={'md'} radius={'lg'} />
              <Stack spacing={4}>
                <Text color={'dimmed'} size={'lg'}>
                  서땡땡
                </Text>
                <Badge size={'lg'} variant={'outline'}>
                  전기전자컴퓨터공학과 2학년
                </Badge>
              </Stack>
            </Group>
            <Text
              color={'#94a3b8'}
              align={'start'}
              size={'md'}
              px={40}
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
            >
              학교 생활을 어느정도 지내다 보니, 3학년을 지나 4학년을 앞두고 있는데 지금까지 어떤
              강의를 들었고, 앞으로 어떤 강의를 들어야 하는지 너무 막막했었어요. 그런데 Gijol
              서비스를 이용하고 나니 길이 보이는 것 같아요! 이런 서비스 만들어주셔서 감사합니다!
            </Text>
          </Paper>
        </Center>
      </Carousel.Slide>
      <Carousel.Slide>
        <Center h={'100%'}>
          <Paper
            bg={'#1e293b'}
            w={544}
            h={'fit-content'}
            mah={340}
            p={'xl'}
            pb={40}
            shadow={'sm'}
            radius={16}
            sx={{
              boxShadow: 'inset 0 1px 0 0 #ffffff0d',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 16,
            }}
          >
            <Group p={'md'}>
              <Avatar variant={'filled'} size={'md'} radius={'lg'} />
              <Stack spacing={4}>
                <Text color={'dimmed'} size={'lg'}>
                  서땡땡
                </Text>
                <Badge size={'lg'} variant={'outline'}>
                  전기전자컴퓨터공학과 2학년
                </Badge>
              </Stack>
            </Group>
            <Text
              color={'#94a3b8'}
              align={'start'}
              size={'md'}
              px={40}
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
            >
              정말 편리하네요! 더 고생해주십쇼!
            </Text>
          </Paper>
        </Center>
      </Carousel.Slide>
      <Carousel.Slide>
        <Center h={'100%'}>
          <Paper
            bg={'#1e293b'}
            w={544}
            h={'fit-content'}
            mah={340}
            p={'xl'}
            pb={40}
            shadow={'sm'}
            radius={16}
            sx={{
              boxShadow: 'inset 0 1px 0 0 #ffffff0d',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 16,
            }}
          >
            <Group p={'md'}>
              <Avatar variant={'filled'} size={'md'} radius={'lg'} />
              <Stack spacing={4}>
                <Text color={'dimmed'} size={'lg'}>
                  서땡땡
                </Text>
                <Badge size={'lg'} variant={'outline'}>
                  전기전자컴퓨터공학과 2학년
                </Badge>
              </Stack>
            </Group>
            <Text
              color={'#94a3b8'}
              align={'start'}
              size={'md'}
              px={40}
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
            >
              Gijol이 미래다!
            </Text>
          </Paper>
        </Center>
      </Carousel.Slide>
    </Carousel>
  );
}
