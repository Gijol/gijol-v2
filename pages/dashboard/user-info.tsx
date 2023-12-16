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
  Paper,
} from '@mantine/core';
import React, { useRef, useState } from 'react';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { convertMajorTypeToText, deleteUserInfo, updateUserInfo } from '../../lib/utils/user';
import { useUserInfo } from '../../lib/hooks/user';
import Loading from '../../components/loading';
import { BASE_SERVER_URL } from '../../lib/const';
import { notifications } from '@mantine/notifications';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import UserInfoLoadingSkeleton from '../../components/user-info-loading-skeleton';
import { instance } from '../../lib/utils/instance';
import { useRouter } from 'next/router';
import { useMemberStatus } from '../../lib/hooks/auth';
import DashboardFileUploadEncouragement from '../../components/dashboard-file-upload-encouragement';
import DashboardUnsignedPage from '../../components/dashboard-unsigned-page';
import { modals } from '@mantine/modals';

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
  const { user, isSignedIn, isLoaded: isAuthStateLoaded } = useUser();
  const { data: status, isLoading: isMemberStatusLoading } = useMemberStatus();
  const { getToken } = useAuth();
  const { data: userInfoData, isLoading, isFetching, isInitialLoading } = useUserInfo();
  const { signOut } = useClerk();

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
      `${BASE_SERVER_URL}/api/v1/users/me/name`,
      { name: userName },
      {
        headers,
      }
    );
    if (res.status === 204) {
      notifications.show({
        color: 'teal',
        title: '업데이트 완료!',
        message: '변경 사항이 적용되었습니다!',
        autoClose: 2000,
      });
      setNameInputOpened(false);
      setUserName(user?.fullName ?? '');
      router.reload();
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

  if (!isAuthStateLoaded || isMemberStatusLoading) {
    return <Loading content="잠시만 기다려주세요..." />;
  }

  if (isAuthStateLoaded && !isSignedIn) {
    return <DashboardUnsignedPage />;
  }

  if (isAuthStateLoaded && isSignedIn && status?.isNewUser) {
    return <DashboardFileUploadEncouragement />;
  }

  if (!status?.isNewUser && (isLoading || isInitialLoading || isFetching)) {
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
          <Box pb={40} mb={80}>
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
            <Paper
              radius="md"
              withBorder
              p="md"
              mt="3rem"
              color="red"
              style={{
                borderColor: 'red',
              }}
              shadow="sm"
            >
              <Text size="xl" fw={600}>
                회원 탈퇴하기
              </Text>
              <Box>
                <Text color="dimmed" size="sm" my="md">
                  Gijol에 제공해주신 모든 정보가 삭제되며 Gijol이 제공하는 서비스를 이용하지 못하게
                  됩니다. 그래도 진행하시겠습니까?
                </Text>
                <Group position="right">
                  <Button
                    variant="filled"
                    color="red"
                    onClick={async () => {
                      const token = await getToken({ template: 'gijol-token-test' });
                      await modals.openConfirmModal({
                        title: '계정을 삭제합니다 🥲',
                        centered: true,
                        children: (
                          <Text size="sm" color="dimmed">
                            정말로 계정을 삭제하시겠습니까? 계정을 삭제하면 지졸 서비스 이용에
                            문제가 생기며 이용을 위해서는 회원가입 절차를 다시 거쳐야 할 것입니다.
                            그래도 삭제하시겠습니까?
                          </Text>
                        ),
                        labels: { confirm: '회원 탈퇴', cancel: '다시 생각해볼게요...' },
                        confirmProps: { color: 'red' },
                        styles: { title: { fontWeight: 600 } },
                        onCancel: () =>
                          notifications.show({
                            title: '감사합니다...',
                            message: '다시 한번 고려해주셔서 감사합니다...!',
                            color: 'teal',
                            autoClose: 2000,
                          }),
                        onConfirm: () => deleteUserInfo(token, user?.id, signOut),
                      });
                    }}
                  >
                    탈퇴하기
                  </Button>
                </Group>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Group>
    </Container>
  );
}
