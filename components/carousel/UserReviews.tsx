import React from 'react';
import { Carousel } from '@mantine/carousel';
import { Avatar, Badge, Center, Group, MantineColor, Paper, Stack, Text } from '@mantine/core';

export default function UserReviews() {
  const content = reviews.map((r, i) => {
    return (
      <Carousel.Slide key={i}>
        <Center h={'100%'} py="3rem">
          <Paper
            withBorder
            w={544}
            h="fit-content"
            mah={340}
            p="xl"
            pb={40}
            shadow="sm"
            radius={16}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 16,
            }}
          >
            <Group px="md">
              <Avatar variant={'filled'} size={'md'} radius={'lg'} />
              <Stack spacing={4}>
                <Text color="dimmed" size="lg">
                  {r.name}
                </Text>
                <Badge size="md" variant="outline" color={r.color}>
                  {r.grade}
                </Badge>
              </Stack>
            </Group>
            <Text
              align="start"
              size="md"
              px={40}
              color="dimmed"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
            >
              {r.review}
            </Text>
          </Paper>
        </Center>
      </Carousel.Slide>
    );
  });
  return (
    <Carousel
      my={80}
      height={'fit-content'}
      slideSize="100%"
      controlsOffset={'xl'}
      controlSize={24}
      loop
      styles={(theme) => ({
        slide: {
          minWidth: 600,
          backgroundColor: 'inherit',
          border: 'unset',
          margin: '0 200px',
        },
      })}
    >
      {content}
    </Carousel>
  );
}

interface Review {
  name: string;
  grade: string;
  color: MantineColor;
  review: string;
}

const reviews: Review[] = [
  {
    name: '익명',
    grade: '전기전자컴퓨터공학부 2학년',
    color: 'blue',
    review:
      '학교 생활을 어느정도 지내다 보니, 3학년을 지나 4학년을 앞두고 있는데 지금까지 어떤 강의를 들었고, 앞으로 어떤 강의를 들어야 하는지 너무 막막했었어요. 그런데 Gijol 서비스를 이용하고 나니 길이 보이는 것 같아요! 이런 서비스 만들어주셔서 감사합니다!',
  },
  {
    name: '황인선',
    grade: '전기전자컴퓨터공학부 3학년',
    color: 'blue',
    review:
      '학사편람 책으로 졸업이수조건을 찾아가며 불편하게 졸업 학점을 계산했는데, 클릭 몇 번만으로 어떤 수업을 들어야할지 알 수 있어 너무 편리해요..!! 🥹',
  },
  {
    name: '최승규',
    grade: '물리광과학부 4학년',
    color: 'orange',
    review:
      '들은 과목이 너무 많아서 졸업을 위해 필요한게 무엇인지 정리하기 어려웠는데 한눈에 보기좋게 정리해 보여줘서 짱이다!',
  },
];
