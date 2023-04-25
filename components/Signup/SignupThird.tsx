import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import UserFileUpload from '../DragAndDrop/UserFileUpload';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { Button, Center, Container, Group, Select, Space, Text } from '@mantine/core';

export default function SignupThird({
  nextStep,
  fileInfo,
  setFileInfo,
}: {
  nextStep: () => void;
  fileInfo: FileWithPath | undefined;
  setFileInfo: Dispatch<SetStateAction<FileWithPath | undefined>>;
}) {
  const openRef = useRef<any>(null);
  return (
    <Container miw={600}>
      <Text size="xl" weight={600} align="center" my={20}>
        3. 다운 받은 엑셀 파일을 업로드 해주세요!
      </Text>
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
      <Center my={20}>
        <Button disabled={!fileInfo} size="lg" onClick={nextStep}>
          회원가입 완료하기 👉
        </Button>
      </Center>
    </Container>
  );
}
