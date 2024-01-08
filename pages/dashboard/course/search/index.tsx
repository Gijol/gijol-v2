import React, { useEffect, useState } from 'react';
import {
  Container,
  Text,
  Pagination,
  Center,
  Skeleton,
  SimpleGrid,
  LoadingOverlay,
} from '@mantine/core';
import CourseThumbnailWithDrawer from '@components/course-thumbnail-with-drawer';
import { useCourseList } from '@hooks/course';
import Loading from '@components/loading';
import { useDebouncedState } from '@mantine/hooks';
import CourseSearchInput from '@components/course-search-input';
import { FormProvider, useForm } from 'react-hook-form';
import debounce from 'debounce';

export default function Index() {
  // active page 및 page size 관리
  const [activePage, setPage] = useState(1);
  const [pageSize, setPageSize] = useDebouncedState<number | ''>(20, 500);

  // 강의 검색 단어 및 옵션 관리
  const methods = useForm({
    defaultValues: {
      courseSearchCode: 'NONE',
      courseSearchString: '',
      pageSize: 20,
    },
  });

  // 강의 리스트 관리
  const { data, isLoading, isError, refetch, isFetching, isStale } = useCourseList(
    activePage - 1,
    Number(pageSize),
    methods.getValues('courseSearchCode'),
    methods.getValues('courseSearchString')
  );
  // UI 업데이트 상태를 관리하는 상태 변수
  const [isUpdating, setIsUpdating] = useState(false);

  const inputValue = methods.watch('courseSearchString');

  useEffect(() => {
    // debounce를 사용하여 입력 변경 후 0.5초가 지나면 fetchData 호출
    setIsUpdating(true);
    const debouncedFetch = debounce(() => {
      refetch();
    }, 500);

    debouncedFetch();

    // 컴포넌트가 언마운트될 때 debounce를 취소
    return () => {
      debouncedFetch.clear();
    };
  }, [inputValue, refetch]);

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setIsUpdating(false);
    }
  }, [isLoading, isFetching]);

  const courses = data?.content.map((item) => {
    return (
      <CourseThumbnailWithDrawer
        key={item.id}
        id={item.id}
        code={item.courseCode}
        title={item.courseName}
        credit={item.courseCredit}
        description={item.description}
        tags={item.courseTags}
        prerequisites={item.prerequisite}
      />
    );
  });

  return (
    <FormProvider {...methods}>
      <Container size="lg">
        <Text size={32} weight={700} my={32}>
          강의 검색
        </Text>
        <CourseSearchInput />
        <div style={{ position: 'relative' }}>
          {isUpdating ? (
            <LoadingOverlay visible />
          ) : isError ? (
            <Text color="dimmed" size="lg" align="center">
              강의 정보를 불러오는데 실패했습니다...!
            </Text>
          ) : null}
          <SimpleGrid
            cols={3}
            spacing="md"
            breakpoints={[
              { maxWidth: 'md', cols: 3, spacing: 'md' },
              { maxWidth: 'sm', cols: 2, spacing: 'sm' },
              { maxWidth: 'xs', cols: 1, spacing: 'sm' },
            ]}
          >
            {courses}
          </SimpleGrid>
        </div>

        <Center py="md">
          <Pagination value={activePage} onChange={setPage} total={data?.totalPages ?? 10} />
        </Center>
      </Container>
    </FormProvider>
  );
}
