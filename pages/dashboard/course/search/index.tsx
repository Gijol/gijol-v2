import React, { Suspense, useEffect, useState } from 'react';
import {
  Container,
  Text,
  Pagination,
  Center,
  Skeleton,
  SimpleGrid,
  LoadingOverlay,
  Title,
} from '@mantine/core';
import CourseThumbnailWithDrawer from '@components/course-thumbnail-with-drawer';
import { useCourseList } from '@hooks/course';
import Loading from '@components/loading';
import { useDebouncedState } from '@mantine/hooks';
import CourseSearchInput from '@components/course-search-input';
import { FormProvider, useForm } from 'react-hook-form';
import debounce from 'debounce';

export default function Index() {
  // active page 관리
  const [activePage, setPage] = useState(1);

  // 강의 검색 단어 및 옵션 관리
  const methods = useForm({
    defaultValues: {
      courseSearchCode: 'NONE',
      courseSearchString: '',
      pageSize: 20,
    },
  });

  // 강의 리스트 관리
  const { data, isLoading, isError, refetch, isFetching } = useCourseList(
    activePage - 1,
    methods.getValues('pageSize'),
    methods.getValues('courseSearchCode'),
    methods.getValues('courseSearchString')
  );
  // UI 업데이트 상태를 관리하는 상태 변수
  const [isUpdating, setIsUpdating] = useState(false);
  const inputValue = methods.watch('courseSearchString');

  const debouncedFetch = debounce(() => {
    refetch();
    setPage(1);
  }, 500);

  // 강의 검색 단어가 변경되면 목록을 디바운스 업데이트
  useEffect(() => {
    setIsUpdating(true);
    debouncedFetch();
    return () => {
      debouncedFetch.clear();
    };
  }, [inputValue, refetch]);

  // 로딩 오버레이를 표시 관리
  useEffect(() => {
    if (!isLoading && !isFetching) {
      setIsUpdating(false);
    }
  }, [isLoading, isFetching]);

  // 컴포넌트가 언마운트되면 디바운스를 취소
  useEffect(() => {
    return () => {
      debouncedFetch.clear();
    };
  }, []);

  const onSubmit = () => {
    setIsUpdating(true);
    debouncedFetch();
  };

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
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Container size="lg">
          <Title order={3} mt={40} mb="lg">
            강의 검색하기 🔍
          </Title>
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
              {isLoading && [...Array(9)].map((_, index) => <Skeleton key={index} height={166} />)}
              {courses}
            </SimpleGrid>
          </div>

          <Center my={40}>
            <Pagination value={activePage} onChange={setPage} total={data?.totalPages ?? 10} />
          </Center>
        </Container>
      </form>
    </FormProvider>
  );
}
