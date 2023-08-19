import { Avatar, Box, Container, Divider, Group, Skeleton, Stack, Text } from '@mantine/core';

export default function UserInfoLoadingSkeleton() {
  return (
    <Container size="md">
      <Text size={32} weight={700} my={32}>
        내 정보
      </Text>
      <Group position="left" spacing={40} align="flex-start">
        <Avatar alt="user profile" size={100} mt="md" />
        <Stack w="40rem" spacing={0}>
          <Stack py="xs">
            <Skeleton height={60} radius="sm" />
            <Skeleton height={60} radius="sm" />
            <Skeleton height={60} radius="sm" />
            <Skeleton height={60} radius="sm" />
          </Stack>
          <Divider my={12} />
          <Stack ml={8} spacing="md">
            <Text weight={600} mb="md">
              전공 및 파일 수정
            </Text>
            <Stack spacing={8}>
              <Skeleton height="2rem" w={200} radius="sm" />
              <Skeleton height="2rem" radius="sm" />
            </Stack>
            <Stack spacing={8}>
              <Skeleton height="2rem" w={200} radius="sm" />
              <Skeleton height={400} radius="sm" />
            </Stack>
          </Stack>
          <Divider my={20} />
        </Stack>
      </Group>
    </Container>
  );
}
