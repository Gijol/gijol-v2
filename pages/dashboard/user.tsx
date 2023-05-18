import { Box, Container, Divider, Flex, Group, Text, Avatar, Button, Center } from '@mantine/core';
import React, { useRef, useState } from 'react';
import { useAuthState } from '../../lib/hooks/auth';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';

export default function User() {
  const { userData } = useAuthState();
  console.log(userData?.id_token);
  const openRef = useRef<any>(null);
  const [fileInfo, setFileInfo] = useState<FileWithPath | undefined>(undefined);
  return (
    <Container size="md">
      <Text size={32} weight={700} my={32}>
        내 정보
      </Text>
      <Group position="left" spacing={40} align="flex-start">
        <Avatar src={userData?.image} alt="user profile" size={100} />
        <Box w="40rem">
          <Group>
            <Text ml={8} w={100} weight={600}>
              이름
            </Text>
            <Text ml={8}>{userData?.name}</Text>
          </Group>
          <Divider my={12} />
          <Group>
            <Text ml={8} w={100} weight={600}>
              이메일
            </Text>
            <Text ml={8}>{userData?.email}</Text>
          </Group>
          <Divider my={12} />
          <Box>
            <Text ml={8} w={100} weight={600} my={20}>
              파일 수정
            </Text>
            <Box>
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
                      <Text align="center">
                        기존의 파일을 수정하려면, 여기에 다시 파일을 업로드 해주세요!
                      </Text>
                      <Button onClick={() => openRef.current()}>파일 선택하기</Button>
                    </>
                  ) : (
                    <>
                      <Text>{fileInfo?.path}</Text>
                      <Group>
                        <Button variant="light" onClick={() => openRef.current()}>
                          파일 바꾸기
                        </Button>
                        <Button
                          color="red.6"
                          variant="light"
                          onClick={() => setFileInfo(undefined)}
                        >
                          파일 삭제하기
                        </Button>
                      </Group>
                    </>
                  )}
                </Group>
              </Dropzone>
            </Box>
          </Box>
          <Divider my={20} />
          <Center pb={40} mb={80}>
            <Group w="100%" grow>
              <Button w="fit-content" disabled={!fileInfo}>
                변경사항 적용하기
              </Button>
              <Button w="fit-content" variant="light">
                홈으로 돌아가기
              </Button>
            </Group>
          </Center>
        </Box>
      </Group>
    </Container>
  );
}
