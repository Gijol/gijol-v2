import {
  ActionIcon,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconDots, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';

export default function Timetable() {
  return (
    <Container size="lg">
      <Title order={3} mt={40} mb="lg">
        내 시간표들 📅
      </Title>
      <Grid mt="md">
        <Grid.Col span="auto">
          <TextInput
            placeholder="Search"
            w="auto"
            icon={<IconSearch style={{ width: rem(12), height: rem(12) }} stroke={1.5} />}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Group>
            <Button w="fit-content" size="sm">
              시간표 추가하기
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
      <Stack mt="xl">
        <Title order={4}>뭔가 모를 컬렉션</Title>
        <Stack>
          <Paper withBorder p="xl" radius="lg">
            <Group position="apart">
              <Box>
                <Link href={`timetable/1`} style={{ textDecoration: 'unset', color: 'black' }}>
                  <Title order={5}>1번 시간표</Title>
                </Link>
                <Text mt="md">시간표 설명~설명~ </Text>
              </Box>
              <ActionIcon>
                <IconDots style={{ width: rem(14), height: rem(14) }} />
              </ActionIcon>
            </Group>
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
