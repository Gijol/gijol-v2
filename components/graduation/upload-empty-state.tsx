import React from 'react';
import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useRouter } from 'next/router';

export default function UploadEmptyState() {
  const router = useRouter();
  return (
    <Paper p="xl" radius="md" withBorder>
      <Stack spacing="md">
        <Text>
          아직 수강 내역이 로드되지 않았어요.
          <br />
          먼저 <b>졸업요건 파서</b>에서 엑셀 파일을 업로드하면, 이 페이지에서 내 수강현황과 학기별
          통계를 확인할 수 있습니다.
        </Text>
        <Group>
          <Button onClick={() => router.push('/dashboard/graduation/upload')} color="blue">
            엑셀 업로드하러 가기
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
