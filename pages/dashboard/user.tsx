import {
  Box,
  Container,
  Divider,
  Group,
  Text,
  Avatar,
  Button,
  Center,
  Select,
} from '@mantine/core';
import React, { useRef, useState } from 'react';
import { useAuthState, useMemberStatus } from '../../lib/hooks/auth';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { convertMajorTypeToText, updateUserInfo } from '../../lib/utils/user';
import { useUserInfo } from '../../lib/hooks/user';
import Loading from '../../components/loading';
import router from 'next/router';
import DashboardFileUploadEncouragement from '../../components/dashboard-file-upload-encouragement';

export default function User() {
  const { userData } = useAuthState();
  const { isMember, error: notAuthenticated } = useMemberStatus();

  const openRef = useRef<any>(null);
  const [fileInfo, setFileInfo] = useState<FileWithPath | undefined>(undefined);
  const [major, setMajor] = useState<string | null>(null);

  const { data: userInfoData, isLoading, isError, error } = useUserInfo();

  if (notAuthenticated) {
    // @ts-ignore
    router.push(`/dashboard/error?status=${error.message}`);
  }
  if (!isMember) {
    return <DashboardFileUploadEncouragement />;
  } else {
    if (isLoading) {
      return <Loading content="유저 정보를 불러오는 중입니다..." />;
    }
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
              <Text ml={8}>{userInfoData?.name}</Text>
            </Group>
            <Divider my={12} />
            <Group>
              <Text ml={8} w={100} weight={600}>
                학번
              </Text>
              <Text ml={8}>{userInfoData?.studentId}</Text>
            </Group>
            <Divider my={12} />
            <Group>
              <Text ml={8} w={100} weight={600}>
                이메일
              </Text>
              <Text ml={8}>{userInfoData?.email}</Text>
            </Group>
            <Divider my={12} />
            <Group>
              <Text ml={8} w={100} weight={600}>
                이메일
              </Text>
              <Text ml={8}>{convertMajorTypeToText(userInfoData?.majorType as string)}</Text>
            </Group>
            <Divider my={12} />
            <Box ml={8}>
              <Text weight={600} mb="md">
                전공 및 파일 수정
              </Text>
              <Text size="sm" fw={450} py={8}>
                수정하려는 파일을 선택해주세요
              </Text>
              <Select
                placeholder="전공을 선택하세요"
                mb={16}
                data={[
                  { value: 'EC', label: '전기전자컴퓨터공학전공' },
                  { value: 'MA', label: '신소재공학전공' },
                  { value: 'EV', label: '지구환경공학전공' },
                  { value: 'BS', label: '생명과학전공' },
                  { value: 'CH', label: '화학전공' },
                  { value: 'MC', label: '기계공학전공' },
                  { value: 'PS', label: '물리광과학전공' },
                ]}
                value={major}
                onChange={setMajor}
              />
              <Box>
                <Text size="sm" fw={450} py={8}>
                  수정하려는 파일을 선택해주세요
                </Text>
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
                <Button
                  w="fit-content"
                  disabled={!(fileInfo || major)}
                  onClick={async () => {
                    await updateUserInfo(major, fileInfo);
                    await setFileInfo(undefined);
                    await setMajor('');
                  }}
                >
                  변경사항 적용하기
                </Button>
                <Button
                  w="fit-content"
                  color="red"
                  variant="light"
                  disabled={!(fileInfo || major)}
                  onClick={() => {
                    setFileInfo(undefined);
                    setMajor('');
                  }}
                >
                  변경사항 버리기
                </Button>
              </Group>
            </Center>
          </Box>
        </Group>
      </Container>
    );
  }
}
