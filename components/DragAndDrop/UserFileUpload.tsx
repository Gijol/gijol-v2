import { Dispatch, SetStateAction, useRef } from 'react';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { Group, Button, Container, Text, Select, Space } from '@mantine/core';

export default function UserFileUpload({
  fileInfo,
  setFileInfo,
  setMajor,
}: {
  fileInfo: FileWithPath | undefined;
  setFileInfo: Dispatch<SetStateAction<FileWithPath | undefined>>;
  setMajor: Dispatch<SetStateAction<string | null>>;
}) {
  const openRef = useRef<any>(null);

  return (
    <Container>
      <Group position="center">
        <Select
          allowDeselect={false}
          label="전공을 선택해주세요"
          placeholder="여기를 누르세요"
          onChange={setMajor}
          data={[
            { value: 'EC', label: '전기전자컴퓨터공학전공' },
            { value: 'MA', label: '신소재공학전공' },
            { value: 'EV', label: '지구환경공학전공' },
            { value: 'BS', label: '생명과학전공' },
            { value: 'CH', label: '화학전공' },
            { value: 'MC', label: '기계공학전공' },
            { value: 'PS', label: '물리광과학전공' },
          ]}
        />
      </Group>
      <Space h={32} />
      <Dropzone
        h={400}
        openRef={openRef}
        onDrop={(files) => {
          setFileInfo(files.at(0));
        }}
        activateOnClick={false}
        accept={[MIME_TYPES.xls, MIME_TYPES.xlsx]}
        styles={{ inner: { pointerEvents: 'all' } }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Group
          position="center"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!fileInfo ? (
            <>
              <Text>여기에 다운로드 받은 파일을 업로드 해주세요!</Text>
              <Button onClick={() => openRef.current()}>파일 선택하기</Button>
            </>
          ) : (
            <>
              <Text>{fileInfo?.path}</Text>
              <Button onClick={() => openRef.current()}>파일 바꾸기</Button>
            </>
          )}
        </Group>
      </Dropzone>
    </Container>
  );
}
