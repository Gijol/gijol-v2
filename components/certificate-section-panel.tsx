import {
  Badge,
  Button,
  createStyles,
  Divider,
  Group,
  MediaQuery,
  Paper,
  Progress,
  Stack,
  Tabs,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { Dispatch, SetStateAction } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconFileCheck, IconFileDownload } from '@tabler/icons-react';
import { section_titles, SectionTitleType } from '@const/grad-certificate-inputs';

export default function CertificateSectionPanel({
  activeTab,
  setActiveTab,
}: {
  activeTab: SectionTitleType;
  setActiveTab: Dispatch<SetStateAction<SectionTitleType>>;
}) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { getValues } = useFormContext();
  return (
    <Stack spacing={0}>
      <Paper p="md" withBorder radius="md">
        <Group position="apart" mb="lg">
          <Text component="h3" my={0}>
            ✍️ 입력 완성도
          </Text>
          <Badge>80%</Badge>
        </Group>
        <Progress value={80} />
      </Paper>
      <Tabs.List className={classes.menu_list}>
        {section_titles.map((title) => (
          <Tabs.Tab
            key={title}
            value={title}
            className={classes.menu_tab}
            onClick={() => setActiveTab(title)}
            bg={activeTab === title ? 'gray.1' : 'transparent'}
          >
            <Text align="left">{title}</Text>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <MediaQuery styles={{ display: 'none' }} smallerThan="xl">
        <div className={classes.menu_list}>
          <Divider my="xs" />
          <Group spacing="xs" grow>
            <Button
              color="teal"
              variant="light"
              className={classes.save_button}
              leftIcon={<IconFileCheck size={20} />}
            >
              임시저장
            </Button>
            <Button
              color="red"
              variant="light"
              className={classes.reset_button}
              leftIcon={<IconFileDownload size={20} color={theme.colors.red[6]} />}
            >
              리셋하기
            </Button>
          </Group>
          <Button
            type="submit"
            color="dark"
            className={classes.generate_button}
            leftIcon={<IconFileDownload size={20} />}
            onClick={() => console.log(getValues())}
          >
            PDF 생성하기
          </Button>
        </div>
      </MediaQuery>
    </Stack>
  );
}

const useStyles = createStyles((theme) => ({
  menu_list: {
    display: 'flex',
    flexDirection: 'column',
  },
  menu_tab: {
    backgroundColor: 'unset', // override default styles
    border: 'none',
    fontSize: '15px',
    fontWeight: 500,
    padding: '12.5px 16px',
    marginTop: theme.spacing.xs,
    borderRadius: theme.radius.md,
    '&:hover': {
      backgroundColor: theme.colors.gray[1],
      cursor: 'pointer',
    },
  },
  save_button: {
    border: ` 1px solid ${theme.colors.teal[6]}`,
    borderRadius: theme.radius.md,
    height: '2.5rem',
  },
  reset_button: {
    border: ` 1px solid ${theme.colors.red[6]}`,
    borderRadius: theme.radius.md,
    height: '2.5rem',
  },
  generate_button: {
    marginTop: theme.spacing.xs,
    borderRadius: theme.radius.md,
    height: '2.5rem',
  },
}));
