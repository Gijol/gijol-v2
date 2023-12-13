import {
  Badge,
  Box,
  Button,
  Center,
  createStyles,
  Divider,
  Flex,
  Group,
  Paper,
  Progress,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { IconFileDownload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  section_titles,
  sections,
  SectionTitleType,
  TextInputProps,
} from '../../../lib/const/grad-certificate-inputs';

export default function CertificateBuilder() {
  const { classes } = useStyles();
  const methods = useForm();
  const [activeTab, setActiveTab] = useState<SectionTitleType>(section_titles[0]);
  const onSubmit = (data: any) => console.log(data);
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Tabs unstyled defaultValue="신청자 정보">
          <Center>
            <Flex>
              <Paper w={750} p={40} withBorder radius="lg">
                <Stack spacing="md" className={classes.formStack}>
                  <Text component="h2" size={30} align="center" my="lg">
                    섹션 제목
                  </Text>
                  <Divider />
                  {sections.map((section) => (
                    <SectionPanelWithInputs
                      key={section.title}
                      inputs={section.inputs}
                      title={section.title}
                      label={section.section_label}
                    />
                  ))}
                </Stack>
              </Paper>
              <Paper w={280} py={24} px={16} withBorder radius="lg" ml={20} h="fit-content">
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
                  <Tabs.List className={classes.menuList}>
                    {section_titles.map((title) => (
                      <Tabs.Tab
                        key={title}
                        value={title}
                        className={classes.menuTab}
                        onClick={() => setActiveTab(title)}
                        bg={activeTab === title ? 'gray.1' : 'transparent'}
                      >
                        <Text align="left">{title}</Text>
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                  <Divider mt="lg" />
                  <Button
                    mt="lg"
                    radius="md"
                    type="submit"
                    color="dark"
                    leftIcon={<IconFileDownload size={20} />}
                  >
                    PDF 생성하기
                  </Button>
                </Stack>
              </Paper>
            </Flex>
          </Center>
        </Tabs>
      </form>
    </FormProvider>
  );
}

function SectionPanelWithInputs({
  inputs,
  title,
  label,
}: {
  inputs: Array<TextInputProps>;
  title: string;
  label: SectionTitleType;
}) {
  const { register } = useFormContext();
  return (
    <Tabs.Panel value={label} key={title}>
      {inputs.map((item) => (
        <TextInput
          key={item.value}
          type="text"
          label={item.label}
          placeholder={item.placeholder}
          mt="md"
          styles={{
            label: {
              marginBottom: '8px',
            },
          }}
          {...register(`${title}-${item.value}`)}
        />
      ))}
    </Tabs.Panel>
  );
}

const useStyles = createStyles((theme) => ({
  formStack: {
    '& .mantine-TextInput-input': {
      backgroundColor: '#f2f3f7',
      borderRadius: theme.radius.md,
      padding: '2px 16px',
      fontSize: theme.fontSizes.sm,
      lineHeight: 'normal',
      height: '48px',
      border: 'none',
      '::placeholder': {
        color: theme.colors.gray[6],
      },
      ':focus::placeholder': {
        color: 'transparent',
      },
      ':focus-within': {
        border: '2px solid',
        backgroundColor: 'transparent',
        borderColor: theme.colors.blue[5],
      },
    },
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
  },
  menuTab: {
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
