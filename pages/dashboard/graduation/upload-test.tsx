import React, { useRef, useState } from 'react';
import { Container, Title, Text, Group, Button, Paper, Stack, Card } from '@mantine/core';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import Loading from '@components/loading';

export default function UploadTestPage() {
  const openRef = useRef<any>(null);
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log(file);
      const formData = new FormData();
      formData.append('file', file as File);

      const resp = await fetch('/api/graduation/upload', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const json = await resp.json().catch(() => null);
        setError(json?.error || `Server returned ${resp.status}`);
      } else {
        const json = await resp.json();
        console.log(resp);
        setResult(json);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="lg" my={40}>
      <Title order={3} mb="md">
        업로드 테스트 — 졸업 엑셀 파싱
      </Title>

      <Text color="dimmed" mb="md">
        이 페이지는 `/api/graduation/upload` 엔드포인트가 엑셀 파일을 잘 파싱하는지 확인하기 위한
        테스트 페이지입니다.
      </Text>

      <Dropzone
        openRef={openRef}
        onDrop={(files) => setFile(files?.[0] ?? null)}
        activateOnClick={false}
        accept={[MIME_TYPES.xls, MIME_TYPES.xlsx]}
        h={200}
      >
        <Group position="center" style={{ height: '100%' }}>
          {!file ? (
            <Text>여기에 엑셀 파일을 드롭하거나 클릭하여 업로드하세요 (xls / xlsx)</Text>
          ) : (
            <Text>{file.name || file.path}</Text>
          )}
        </Group>
      </Dropzone>

      <Group mt="md">
        <Button onClick={() => openRef.current?.()} variant="outline">
          파일 선택
        </Button>
        <Button onClick={onUpload} disabled={!file} color="blue">
          업로드 및 파싱
        </Button>
        <Button
          onClick={() => {
            setFile(null);
            setResult(null);
            setError(null);
          }}
          color="gray"
        >
          리셋
        </Button>
      </Group>

      <Paper shadow="sm" p="md" mt="lg">
        {isLoading ? (
          <Loading content="서버에서 파싱 중입니다..." />
        ) : error ? (
          <Stack>
            <Text color="red">에러 발생: {error}</Text>
          </Stack>
        ) : result ? (
          <Card shadow="xs">
            <Title order={5}>파싱 결과(JSON)</Title>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        ) : (
          <Text color="dimmed">아직 업로드 및 파싱이 실행되지 않았습니다.</Text>
        )}
      </Paper>
    </Container>
  );
}
