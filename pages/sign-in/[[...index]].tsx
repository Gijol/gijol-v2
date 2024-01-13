import { SignIn, useSignIn } from '@clerk/nextjs';
import { Center } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';

export default function Page() {
  const { height } = useViewportSize();
  const { signIn } = useSignIn();
  return (
    <Center h={height}>
      <SignIn />
    </Center>
  );
}
