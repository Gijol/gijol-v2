import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import {
  Anchor,
  Button,
  Center,
  Container,
  Group,
  Image,
  Modal,
  Paper,
  Select,
  Text,
  Timeline,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconZoomQuestion,
  IconNumber1,
  IconNumber2,
  IconNumber3,
  IconNumber4,
  IconAlertCircle,
} from '@tabler/icons-react';
import { readFileAndParse } from '../../lib/utils/graduation/gradFormatter';
import { signupAndGetResponse } from '../../lib/utils/auth';
import { getSession, useSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import { UserStatusType } from '../../lib/types';

export default function Signup2({
  nextStep,
  fileInfo,
  setFileInfo,
}: {
  nextStep: () => void;
  fileInfo: FileWithPath | undefined;
  setFileInfo: Dispatch<SetStateAction<FileWithPath | undefined>>;
}) {
  const openRef = useRef<any>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [major, setMajor] = useState<string | null>(null);
  const onClickHandler = async () => {
    const session = await getSession();
    const parsedUserStatus: UserStatusType | null = await readFileAndParse(fileInfo as File);
    if (!parsedUserStatus) {
      notifications.show({
        color: 'red',
        title: '파일 업로드 오류',
        message:
          '업로드 해주신 파일에 문제가 있거나 미 업로드 상태입니다. 다시 한번 파일을 확인해주시길 바랍니다.',
        withCloseButton: true,
      });
    }
    if (!major) {
      notifications.show({
        color: 'red',
        title: '전공 미선택',
        message: '전공을 선택하시지 않으셨습니다. 만약 기초교육학부라면 희망 전공을 선택해주세요! ',
        withCloseButton: true,
      });
    } else {
      const res = await signupAndGetResponse(parsedUserStatus, session?.user.id_token, major);
      if (res.status === 201) {
        nextStep();
      } else {
        notifications.show({
          title: '응답 오류',
          message:
            '업로드 해주신 파일과 전공 정보에 문제가 있거나 네트워크에 문제가 있을 수 있습니다. 다시 한번 시도해주시길 바랍니다.',
          withCloseButton: true,
        });
      }
    }
  };
  return (
    <Container miw={600}>
      <Text size="xl" weight={600} align="center" my={20}>
        2. 다운 받은 엑셀 파일을 업로드 해주세요!
      </Text>
      <Modal
        opened={opened}
        onClose={close}
        title="파일 업로드 단계"
        centered
        styles={{
          title: { fontSize: '1.25rem', fontWeight: 700 },
          header: { zIndex: 20 },
        }}
        size="55rem"
      >
        <Text align="center" size={24} weight={600} my={16}>
          아래의 과정을 따라주세요! 👇
        </Text>
        <Timeline active={-1} bulletSize={24} lineWidth={2} my={16}>
          <Timeline.Item title="제우스 접속하기" bullet={<IconNumber1 size={14} stroke={2.5} />}>
            <Text color="dimmed" size="sm">
              <Anchor href="zeus.gist.ac.kr" target="_blank" rel="noreferrer noopener">
                zeus.gist.ac.kr
              </Anchor>{' '}
              에 접속하신 뒤 로그인 해주세요
            </Text>
          </Timeline.Item>

          <Timeline.Item title="수강 목록 확인하기" bullet={<IconNumber2 size={14} stroke={2.5} />}>
            <Text color="dimmed" size="sm">
              제우스 사이트에서 성적 탭 {'>'} 개인성적조회 탭 {'>'} Report card(KOR) 버튼을 눌러
              수강 목록을 확인해주세요
            </Text>
            <Paper shadow="xs" withBorder radius="md" m={16}>
              <Image
                src="https://gijol.im/static/media/explainPic2.8089c7cbf1c0d590673c.png"
                alt="수강목록 확인 사진"
                radius="md"
                withPlaceholder
              />
            </Paper>
          </Timeline.Item>

          <Timeline.Item title="엑셀 파일 다운받기" bullet={<IconNumber3 size={14} stroke={2.5} />}>
            <Text color="dimmed" size="sm">
              초록색 버튼을 눌러 수강 목록을 엑셀파일로 저장해주세요
            </Text>
            <Paper shadow="xs" withBorder radius="md" m={16}>
              <Image
                src="https://gijol.im/static/media/explainPic3.1163a5780d114f9a374f.png"
                alt="수강목록 확인 사진"
                radius="md"
                withPlaceholder
              />
            </Paper>
          </Timeline.Item>

          <Timeline.Item
            title="다운받은 엑셀파일 업로드하기"
            bullet={<IconNumber4 size={14} stroke={2.5} />}
          >
            <Text color="dimmed" size="sm">
              엑셀 파일을 다운받아 업로드 해주세요!
            </Text>
          </Timeline.Item>
        </Timeline>
      </Modal>
      <Center w="100%" my={24}>
        <Button onClick={open} variant="subtle" leftIcon={<IconZoomQuestion />}>
          어떤 파일을 업로드 하나요?
        </Button>
      </Center>
      <Group position="center" my={32}>
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
      <Dropzone
        h={300}
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
              <Group>
                <Button variant="light" onClick={() => openRef.current()}>
                  파일 바꾸기
                </Button>
                <Button color="red.6" variant="light" onClick={() => setFileInfo(undefined)}>
                  파일 삭제하기
                </Button>
              </Group>
            </>
          )}
        </Group>
      </Dropzone>
      <Center my={20}>
        <Button disabled={!fileInfo} size="lg" onClick={onClickHandler}>
          다음 과정으로
        </Button>
      </Center>
    </Container>
  );
}
