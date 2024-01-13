import React from 'react';
import { Box, Card, createStyles, Group, rem, Stack, Text } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';
import Balancer from 'react-wrap-balancer';

export default function DashboardFeatureCard({
  feat,
}: {
  feat: {
    title: string;
    description: string;
    icon: (props: TablerIconsProps) => JSX.Element;
    route?: string;
  };
}) {
  const { classes, theme } = useStyles();
  return (
    <Card radius="md" p="lg" className={classes.card} withBorder>
      <Stack justify="space-between" h="100%">
        <div>
          <feat.icon size="2rem" stroke={1.4} color={theme.fn.primaryColor()} />
          <Text fz="lg" fw={600} className={classes.cardTitle} mt="xs">
            {feat.title}
          </Text>
          <Text fz="sm" c="dimmed" mt="sm" mih="5rem">
            <Balancer ratio={0.2}>{feat.description}</Balancer>
          </Text>
        </div>
      </Stack>
    </Card>
  );
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(34),
    fontWeight: 900,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(24),
    },
  },

  description: {
    maxWidth: 600,
    margin: 'auto',

    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },

  card: {
    border: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  cardTitle: {
    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
    },
  },
}));
