import React from 'react';
import { createStyles, Title, Text, Container, rem } from '@mantine/core';
import { CustomDots } from './custom-dots';
import Balancer from 'react-wrap-balancer';

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
}));

export default function DashboardHeroHeader() {
  const { classes } = useStyles();

  return (
    <Container className={classes.wrapper} size="xl">
      <CustomDots className={classes.dots} style={{ left: 0, top: 0 }} />
      <CustomDots className={classes.dots} style={{ left: 60, top: 0 }} />
      <CustomDots className={classes.dots} style={{ left: 0, top: 140 }} />
      <CustomDots className={classes.dots} style={{ right: 0, top: 60 }} />

      <div className={classes.inner}>
        <Title className={classes.title}>
          <Text component="span" className={classes.highlight} inherit>
            Gijol-v2
          </Text>{' '}
          에 오신 것을 환영합니다! 🙌
        </Title>

        <Container p={0} size={600} className={classes.description}>
          <Balancer>
            <Text size="lg" color="dimmed" pt="xl" span>
              아래에서{' '}
              <Text span color="red" size="xl" fw={700}>
                주의사항
              </Text>
              을 꼭 확인하시고, 대시보드의 다양한 기능들을 활용해보세요!
            </Text>
          </Balancer>
        </Container>
      </div>
    </Container>
  );
}
