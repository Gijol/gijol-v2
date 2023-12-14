import {
  Badge,
  Box,
  Button,
  createStyles,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import { section_titles, SectionTitleType } from '../lib/const/grad-certificate-inputs';
import { IconFileDownload } from '@tabler/icons-react';
import { Dispatch, SetStateAction } from 'react';

export default function CertificateSectionPanel({
  activeTab,
  setActiveTab,
}: {
  activeTab: SectionTitleType;
  setActiveTab: Dispatch<SetStateAction<SectionTitleType>>;
}) {
  const { classes } = useStyles();
  return (
    <Stack spacing={0}>
      <Box px="md" pb="xs">
        <Group position="apart" mb="lg">
          <Text component="h3" my={0}>
            ✍️ 입력 완성도
          </Text>
          <Badge>80%</Badge>
        </Group>
        <Progress value={80} />
      </Box>
      <Divider my="lg" />
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
      <Divider mt="lg" />
      <Button
        mt="xs"
        radius="md"
        variant="light"
        h="3rem"
        leftIcon={<IconFileDownload size={20} />}
      >
        변경사항 저장하기
      </Button>
      <Button
        h="3rem"
        mt="xs"
        radius="md"
        type="submit"
        color="dark"
        leftIcon={<IconFileDownload size={20} />}
      >
        PDF 생성하기
      </Button>
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
    marginTop: 4,
    borderRadius: theme.radius.md,
    '&:hover': {
      backgroundColor: theme.colors.gray[1],
      cursor: 'pointer',
    },
  },
}));
