import React, { useState } from 'react';
import { Button, Box, Text, Stack, Container, List, Checkbox, Paper, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

export default function Signup1({ nextStep }: { nextStep: () => void }) {
  const matches = useMediaQuery('(min-width: 56.25em)');
  const [checked, setChecked] = useState<boolean>(false);
  return (
    <Container my={!matches ? 40 : 0}>
      <Stack align="center">
        <Text size="xl" weight={600} align="center">
          1. 다음 약관에 동의해주세요!
        </Text>
        <Box>
          <Text size="sm" my="md">
            개인 성적 정보는 다음과 같은 목적으로 수집되고 이용됩니다.
          </Text>
          <Stack justify="flex-start">
            <Paper withBorder p="md" maw={500} w="fit-content">
              <Text size="md" fw={600} mb="xs">
                수집 목적
              </Text>
              <List>
                <List.Item>
                  <Text size="sm">
                    개인 수강 정보 엑셀 파일을 활용한 졸업 충족요건 데이터 생성, 저장 및 확인
                  </Text>
                </List.Item>
                <List.Item>
                  <Text size="sm">추후 성적 분포 정보를 제공하기 위해 데이터가 이용됩니다.</Text>
                </List.Item>
              </List>

              <Text size="md" fw={600} my="sm">
                수집 항목
              </Text>
              <List>
                <List.Item>
                  <Text size="sm">성명 및 학번</Text>
                </List.Item>
                <List.Item>
                  <Text size="sm">이메일</Text>
                </List.Item>
                <List.Item>
                  <Text size="sm">개인성적정보 엑셀 파일</Text>
                </List.Item>
              </List>

              <Text size="md" fw={600} my="xs">
                보유기간 및 동의하지 않을 경우
              </Text>
              <List>
                <List.Item>
                  <Text size="sm">
                    개인 정보는 위의 명시한 목적대로 일정 기간 저장된 후 파기됩니다.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text size="sm" maw={400}>
                    이용자는 개인정보 수집 및 제공 동의에 거부할 수 있으며, 이 경우 서비스 이용이
                    제한되는 불이익을 얻을 수 있습니다.
                  </Text>
                </List.Item>
              </List>

              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="꼭 읽어주세요"
                color="orange"
                mt="md"
              >
                여러분이 제공해주신 성적 데이터 및 모든 개인정보들은 암호화되어 저장됩니다.
                사용자님의 성적정보는 철저히 보호되며, 무단 사용 또는 유출될 우려가 없으므로
                안심하세요! 👊
              </Alert>
            </Paper>
            <Checkbox
              label="개인 성적 정보 제공에 동의합니다."
              onChange={(e) => setChecked(e.currentTarget.checked)}
            />
          </Stack>
        </Box>
        <Button fullWidth size="lg" onClick={nextStep} disabled={!checked}>
          다음 과정으로
        </Button>
      </Stack>
    </Container>
  );
}
