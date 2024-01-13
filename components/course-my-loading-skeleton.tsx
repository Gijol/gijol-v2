import { Container, SimpleGrid, Skeleton, Stack, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function CourseMyLoadingSkeleton() {
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  return (
    <Container size="lg">
      <Title order={3} mb="lg" mt={40}>
        내 수강현황 📑
      </Title>
      <SimpleGrid cols={matches ? 3 : 1} my="xl">
        <Skeleton height={166} radius="sm" my={40} />
      </SimpleGrid>
      <Stack spacing="1rem">
        <Skeleton height="2rem" radius="sm" />
        <Skeleton height="2rem" radius="sm" />
        <Skeleton height="2rem" radius="sm" />
      </Stack>
    </Container>
  );
}
