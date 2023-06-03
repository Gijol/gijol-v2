import React from 'react';
import { Box, Card, createStyles, Group, rem, Space, Stack, Text } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';

export default function DashboardFeatureCard({
  feat,
  button,
}: {
  feat: {
    title: string;
    description: string;
    icon: (props: TablerIconsProps) => JSX.Element;
    route?: string;
  };
  button?: React.ReactNode;
}) {
  const { classes, theme } = useStyles();
  return (
    <Card shadow="xs" radius="md" p="md" w={400} className={classes.card} withBorder>
      <Stack justify="space-between">
        <div>
          <feat.icon size={rem(40)} stroke={2} color={theme.fn.primaryColor()} />
          <Group>
            <Text fz="lg" fw={600} className={classes.cardTitle} mt="sm">
              {feat.title}
            </Text>
          </Group>
          <Text fz="sm" c="dimmed" mt="sm">
            {feat.description}
          </Text>
        </div>
        <Box mt="md">{button}</Box>
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
