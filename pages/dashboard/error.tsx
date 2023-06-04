import { createStyles, rem, Title, Text, Container, Group, Button } from '@mantine/core';
import { useRouter } from 'next/router';

export default function Error() {
  const { classes } = useStyles();
  const router = useRouter();
  return (
    <Container className={classes.root}>
      <div className={classes.label}>{router.query.status}</div>
      <Title className={classes.title}>비밀 공간을 찾으셨군요!</Title>
      <Text color="dimmed" size="lg" align="center" className={classes.description}>
        안타깝게도 오류 페이지일 뿐입니다. 🥲 주소를 잘못 입력했거나 페이지가 다른 URL로 이동되었을
        수 있습니다. 또는 비 로그인으로 페이지에 접속했을 수 있습니다.
      </Text>
      <Group position="center">
        <Button variant="subtle" size="md" onClick={() => router.push('/dashboard')}>
          대쉬보드로 돌아가기
        </Button>
        <Button variant="subtle" size="md" onClick={() => router.push('/login')}>
          로그인 하러가기
        </Button>
      </Group>
    </Container>
  );
}

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(80),
  },

  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(100),
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(120),
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(38),

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(32),
    },
  },

  description: {
    maxWidth: rem(500),
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
  },
}));
