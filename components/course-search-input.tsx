import {
  Button,
  Group,
  Menu,
  NumberInput,
  Select,
  TextInput,
  Stack,
  Text,
  Divider,
} from '@mantine/core';
import { IconAdjustments, IconSearch } from '@tabler/icons-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useCourseList } from '@hooks/course';

export default function CourseSearchInput() {
  const { register, control, reset } = useFormContext();
  const { refetch } = useCourseList();
  const handleReset = () => {
    reset({
      courseSearchCode: 'NONE',
      courseSearchString: '',
      pageSize: 20,
    });
    refetch();
  };

  return (
    <Group mx="auto" mb="2rem" position="center">
      <TextInput
        id="course-search"
        placeholder="강의코드, 강의명으로 검색해주세요!"
        size="lg"
        radius="xl"
        w={540}
        icon={<IconSearch size="1rem" />}
        styles={{
          input: {
            lineHeight: '3rem',
            borderWidth: '2px',
            ':hover': {
              borderColor: '#339AF0',
              borderWidth: '2px',
            },
          },
        }}
        {...register('courseSearchString')}
      />

      <Group position="left">
        <Menu shadow="md" width={300} offset={16} radius="md">
          <Menu.Target>
            <Button variant="default" rightIcon={<IconAdjustments size="1.25rem" />} radius="xl">
              검색 옵션
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label fz="md">
              <Text pb="xs" pt={4}>
                옵션
              </Text>
              <Divider />
            </Menu.Label>
            <Stack p="sm">
              <Controller
                name="courseSearchCode"
                control={control}
                render={({ field }) => (
                  <Select
                    label="HUS, PPE, 또는 부전공"
                    size="sm"
                    placeholder="선택해주세요!"
                    data={minor_types}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="pageSize"
                control={control}
                render={({ field }) => (
                  <NumberInput defaultValue={20} label="몇 개씩 검색할까요?" {...field} />
                )}
              />
              <Group grow>
                <Button variant="light" color="red" onClick={handleReset}>
                  초기화
                </Button>
                <Button type="submit">적용하기</Button>
              </Group>
            </Stack>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}

const minor_types = [
  { value: 'NONE', label: '없음' },
  { value: 'HUS', label: 'HUS' },
  { value: 'PPE', label: 'PPE' },
  { value: 'BS', label: '생물학' },
  { value: 'CH', label: '화학' },
  { value: 'CT', label: '문화기술' },
  { value: 'EB', label: '인문사회(경제•경영)' },
  { value: 'EC', label: '전기전자' },
  { value: 'EV', label: '환경' },
  { value: 'FE', label: '에너지' },
  { value: 'IR', label: '지능로봇' },
  { value: 'LH', label: '인문사회(문학과 역사)' },
  { value: 'MA', label: '신소재' },
  { value: 'MB', label: '인문사회(마음과 행동)' },
  { value: 'MC', label: '기계공학' },
  { value: 'MD', label: '의생명공학' },
  { value: 'MM', label: '수학' },
  { value: 'PP', label: '인문사회(공공정책)' },
  { value: 'PS', label: '물리학' },
  { value: 'SS', label: '인문사회(과학기술과 사회)' },
  { value: 'AI', label: 'AI 융합' },
];
