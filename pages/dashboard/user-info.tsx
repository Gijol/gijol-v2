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
  Stack,
  TextInput,
} from '@mantine/core';
import React, { useRef, useState } from 'react';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { convertMajorTypeToText, updateUserInfo } from '../../lib/utils/user';
import { useUserInfo } from '../../lib/hooks/user';
import Loading from '../../components/loading';
import { BASE_DEV_SERVER_URL } from '../../lib/const';
import { notifications } from '@mantine/notifications';
import { useAuth, useUser } from '@clerk/nextjs';
import UserInfoLoadingSkeleton from '../../components/user-info-loading-skeleton';
import { instance } from '../../lib/utils/instance';
import { useRouter } from 'next/router';

const major_select_data = [
  { value: 'EC', label: '전기전자컴퓨터공학전공' },
  { value: 'MA', label: '신소재공학전공' },
  { value: 'EV', label: '지구환경공학전공' },
  { value: 'BS', label: '생명과학전공' },
  { value: 'CH', label: '화학전공' },
  { value: 'MC', label: '기계공학전공' },
  { value: 'PS', label: '물리광과학전공' },
];

export default function UserInfo() {
  const router = useRouter();
  // Clerk을 통해 유저 정보 받아오기
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { data: userInfoData, isLoading, isFetching, isInitialLoading } = useUserInfo();

  // POST - 전공 상태관리
  const [major, setMajor] = useState<string | null>(null);

  // POST - 개인 성적 확인 엑셀 파일 업로드 상태관리
  const openRef = useRef<any>(null);
  const [fileInfo, setFileInfo] = useState<FileWithPath | undefined>(undefined);

  // POST - 이름 변경 상태관리
  const [nameInputOpened, setNameInputOpened] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(userInfoData?.name ?? '');

  // 이름 변경 요청
  const updateUserName = async () => {
    const token = await getToken({ template: 'gijol-token-test' });
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const res = await instance.put(
      `${BASE_DEV_SERVER_URL}/api/v1/users/me/name`,
      { name: userName },
      {
        headers,
      }
    );
    if (res.status === 204) {
      await notifications.show({
        color: 'teal',
        title: '업데이트 완료!',
        message: '변경 사항이 적용되었습니다!',
        autoClose: 2000,
      });
      await setNameInputOpened(false);
      await setUserName(user?.fullName ?? '');
      await router.reload();
    } else {
      notifications.show({
        color: 'red',
        title: '업데이트 오류!',
        message: '변경사항이 적용되지 않았습니다...',
        autoClose: 2000,
      });
    }
  };
  // 받아온 정보들
  const information_data = [
    {
      label: '학번',
      data: userInfoData?.studentId,
    },
    {
      label: '이메일',
      data: user?.primaryEmailAddress?.emailAddress,
    },
    {
      label: '전공',
      data: convertMajorTypeToText(userInfoData?.majorType as string),
    },
  ];

  // 이름, 학번, 이메일, 전공 정보 컴포넌트
  const info = information_data.map((i) => {
    return (
      <Group key={i.label} position="apart" py="xs">
        <Group mih="2.5rem">
          <Text ml={8} w={100} weight={600}>
            {i.label}
          </Text>
          <Text ml={8}>{i.data}</Text>
        </Group>
      </Group>
    );
  });

  if (!isLoaded) {
    return <Loading content="잠시만 기다려주세요..." />;
  }

  if (isLoaded && !isSignedIn) {
    return (
      <Center>
        <Text>로그인 해주세용...</Text>
      </Center>
    );
  }

  if (isLoading || isInitialLoading || isFetching) {
    return <UserInfoLoadingSkeleton />;
  }

  return (
    <Container size="md">
      <Text size={32} weight={700} my={32}>
        내 정보
      </Text>
      <Group position="left" spacing={40} align="flex-start">
        <Avatar src={user?.imageUrl} alt="user profile" size={100} mt="md" />
        <Stack w="40rem" spacing={0}>
          <Group position="apart" py={10}>
            <Group mih="2.5rem">
              <Text ml={8} w={100} weight={600}>
                이름
              </Text>
              {!nameInputOpened ? (
                <Text ml={8}>{userInfoData?.name}</Text>
              ) : (
                <TextInput
                  placeholder="바꿀 닉네임을 입력해주세요"
                  value={userName}
                  onChange={(e) => setUserName(e.currentTarget.value)}
                />
              )}
            </Group>
            {!nameInputOpened ? (
              <Button
                variant="default"
                onClick={() => {
                  setNameInputOpened(true);
                }}
              >
                수정하기
              </Button>
            ) : (
              <Group>
                <Button color="teal.7" py={8} px={12} variant="light" onClick={updateUserName}>
                  저장하기
                </Button>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => {
                    setUserName(userInfoData?.name ?? '');
                    setNameInputOpened(false);
                  }}
                >
                  취소하기
                </Button>
              </Group>
            )}
          </Group>
          <>{info}</>
          <Divider my={12} />
          <Box ml={8}>
            <Text weight={600} mb="md">
              전공 및 파일 수정
            </Text>
            <Text size="sm" fw={450} py={8}>
              수정하려는 전공을 선택해주세요
            </Text>
            <Select
              placeholder="전공을 선택하세요"
              mb={16}
              data={major_select_data}
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
                  const token = await getToken({ template: 'gijol-token-test' });
                  await updateUserInfo(major, fileInfo, token);
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
        </Stack>
      </Group>
    </Container>
  );
}
