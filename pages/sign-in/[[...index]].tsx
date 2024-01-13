import { Center } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  const { height } = useViewportSize();
  return (
    <Center h={height}>
      <SignIn />
    </Center>
  );
}
