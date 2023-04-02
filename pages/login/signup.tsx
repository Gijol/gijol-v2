import { Center, Paper, Stepper, Text } from '@mantine/core';
import React from 'react';
import { useViewportSize } from '@mantine/hooks';
import LoginStepper from '../../components/Stepper/LoginStepper';

export default function Signup() {
  const { height } = useViewportSize();
  return (
    <div>
      <Center h={height}>
        <Paper w={800} h={560} p={40} withBorder>
          <LoginStepper active={0}>
            <Stepper.Step label="Step 1" description="Create an account" />
            <Stepper.Step label="Step 2" description="Verify email" />
            <Stepper.Step label="Step 3" description="Get full access" />
          </LoginStepper>
          <Text>회원가입 페이지</Text>
        </Paper>
      </Center>
    </div>
  );
}
