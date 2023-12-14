import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Col,
  Container,
  createStyles,
  Divider,
  Drawer,
  Grid,
  Group,
  MediaQuery,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { IconFileDownload, IconLayoutNavbarCollapse } from '@tabler/icons-react';
import { useState } from 'react';
import {
  section_titles,
  sections,
  SectionTitleType,
  InputOrUncontrolledComponentProps,
} from '../../../lib/const/grad-certificate-inputs';
import { useDisclosure } from '@mantine/hooks';
import CertificateSectionPanel from '../../../components/certificate-section-panel';

export default function CertificateBuilder() {
  const { classes } = useStyles();
  const methods = useForm();
  const [activeTab, setActiveTab] = useState<SectionTitleType>(section_titles[0]);
  const [opened, { open, close }] = useDisclosure(false);

  const onSubmit = (data: any) => console.log(data);
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Tabs unstyled defaultValue="신청자 정보">
          <Container size="lg" mb="xl" fluid className={classes.container}>
            <Grid m={0} justify="center" maw={1050} mx="auto">
              <Col xl="auto" lg="auto" md="auto">
                <Paper withBorder className={classes.form_container}>
                  <Stack spacing="md" className={classes.form_stack}>
                    <Text component="h2" size="xl" align="left" my="lg">
                      {activeTab}
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
          </Container>
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
  inputs: Array<InputOrUncontrolledComponentProps<any>>;
  label: SectionTitleType;
  title: string;
}) {
  const { control } = useFormContext();
  const content = inputs.map((item) => {
    const Component = item.component ?? TextInput;
    const isControlled = item.controlled !== false;
    if (!isControlled) {
      return <Component key={item.rhf_name} {...(item.props as any)} />;
    }
    return (
      <Controller
        key={item.rhf_name}
        name={`${title}-${item.rhf_name}`}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Box
            component={Component}
            type={item.type ?? 'string'}
            label={item.label}
            placeholder={item.placeholder}
            mt="md"
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
    );
  });
  return (
    <Tabs.Panel value={label} key={title}>
      {isGridView(label) ? <SimpleGrid cols={3}>{content}</SimpleGrid> : content}
    </Tabs.Panel>
  );
}

const isGridView = (section: SectionTitleType) => {
  return section !== '신청자 정보' && section !== '해외대학 학점';
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
        color: 'transparent',
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
