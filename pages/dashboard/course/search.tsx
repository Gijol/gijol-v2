import React from 'react';
import { Container, Text, Input, Select, Flex, Group, MediaQuery, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import CourseThumbnail from '../../../components/CourseThumbnail';

export default function Search() {
  return (
    <Container>
      <Text size={32} weight={700} my={32}>
        강의 검색
      </Text>
      <Group align="center" spacing={24} mb={40} position="apart">
        <Input.Wrapper id="course-search" w="35rem">
          <Input
            id="course-search"
            placeholder="강의코드, 강의명, 교수명으로 검색하세요"
            size="md"
            radius="md"
            icon={<IconSearch size="1rem" />}
          />
        </Input.Wrapper>
        <Group w="fit-content">
          <Select
            placeholder="전공 영역 선택"
            w="10rem"
            data={[
              { value: 'react', label: 'React' },
              { value: 'ng', label: 'Angular' },
              { value: 'svelte', label: 'Svelte' },
              { value: 'vue', label: 'Vue' },
            ]}
          />
          <Select
            placeholder="필수 여부 선택"
            w="10rem"
            data={[
              { value: 'react', label: 'React' },
              { value: 'ng', label: 'Angular' },
              { value: 'svelte', label: 'Svelte' },
              { value: 'vue', label: 'Vue' },
            ]}
          />
        </Group>
      </Group>
      <CourseThumbnail />
    </Container>
  );
}
