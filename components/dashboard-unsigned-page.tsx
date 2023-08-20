import { createStyles, rem, Title, Text, Container, Group, Button } from '@mantine/core';
import { useRouter } from 'next/router';
export default function DashboardUnsignedPage() {
  const { classes } = useStyles();
  const router = useRouter();
  return (
    <Container className={classes.root}>
      <Title className={classes.title}>비로그인 상태입니다..!</Title>
      <Text color="dimmed" size="lg" align="center" className={classes.description}>
        로그인 이후 이용 부탁드립니다!
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
