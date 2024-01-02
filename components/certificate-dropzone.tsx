import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { createStyles, Group, rem, useMantineTheme, Text, Button, Stack } from '@mantine/core';
import { IconCloudUpload, IconDownload, IconFileUpload, IconX } from '@tabler/icons-react';
import { useRef } from 'react';

export default function CertificateDropzone({
  onDrop,
}: {
  onDrop: (files: FileWithPath[]) => void;
}) {
  const openRef = useRef<() => void>(null);
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const icon_style = { width: rem(32), height: rem(32) };
  return (
    <div className={classes.wrapper}>
      <Dropzone
        openRef={openRef}
        onDrop={onDrop}
        className={classes.dropzone}
        radius="md"
        accept={[MIME_TYPES.xls, MIME_TYPES.xlsx]}
        maxSize={30 * 1024 ** 2}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Group position="center">
            <Dropzone.Accept>
              <Group w="100%" position="center">
                <IconDownload style={icon_style} color={theme.colors.blue[6]} stroke={1.5} />
              </Group>
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX style={icon_style} color={theme.colors.red[6]} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFileUpload style={icon_style} stroke={1.5} />
            </Dropzone.Idle>
          </Group>

          <Stack spacing={0}>
            <Text ta="center" fw={700} mt="sm">
              <Dropzone.Accept>여기에 파일을 업로드하세요</Dropzone.Accept>
              <Dropzone.Reject>정확한 성적 이수표 엑셀을 업로드 해주세요</Dropzone.Reject>
              <Dropzone.Idle>성적 이수표 가져오기</Dropzone.Idle>
            </Text>
            <Text ta="center" fz="sm" c="dimmed" mt="xs">
              제우스에서 졸업요건 성적 이수표 엑셀 파일을 다운받아 업로드 해주세요
            </Text>
          </Stack>
        </div>
      </Dropzone>
    </div>
  );
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
  },

  dropzone: {
    borderWidth: rem(2),
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,

    '&[data-accept]': {
      borderColor: theme.colors.blue[4],
      backgroundColor: theme.colors.blue[0],
    },
  },

  control: {
    position: 'relative',
  },
}));
