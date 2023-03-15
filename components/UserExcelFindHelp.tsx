import React from 'react';
import { Container, Timeline, Text, Image, Space, Paper } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { IconFileDownload, IconListDetails } from '@tabler/icons';

export default function UserExcelFindHelp() {
  return (
    <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 800 }}>
      <Timeline lineWidth={2} active={3} w="100%" radius="md">
        <Timeline.Item
          title="제우스 접속하기"
          bulletSize={32}
          bullet={<IconLogin size={16} />}
          pl={32}
        >
          <Text color="dimmed" size="sm">
            zeus.gist.ac.kr 에 접속한 뒤 로그인 하기
          </Text>
        </Timeline.Item>
        <Timeline.Item
          title="수강 목록 확인하기"
          bulletSize={32}
          bullet={<IconListDetails size={16} />}
          pl={32}
        >
          <Text color="dimmed" size="sm">
            제우스 사이트에서 성적 탭 {'>'} 개인성적조회 탭 {'>'} Report card(KOR) 버튼을 눌러 수강
            목록을 확인하기
          </Text>
          <Space h={16} />
          <Paper shadow="xs" withBorder radius="md">
            <Image
              src="https://gijol.im/static/media/explainPic2.8089c7cbf1c0d590673c.png"
              alt="수강목록 확인 사진"
              radius="md"
              withPlaceholder
            />
          </Paper>
        </Timeline.Item>
        <Timeline.Item
          title="엑셀 파일 다운받기"
          bulletSize={32}
          bullet={<IconFileDownload size={16} />}
          pl={32}
        >
          <Text color="dimmed" size="sm">
            초록색 버튼을 눌러 수강 목록을 엑셀파일로 저장하기
          </Text>
          <Space h={16} />
          <Paper shadow="xs" withBorder radius="md">
            <Image
              src="https://gijol.im/static/media/explainPic3.1163a5780d114f9a374f.png"
              alt="수강목록 확인 사진"
              radius="md"
              withPlaceholder
            />
          </Paper>
        </Timeline.Item>
      </Timeline>
    </Container>
  );
}
