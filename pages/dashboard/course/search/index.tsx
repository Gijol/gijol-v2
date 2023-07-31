import React, { useState } from 'react';
import { Container, Text, Input, Select, Group, Pagination, Center } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import CourseThumbnailWithDrawer from '../../../../components/CourseThumbnailWithDrawer';
import { useCourseList } from '../../../../lib/hooks/course';
import Loading from '../../../../components/Loading';
import { MinorType } from '../../../../lib/types/course';
import { useRouter } from 'next/navigation';

export default function Index() {
  const [activePage, setPage] = useState(1);
  const [minor, setMinor] = useState<MinorType>('NONE');
  const { data, isLoading, isError, error } = useCourseList(activePage, minor);
  const router = useRouter();
  const courses = data?.map((item) => {
    return (
      <CourseThumbnailWithDrawer
        key={item.courseCode}
        code={item.courseCode}
        title={item.courseName}
        credit={item.courseCredit}
        description={item.description}
        tags={item.courseTags}
      />
    );
  });
  if (isError) {
    //@ts-ignore
    router.push(`/dashboard/error?status=${error.message}`);
  }
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
            placeholder="부전공 선택"
            w="10rem"
            data={[
              { value: 'NONE', label: 'NONE' },
              { value: 'BS', label: 'BS' },
              { value: 'CH', label: 'CH' },
              { value: 'CT', label: 'CT' },
              { value: 'EB', label: 'EB' },
              { value: 'EC', label: 'EC' },
              { value: 'EV', label: 'EV' },
              { value: 'FE', label: 'FE' },
              { value: 'IR', label: 'IR' },
              { value: 'LH', label: 'LH' },
              { value: 'MA', label: 'MA' },
              { value: 'MB', label: 'MB' },
              { value: 'MC', label: 'MC' },
              { value: 'MD', label: 'MD' },
              { value: 'MM', label: 'MM' },
              { value: 'PP', label: 'PP' },
              { value: 'PS', label: 'PS' },
              { value: 'SS', label: 'SS' },
            ]}
            value={minor}
            onChange={(type: MinorType) => setMinor(type)}
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
      {isLoading ? <Loading content="강의 리스트 로딩중" /> : <></>}
      <>{courses}</>
      <Center py="md">
        <Pagination value={activePage} onChange={setPage} total={10} />
      </Center>
    </Container>
  );
}
