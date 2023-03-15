import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { Group, Button, Container, Text } from '@mantine/core';

export default function UserFileUploadZone({
  fileInfo,
  setFileInfo,
}: {
  fileInfo: FileWithPath | undefined;
  setFileInfo: Dispatch<SetStateAction<FileWithPath | undefined>>;
}) {
  const openRef = useRef<any>(null);

  return (
    <Container>
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
