import { useState } from 'react';

import {
  ActionIcon,
  Box,
  Col,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Drawer,
  MediaQuery,
  rem,
  createStyles,
  Title,
  Button,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { IconFileCheck, IconFileShredder, IconMenu2 } from '@tabler/icons-react';
import CertificateSectionPanel from '@components/certificate-section-panel';

import {
  section_titles,
  generateInputSections,
  SectionTitleType,
  InputOrUncontrolledComponentProps,
} from '@const/grad-certificate-inputs';
import { parseCertificate } from '@utils/parser/grade/certificate-parser';

import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import CertificateDropzone from '@components/certificate-dropzone';

const getDefaultOrSavedValue = () => {
  return {
    OU: {
      summer_session: {
        subjects: [],
      },
    },
  } as unknown as Record<string, any>;
};

export default function CertificateBuilder() {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  // form management
  const methods = useForm({
    defaultValues: getDefaultOrSavedValue(),
  });

  // section panel tabs & drawer
  const [activeTab, setActiveTab] = useState<SectionTitleType>(section_titles[0]);
  const [opened, { open, close }] = useDisclosure(false);

  const [isUpperThan2021, setIsUpperThan2021] = useState<string | null>(null);

  const onSubmit = (data: any) => console.log(data);
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} autoComplete="off">
        <Container size="lg" mb="xl" fluid className={classes.container}>
          <Tabs unstyled defaultValue="신청자 정보">
            <Grid m={0} justify="center" maw={1100} mx="auto" columns={6}>
              <Col lg={6} md={6}>
                <Title order={3} mt={40} mb="lg">
                  졸업 이수요건 확인서 생성기 🪄
                </Title>
                <Divider mt="md" />
              </Col>
              <Col lg={6} md={6}>
                <CertificateDropzone
                  onDrop={(file) => {
                    parseCertificate(file[0] as File, methods);
                    setIsUpperThan2021(
                      parseInt(methods.getValues('USER.studentNumber')?.substring(0, 4)) >= 2021
                        ? '2021~'
                        : '~2020'
                    );
                  }}
                />
              </Col>
              <Col xl="auto" lg="auto" md="auto">
                <Paper withBorder className={classes.form_container}>
                  <Stack spacing="md" className={classes.form_stack}>
                    <Group position="apart">
                      <Text component="h2" size="xl" align="left" my="lg">
                        {activeTab}
                      </Text>
                      <Select
                        className={classes.student_number_input}
                        size="xs"
                        label="학번"
                        withAsterisk
                        placeholder="학번을 선택해주세요"
                        data={[
                          { value: '2021~', label: '2021년도 이후 (2021 ~ )' },
                          { value: '~2020', label: '2021년도 이전 ( ~ 2020)' },
                        ]}
                        onChange={setIsUpperThan2021}
                        value={isUpperThan2021}
                      />
                    </Group>
                    <Divider />
                    {generateInputSections(methods).map((section) => (
                      <SectionPanelWithInputs
                        key={section.title}
                        inputs={section.inputs}
                        title={section.title}
                        label={section.section_label}
                        laterThan2021={isLaterThan2021(isUpperThan2021 ?? '2021')}
                      />
                    ))}
                  </Stack>
                </Paper>
                <MediaQuery styles={{ display: 'none' }} largerThan="xl">
                  <Paper
                    pos="sticky"
                    bottom={40}
                    w="fit-content"
                    mx="auto"
                    mt={40}
                    withBorder
                    radius="xl"
                    p="xs"
                    shadow="xs"
                  >
                    <Group position="center" spacing="xs">
                      <Tooltip label="변경사항 저장">
                        <ActionIcon
                          component="button"
                          onClick={open}
                          size="2rem"
                          color="dark"
                          variant="subtle"
                          className={classes.section_panel_button}
                        >
                          <IconFileCheck size="1.25rem" color={theme.colors.green[6]} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="변경사항 폐기">
                        <ActionIcon
                          component="button"
                          onClick={open}
                          size="2rem"
                          color="dark"
                          variant="subtle"
                          className={classes.section_panel_button}
                        >
                          <IconFileShredder size="1.25rem" color={theme.colors.red[6]} />
                        </ActionIcon>
                      </Tooltip>
                      <Divider orientation="vertical" />
                      <Button
                        color="dark"
                        radius="lg"
                        onClick={() => console.log(methods.getValues())}
                      >
                        PDF 생성하기
                      </Button>
                      <Divider orientation="vertical" />
                      <Tooltip label="섹션 메뉴">
                        <ActionIcon
                          component="button"
                          onClick={open}
                          size="2rem"
                          color="dark"
                          variant="subtle"
                          className={classes.section_panel_button}
                        >
                          <IconMenu2 size="1.25rem" />
                        </ActionIcon>
                      </Tooltip>

                      <Drawer
                        opened={opened}
                        onClose={close}
                        overlayProps={{ opacity: 0.5, blur: 0.5 }}
                        position="bottom"
                      >
                        <CertificateSectionPanel
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                        />
                      </Drawer>
                    </Group>
                  </Paper>
                </MediaQuery>
              </Col>
              <MediaQuery styles={{ display: 'none' }} smallerThan="xl">
                <Col span="content">
                  <Paper withBorder className={classes.section_panel}>
                    <CertificateSectionPanel activeTab={activeTab} setActiveTab={setActiveTab} />
                  </Paper>
                </Col>
              </MediaQuery>
            </Grid>
          </Tabs>
        </Container>
      </form>
    </FormProvider>
  );
}

