import { ActionIcon, Group, MediaQuery, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
      <Group position="center">
        <ActionIcon
          onClick={() => toggleColorScheme()}
          size="md"
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            color: theme.colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.blue[6],
          })}
        >
          {colorScheme === 'dark' ? (
            <IconSun size={20} stroke={1.5} />
          ) : (
            <IconMoonStars size={20} stroke={1.5} />
          )}
        </ActionIcon>
      </Group>
    </MediaQuery>
  );
}
