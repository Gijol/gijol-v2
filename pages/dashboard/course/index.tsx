import { Container } from '@mantine/core';
import FileSubmit from '../../../components/FileSubmit';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CoursePage() {
  const router = useRouter();

  return (
    <Container>
      <FileSubmit />
    </Container>
  );
}
