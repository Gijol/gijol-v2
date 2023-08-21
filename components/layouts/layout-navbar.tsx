import { Text, createStyles, Divider, Navbar, NavLink, rem, Drawer } from '@mantine/core';
import Link from 'next/link';
import { navLinks } from '../../lib/const/nav-links';
import { useRouter } from 'next/router';
import { getCntTab } from '../../lib/utils/status';
import { useMediaQuery } from '@mantine/hooks';

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
