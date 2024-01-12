import Link from 'next/link';
import { useRouter } from 'next/router';

import { createStyles, Navbar, NavLink, rem, Drawer } from '@mantine/core';
import { getCntTab } from '@utils/status';
import { navLinks } from '@const/nav-links';

export function LayoutNavbar({
  matches,
  opened,
  onClose,
}: {
  matches: boolean;
  opened: boolean;
  onClose: () => void;
}) {
  const { classes } = useStyles();
  const router = useRouter();
  const cntRoute = getCntTab(router.route);
  const links = navLinks.map((link) => {
    return (
      <NavLink
        component={Link}
        key={link.label}
        active={link.label === cntRoute}
        label={link.label}
        href={link.href}
        rightSection={link.badge}
        icon={<link.icon size="1.25rem" stroke={1.5} />}
        sx={{ borderRadius: 8 }}
        my={4}
      />
    );
  });
  const navbar = (
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

  return (
    <>
      {matches ? (
        navbar
      ) : (
        <Drawer opened={opened} onClose={onClose} size="70%">
          {navbar}
        </Drawer>
      )}
    </>
  );
}
const useStyles = createStyles((theme) => ({
  navbar: {
    paddingTop: 0,
    wordBreak: 'keep-all',
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
