import React, { useEffect, useState } from 'react';
import {
  Container,
  Text,
  Input,
  Select,
  Group,
  Pagination,
  Center,
  Grid,
  rem,
  NumberInput,
  Skeleton,
  TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import CourseThumbnailWithDrawer from '../../../../components/CourseThumbnailWithDrawer';
import { useCourseList } from '../../../../lib/hooks/course';
import Loading from '../../../../components/Loading';
import { MinorType } from '../../../../lib/types/course';
import { useRouter } from 'next/navigation';
import { useDebouncedState, useInputState } from '@mantine/hooks';
import { filterByText } from '../../../../lib/utils/course';

export default function Index() {
  const router = useRouter();
  const [stringValue, setStringValue] = useInputState('');
  const [activePage, setPage] = useState(1);
  const [pageSize, setPageSize] = useDebouncedState<number | ''>(20, 500);
  const [minor, setMinor] = useState<MinorType>('NONE');
  const { data, isLoading, isError, error, refetch, isFetching } = useCourseList(
    activePage - 1,
    Number(pageSize),
    minor
  );
  useEffect(() => {
    refetch();
  }, [minor, pageSize, activePage]);

  const courses = filterByText(data, stringValue)?.map((item) => {
    return (
      <CourseThumbnailWithDrawer
        key={item.id}
        code={item.courseCode}
        title={item.courseName}
        credit={item.courseCredit}
        description={item.description}
        tags={item.courseTags}
        prerequisites={item.prerequisite}
      />
    );
  });

  if (isError) {
    //@ts-ignore
    router.push(`/dashboard/error?status=${error.message}`);
  }
  const minor_types = [
    { value: 'NONE', label: '없음' },
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
  ];
  return (
    <Container>
      <Text size={32} weight={700} my={32}>
        강의 검색
      </Text>
      <Grid align="center" mb={rem(40)}>
        <Grid.Col md="auto">
          <TextInput
            id="course-search"
            label="검색어를 입력해주세요!"
            placeholder="강의코드, 강의명, 태그명으로 검색하세요"
            size="sm"
            radius="sm"
            icon={<IconSearch size="1rem" />}
            value={stringValue}
            onChange={(e: any) => setStringValue(e.currentTarget.value)}
            styles={{
              input: {
                fontSize: rem(14),
              },
            }}
          />
        </Grid.Col>
        <Grid.Col md={5}>
          <Group grow>
            <Select
              label="부전공을 골라보세요!"
              size="sm"
              data={minor_types}
              value={minor}
              onChange={(type: MinorType) => {
                setMinor(type);
                setPage(1);
              }}
            />
            <NumberInput
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
              label="몇 개씩 검색할끼요?"
            />
          </Group>
        </Grid.Col>
      </Grid>
      {isLoading ? (
        <Loading content="강의 리스트 로딩중" />
      ) : isFetching ? (
        <>
          {[...Array(5)].map((_) => (
            <Skeleton height={100} mb="xl" radius="md" animate />
          ))}
        </>
      ) : (
        <>{courses}</>
      )}

      <Center py="md">
        <Pagination value={activePage} onChange={setPage} total={10} />
      </Center>
    </Container>
  );
}
