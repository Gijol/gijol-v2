import React from 'react';
import { Button, Box, Text, Stack, Container } from '@mantine/core';

export default function SignupSecond({ nextStep }: { nextStep: () => void }) {
  return (
    <Container>
      <Stack align="center">
        <Text size="xl" weight={600} align="center">
          2. 다음 약관들에 동의해주세요!
        </Text>
        <Box>약관 동의 체크박스</Box>
        <Button fullWidth size="lg" onClick={nextStep}>
          다음 과정으로
        </Button>
      </Stack>
    </Container>
  );
}
