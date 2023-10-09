import { Center, Container, Loader, Stack, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';

export default function Loading({ content }: { content: string }) {
  const { height } = useViewportSize();
  return (
    <Container size="md" h={height - 60}>
      <Center h="60%">
        <Stack align="center">
          <Loader size="md" variant="bars" />
          <Text size="lg" fw={500}>
            {content}
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
