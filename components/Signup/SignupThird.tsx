import React, { Dispatch, SetStateAction, useRef } from 'react';
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
} from '@tabler/icons-react';

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
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Container miw={600}>
      <Text size="xl" weight={600} align="center" my={20}>
        3. 다운 받은 엑셀 파일을 업로드 해주세요!
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
              다운받은 엑셀파일을 업로드 해주세요!
            </Text>
          </Timeline.Item>
        </Timeline>
      </Modal>
      <Center w="100%" my={24}>
        <Button onClick={open} variant="subtle" leftIcon={<IconZoomQuestion />}>
          어떤 파일을 업로드 하나요?
        </Button>
      </Center>
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
