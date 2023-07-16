import { Group, MediaQuery, Paper, rem, Stepper, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useMediaQuery, useViewportSize } from '@mantine/hooks';
import TossCap from '/public/images/tossfaceCap.png';
import Image from 'next/image';
import Signup1 from '../../components/Signup/Signup1';
import Signup2 from '../../components/Signup/Signup2';
import SignupComplete from '../../components/Signup/SignupComplete';
import { FileWithPath } from '@mantine/dropzone';
import { getAuthTypeResponse } from '../../lib/utils/auth';
import { useRouter } from 'next/router';

export default function Signup() {
  const { height } = useViewportSize();
  const matches = useMediaQuery('(min-width: 56.25em)');

  /* stepper active 상태 관리 */
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));

  /* file upload 상태 관리*/
  const [fileInfo, setFileInfo] = useState<FileWithPath | undefined>(undefined);

  const router = useRouter();
  useEffect(() => {
    const loginStateRediretHandler = async () => {
      const res = await getAuthTypeResponse();
      if (res === 'SIGN_IN') {
        await router.push('/dashboard');
        await alert(
          "이미 로그인 한 상태입니다. 새로운 파일을 업로드 하시려면, '대쉬보드 페이지 -> 프로필 -> 내 정보 수정' 에서 새로운 파일을 업로드 해주세요"
        );
      }
    };
    loginStateRediretHandler();
  }, []);

  return (
    <Group>
      <Paper
        w="30%"
        miw={matches ? 300 : '100%'}
        h={matches ? height : 'fit-content'}
        p={matches ? 40 : 'xs'}
        bg="gray.0"
      >
        <Group mb={matches ? 40 : 0}>
          <Image
            src={TossCap}
            alt="Gijol Icon"
            width={matches ? 32 : 18}
            height={matches ? 32 : 18}
          />
          <Text size={matches ? 32 : 18} weight="bolder">
            Gijol
          </Text>
        </Group>
        <MediaQuery smallerThan="56.25em" styles={{ display: 'none' }}>
          <Stepper
            active={active}
            allowNextStepsSelect={false}
            size={matches ? 'md' : 'sm'}
            onStepClick={setActive}
            orientation={matches ? 'vertical' : 'horizontal'}
            styles={{
              stepIcon: {
                borderWidth: rem(3),
              },
            }}
          >
            <Stepper.Step label="개인 정보 수집 및 이용 동의" description="약관에 동의해주세요" />
            <Stepper.Step
              label="엑셀 업로드"
              description="강의 수강현황 엑셀 파일을 업로드 해주세요"
            />
          </Stepper>
        </MediaQuery>
      </Paper>
      {active === 0 && <Signup1 nextStep={nextStep} />}
      {active === 1 && (
        <Signup2 nextStep={nextStep} fileInfo={fileInfo} setFileInfo={setFileInfo} />
      )}
      {active === 2 && <SignupComplete />}
    </Group>
  );
}
