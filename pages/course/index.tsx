import { Container } from '@mantine/core';
import { useAuth0 } from '../../lib/hooks/auth';
import FileUpload from '../../components/FileUpload';
import GradRequirementResult from '../../components/GradRequirementResult';
import { useFileUploaded } from '../../lib/hooks/user';

export default function CoursePage() {
  const { fileExists } = useFileUploaded();
  return (
    <Container>
      {!fileExists && <FileUpload />}
      {fileExists && <GradRequirementResult />}
    </Container>
  );
}
