import { Text, createStyles, Divider, Navbar, NavLink, rem } from '@mantine/core';
import { IconHome, IconCalendar, IconDeviceDesktopAnalytics } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { navLinks } from '../../lib/const/navLinks';

const useStyles = createStyles((theme) => ({
  navbar: {
    paddingTop: 0,
  },

  section: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    marginBottom: theme.spacing.md,

    '&:not(:last-of-type)': {
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
    },
  },
}));

export function LayoutNavbar({ opened }: { opened: boolean }) {
  const { classes } = useStyles();
  const [active, setActive] = useState('');
  const links = navLinks.map((link) => {
    return (
      <NavLink
        component={Link}
        key={link.label}
        active={link.label === active}
        label={link.label}
        href={link.href}
        icon={<link.icon size="1.25rem" stroke={1.5} />}
        onClick={() => setActive(link.label)}
        sx={{ borderRadius: 8 }}
        my={4}
      />
    );
  });
  return (
    <Navbar
      p="sm"
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 200, lg: 240 }}
      className={classes.navbar}
    >
      <Navbar.Section>{links}</Navbar.Section>
    </Navbar>
  );
}
