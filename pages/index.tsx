import { Container, Text, Paper, RingProgress, Space } from '@mantine/core';

export default function HomePage() {
  return (
    <>
      <Container>
        <h1>요약</h1>
      </Container>
      <Container sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Paper p="md" radius="md">
          <RingProgress
            size={300}
            thickness={16}
            roundCaps
            sections={[{ value: 40, color: 'cyan' }]}
          />
        </Paper>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Paper p="md" radius="md" w="274px">
              <Text>학점</Text>
              <Space h="md" />
              <Text>총 학점 : 130</Text>
            </Paper>
            <Paper p="md" radius="md" w="274px">
              <Text>학점</Text>
              <Space h="md" />
              <Text>총 학점 : 130</Text>
            </Paper>
          </div>
          <Paper p="md" radius="md" h="100%">
            <Text>학점</Text>
            <Space h="md" />
            <Text>총 학점 : 130</Text>
          </Paper>
        </Container>
      </Container>
    </>
  );
}
