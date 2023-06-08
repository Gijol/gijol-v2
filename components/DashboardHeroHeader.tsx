import {
  createStyles,
  Title,
  Input,
  Text,
  Button,
  Container,
  rem,
  Modal,
  Textarea,
  Checkbox,
  Group,
  Box,
  MediaQuery,
} from '@mantine/core';
import { Dots } from './Dots';
import { useDebouncedState, useDisclosure } from '@mantine/hooks';
import { IconAt } from '@tabler/icons-react';
import React, { BaseSyntheticEvent, useState } from 'react';
import { sendFeedbackToNotion } from '../lib/utils/notion';
import { notifications } from '@mantine/notifications';

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    paddingTop: rem(120),
    paddingBottom: rem(80),

    [theme.fn.smallerThan('sm')]: {
      width: '100%',
      paddingTop: rem(80),
      paddingBottom: rem(60),
    },
  },

  inner: {
    position: 'relative',
    zIndex: 1,
  },

  dots: {
    position: 'absolute',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],

    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  dotsLeft: {
    left: 0,
    top: 0,
  },

  title: {
    textAlign: 'center',
    fontWeight: 800,
    fontSize: rem(40),
    letterSpacing: -1,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    [theme.fn.smallerThan('xs')]: {
      fontSize: rem(28),
      textAlign: 'left',
    },
  },

  highlight: {
    color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6],
  },

  description: {
    textAlign: 'center',

    [theme.fn.smallerThan('xs')]: {
      textAlign: 'left',
      fontSize: theme.fontSizes.md,
    },
  },
  //
  // controls: {
  //   marginTop: theme.spacing.lg,
  //   display: 'flex',
  //   justifyContent: 'center',
  //
  //   [theme.fn.smallerThan('xs')]: {
  //     flexDirection: 'column',
  //   },
  // },
  //
  // control: {
  // '&:not(:first-of-type)': {
  //   marginLeft: theme.spacing.md,
  // },
  // [theme.fn.smallerThan('xs')]: {
  //   height: rem(42),
  //   fontSize: theme.fontSizes.md,
  //
  //   '&:not(:first-of-type)': {
  //     marginTop: theme.spacing.md,
  //     marginLeft: 0,
  //   },
  // },
  // },
}));

export default function DashboardHeroHeader() {
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);
  const [title, setTitle] = useDebouncedState('', 200);
  const [description, setDescription] = useDebouncedState('', 200);
  const [email, setEmail] = useDebouncedState('', 200);
  const [checked, setChecked] = useState(false);
  const emailErrorState =
    email === '' || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email)
      ? ''
      : '유효하지 않은 이메일 형식입니다';
  const isNotEmpty = Boolean(title && description && email && checked);
  return (
    <>
      <Container className={classes.wrapper} size="xl">
        <Dots className={classes.dots} style={{ left: 0, top: 0 }} />
        <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
        <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
        <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

        <div className={classes.inner}>
          <Title className={classes.title}>
            <Text component="span" className={classes.highlight} inherit>
              Gijol-v2
            </Text>{' '}
            에 오신 것을 환영합니다! 🙌
          </Title>

          <Container p={0} size={600} className={classes.description}>
            <Text size="lg" color="dimmed" pt="md">
              아래에서{' '}
              <Text component="span" fw={500} color="black">
                새로워진 Gijol 버전 2
              </Text>
              의 여러 가지 기능들을 살펴보세요! 또한 있으면 좋을 듯한 기능들이 있다면 아래 버튼을
              눌러 의견을 제출해주세요!
            </Text>
          </Container>
          <Group position="center" py="md">
            <Button size="lg" variant="default" color="gray" onClick={open} w={300}>
              의견 작성하기
            </Button>
          </Group>
        </div>
      </Container>
      <Modal
        opened={opened}
        onClose={close}
        title="기능 및 개선 요청"
        centered
        styles={{ title: { fontWeight: 600 } }}
      >
        <Input.Wrapper id="fn_name" label="기능 명" required mx="auto" my={8} withAsterisk>
          <Input
            id="fn_name"
            placeholder="기능 이름을 입력해주세요"
            onChange={(e: BaseSyntheticEvent) => setTitle(e.target.value)}
          />
        </Input.Wrapper>
        <Textarea
          my={8}
          label="기능 설명"
          placeholder="기능에 대해서 짧게 설명해주세요"
          withAsterisk
          onChange={(e: BaseSyntheticEvent) => setDescription(e.target.value)}
        />
        <Input.Wrapper
          id="email"
          label="이메일"
          required
          mx="auto"
          my={8}
          description="추후 기능 개발 적용 여부 및 소정의 감사를 위해 수집됩니다!"
          error={emailErrorState}
          withAsterisk
        >
          <Input
            icon={<IconAt size="1rem" />}
            id="email"
            error={emailErrorState}
            placeholder="이메일을 입력해주세요"
            onChange={(e: BaseSyntheticEvent) => setEmail(e.target.value)}
          />
        </Input.Wrapper>
        <Checkbox
          size="xs"
          label="이메일 정보 수집 및 이용에 동의합니다"
          my="md"
          onChange={(e) => setChecked(e.currentTarget.checked)}
        />
        <Group position="right">
          <Button
            onClick={async () => {
              if (!isNotEmpty) {
                notifications.show({
                  color: 'orange',
                  title: '빈 항목이 있습니다',
                  message: '모든 항목을 입력 부탁드립니다! 감사합니다!',
                });
              } else {
                await sendFeedbackToNotion(title, description, email);
                await close();
              }
            }}
          >
            의견 제출하기
          </Button>
        </Group>
      </Modal>
    </>
  );
}
