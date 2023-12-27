import {
  ActionIcon,
  Box,
  Button,
  Col,
  Container,
  createStyles,
  Divider,
  Drawer,
  FileInput,
  Grid,
  Group,
  MediaQuery,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { IconLayoutNavbarCollapse } from '@tabler/icons-react';
import { ForwardedRef, forwardRef, useState } from 'react';
import {
  section_titles,
  generateInputSections,
  SectionTitleType,
  InputOrUncontrolledComponentProps,
} from '../../../lib/const/grad-certificate-inputs';
import { useDisclosure } from '@mantine/hooks';
import CertificateSectionPanel from '../../../components/certificate-section-panel';
import {
  initializeCertForm,
  parseCertificate,
} from '../../../lib/utils/parser/grade/certificate-parser';
import { MonthPickerInput } from '@mantine/dates';

export default function CertificateBuilder() {
  const { classes } = useStyles();
  const methods = useForm({
    defaultValues: {
      OU: {
        summer_session: {
          subjects: [],
        },
      },
    },
  });
  const [activeTab, setActiveTab] = useState<SectionTitleType>(section_titles[0]);
  const [opened, { open, close }] = useDisclosure(false);

  // 2021학번 이후
  const [laterThan2021, setLaterThan2021] = useState(true);

  // file parsing trying
  const [file, setFile] = useState<File | null>(null); // file state
  const [fileParsed, setFileParsed] = useState<any[]>([]);

  const onSubmit = (data: any) => console.log(data);
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} autoComplete="off">
        <Container size="lg" mb="xl" fluid className={classes.container}>
          <Tabs unstyled defaultValue="신청자 정보">
            <Grid m={0} justify="center" maw={1100} mx="auto" columns={6}>
              <Col span={6}>
                <Paper p={40} radius="md" withBorder>
                  <FileInput
                    placeholder="Pick file"
                    label="Your resume"
                    withAsterisk
                    onChange={setFile}
                    value={file}
                  />
                  <Button onClick={() => parseCertificate(file as File, methods)}>
                    성적 이수표 파싱하기
                  </Button>
                  <Text>{JSON.stringify(fileParsed)}</Text>
                </Paper>
              </Col>
              <Col xl="auto" lg="auto" md="auto">
                <Paper withBorder className={classes.form_container}>
                  <Stack spacing="md" className={classes.form_stack}>
                    <Group position="apart">
                      <Text component="h2" size="xl" align="left" my="lg">
                        {activeTab}
                      </Text>
                      <Switch
                        size="xl"
                        checked={laterThan2021}
                        onChange={() => setLaterThan2021(!laterThan2021)}
                        onLabel="2021학번 이후"
                        offLabel="2021학번 이전"
                      />
                    </Group>
                    <Divider />
                    {generateInputSections(methods).map((section) => (
                      <SectionPanelWithInputs
                        key={section.title}
                        inputs={section.inputs}
                        title={section.title}
                        label={section.section_label}
                        laterThan2021={laterThan2021}
                      />
                    ))}
                  </Stack>
                </Paper>
                <MediaQuery styles={{ display: 'none' }} largerThan="xl">
                  <Group position="right" my="xl" pos="sticky" bottom={20}>
                    <ActionIcon
                      component="button"
                      onClick={open}
                      size="4rem"
                      color="dark"
                      variant="default"
                      className={classes.section_panel_button}
                    >
                      <IconLayoutNavbarCollapse size="2rem" />
                    </ActionIcon>
                    <Drawer
                      opened={opened}
                      onClose={close}
                      overlayProps={{ opacity: 0.5, blur: 0.5 }}
                      position="bottom"
                    >
                      <CertificateSectionPanel activeTab={activeTab} setActiveTab={setActiveTab} />
                    </Drawer>
                  </Group>
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
    maxWidth: 750,
    padding: 40,
    marginInline: 'auto',
    borderRadius: theme.radius.lg,
    '@media (max-width: 48em)': { padding: theme.spacing.md },
  },
  section_panel: {
    width: 280,
    height: 'fit-content',
    padding: `${theme.spacing.xl} ${theme.spacing.md}`,
    borderRadius: theme.radius.lg,
    marginLeft: 20,
  },
  section_panel_button: {
    borderRadius: theme.radius.xl,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
}));
