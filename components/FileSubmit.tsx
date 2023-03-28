import { useState } from 'react';
import { Button, Container, Group, Space, Stepper, Text } from '@mantine/core';
import UserExcelFindHelp from './UserExcelFindHelp';
import UserFileUpload from './DragAndDrop/UserFileUpload';
import Lottie from 'react-lottie-player';
import ThumbsUp from '../public/lottie/thumbs-up.json';
import { FileWithPath } from '@mantine/dropzone';
import postGradStatusFile from '../lib/utils/grad';
import { useRouter } from 'next/router';
import { useSetRecoilState } from 'recoil';
import { gradStatus, overallScoreStatus } from '../lib/atoms/gradStatus';

function FileSubmit() {
  const router = useRouter();
  const [cntStep, setCntStep] = useState<number>(0);
  const [fileInfo, setFileInfo] = useState<FileWithPath | undefined>(undefined);
  const [major, setMajor] = useState<string | null>(null);
  const setGradStatus = useSetRecoilState(gradStatus);
  const setOverallScoreStatus = useSetRecoilState(overallScoreStatus);
  const beforeBtn = cntStep <= 0;
  const afterBtn = cntStep >= 2 ? true : cntStep === 1 ? !(major && fileInfo) : false;

  return (
    <>
      <h1>파일 업로드 순서</h1>
      <Space h={16} />
      <Stepper active={cntStep} iconSize={32}>
        <Stepper.Step label="Step 1" description="성적표 엑셀로 다운받기" />
        <Stepper.Step label="Step 2" description="여기에 파일 업로드하기" />
        <Stepper.Step label="Step 3" description="졸업요건 확인하러 가기" />
      </Stepper>
      <Space h={48} />
      {cntStep === 0 && <UserExcelFindHelp />}
      {cntStep === 1 && (
        <UserFileUpload fileInfo={fileInfo} setFileInfo={setFileInfo} setMajor={setMajor} />
      )}
      {cntStep === 2 && (
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 40,
          }}
        >
          <Lottie
            animationData={ThumbsUp}
            play
            style={{ width: '150', height: '150' }}
            loop={false}
          />
          <Space h={16} />
          <Text align="center">✨ 이제 세팅이 끝났습니다! 그럼 결과를 확인하러 갈까요? ✨</Text>
          <Space h={32} />
          <Button
            size="lg"
            radius="md"
            onClick={() => {
              postGradStatusFile(fileInfo as FileWithPath, major as string)
                .then((res) => {
                  setOverallScoreStatus(res.overallScoreStatus);
                  setGradStatus(res.gradResultResponse);
                })
                .then(() => {
                  localStorage.setItem('fileUploaded', 'true');
                  router.push('/dashboard/course/result');
                });
            }}
          >
            결과 확인하러 가기
          </Button>
        </Container>
      )}
      <Space h={48} />
      <Container>
        <Group position="center">
          <Button variant="light" disabled={beforeBtn} onClick={() => setCntStep((p) => p - 1)}>
            이전
          </Button>
          <Button variant="filled" disabled={afterBtn} onClick={() => setCntStep((p) => p + 1)}>
            다음
          </Button>
        </Group>
      </Container>
      <Space h={48} />
    </>
  );
}

export default FileSubmit;