function SectionPanelWithInputs({
  inputs,
  title,
  label,
  laterThan2021,
}: {
  inputs: Array<InputOrUncontrolledComponentProps<any>>;
  label: SectionTitleType;
  title: string;
  laterThan2021: boolean;
}) {
  const { control } = useFormContext();
  const content = inputs
    .filter((item) => item.laterThan2021 === undefined || item.laterThan2021 === laterThan2021)
    .map((item) => {
      const Component = item.component ?? TextInput;
      const isControlled = item.controlled ?? true;
      const key = item.rhf_name ?? (item.props as any).label ?? (item.props as any).children;
      if (!isControlled) {
        return <Box key={key} component={Component} {...(item.props as any)} w="100%" />;
      }
      return (
        <Col span={4} key={key}>
          <Controller
            key={item.rhf_name}
            name={`${item.rhf_name}`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Box
                component={Component}
                type={item.type ?? 'string'}
                label={item.label}
                placeholder={item.placeholder}
                mt="sm"
                styles={{
                  label: {
                    marginBottom: '8px',
                  },
                }}
                {...(item.props as any)}
                {...field}
                onChange={(e: unknown) => {
                  field.onChange(e);
                  if ((item.props as any)?.onChange) {
                    (item.props as any)?.onChange(e);
                  }
                }}
              />
            )}
          />
        </Col>
      );
    });
  return (
    <Tabs.Panel value={label} key={title}>
      <Grid columns={isBulkCreditSection(label) ? 12 : 4}>{content}</Grid>
    </Tabs.Panel>
  );
}

const isBulkCreditSection = (section: SectionTitleType) => {
  return section !== '신청자 정보' && section !== '기타 학점';
};

const isLaterThan2021 = (year: string) => {
  return year === '2021~';
};

const useStyles = createStyles((theme) => ({
  form_stack: {
    '& .mantine-Input-input': {
      backgroundColor: theme.colors.gray[0],
      borderRadius: theme.radius.md,
      padding: '2px 16px',
      fontSize: theme.fontSizes.md,
      fontWeight: 400,
      lineHeight: 'normal',
      height: '48px',
      border: `1px solid ${theme.colors.gray[4]}`,
      ':hover': {
        border: '1px solid',
        borderColor: theme.colors.blue[5],
      },
      '::placeholder': {
        color: theme.colors.gray[6],
      },
      ':focus::placeholder': {
        color: theme.colors.gray[6],
      },
      ':focus-within': {
        border: '1px solid',
        backgroundColor: 'transparent',
        borderColor: theme.colors.blue[5],
      },
    },
    '& .mantine-NumberInput-controlUp': {
      borderTopRightRadius: theme.radius.lg,
    },
    '& .mantine-NumberInput-controlDown': {
      borderBottomRightRadius: theme.radius.lg,
    },
    'input:-internal-autofill-selected': {
      backgroundColor: 'transparent !important',
      color: 'inherit !important',
    },
  },
  container: {
    '@media (max-width: 48em)': { padding: 0 },
  },
  form_container: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    '@media (max-width: 48em)': { padding: theme.spacing.md },
  },
  student_number_input: {
    '& .mantine-Input-input': {
      padding: '1px 20px 1px 12px',
      height: rem(32),
      lineHeight: rem(2.125),
      fontSize: rem(14),
      width: 'fit-content',
    },
  },
  section_panel: {
    width: 280,
    height: 'fit-content',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  section_panel_button: {
    borderRadius: theme.radius.xl,
    '&:hover': {
      backgroundColor: theme.colors.gray[2],
    },
  },
}));
