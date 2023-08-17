import { Button, Center, Group, Stack, Text } from '@mantine/core';
import Image from 'next/image';
import PleadingFace from '../public/images/pleading-face.svg';
import router from 'next/router';

export default function DashboardFileUploadEncouragement() {
  return (
    <Center h="100%">
      <Stack p="xl" align="center">
        <Image src={PleadingFace} alt="파일 업로드 부탁드립니다!" width={200} height={200} />
        <Text fz="2rem" mt="xl" fw={600}>
          아직 파일을 업로드하지 않으셨군요..!
        </Text>
        <Text fz="md">원활한 서비스 이용을 위해 파일 업로드를 부탁드립니다! 🙏</Text>
        <Group position="center" mt="md">
          <Button variant="outline" size="xl" onClick={() => router.push('/login/signup')}>
            업로드 하러 가기 👉
          </Button>
        </Group>
      </Stack>
    </Center>
  );
}
