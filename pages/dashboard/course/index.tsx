import { Container } from '@mantine/core';
import FileSubmit from '../../../components/FileSubmit';
import { useSessionStorageGradStatus } from '../../../lib/hooks/grad';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CoursePage() {
  const router = useRouter();
  const { isAtomDefault } = useSessionStorageGradStatus();
  useEffect(() => {
    if (!isAtomDefault) {
      router.push('/dashboard/course/result');
    }
  }, [isAtomDefault]);

  return (
    <Container>
      <FileSubmit />
    </Container>
  );
}
