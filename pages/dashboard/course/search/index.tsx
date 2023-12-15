import React, { useEffect, useState, useTransition } from 'react';
import { Container, Text, Pagination, Center, Skeleton } from '@mantine/core';
import CourseThumbnailWithDrawer from '../../../../components/course-thumbnail-with-drawer';
import { useCourseList } from '../../../../lib/hooks/course';
import Loading from '../../../../components/loading';
import { useDebouncedState } from '@mantine/hooks';
import CourseSearchInput from '../../../../course-search-input';
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
  const onSubmit = (data: any) => console.log(data);

  // 강의 리스트 관리
  const { data, isLoading, isError, refetch, isFetching } = useCourseList(
    activePage - 1,
    Number(pageSize),
    methods.getValues('courseSearchCode'),
    methods.getValues('courseSearchString')
  );

  const inputValue = methods.watch('courseSearchString');

  useEffect(() => {
    // debounce를 사용하여 입력 변경 후 0.5초가 지나면 fetchData 호출
    const debouncedFetch = debounce(() => {
      refetch();
    }, 500);

    if (inputValue) {
      debouncedFetch();
    }

    // 컴포넌트가 언마운트될 때 debounce를 취소
    return () => {
      debouncedFetch.clear();
    };
  }, [inputValue, refetch]);

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
      <Container>
        <Text size={32} weight={700} my={32}>
          강의 검색
        </Text>
        <CourseSearchInput />
        {isLoading ? (
          <Loading content="강의 리스트 로딩중" />
        ) : isFetching ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={100} mb="xl" radius="md" animate />
            ))}
          </>
        ) : isError ? (
          <Text color="dimmed" size="lg" align="center">
            강의 정보를 불러오는데 실패했습니다...!
          </Text>
        ) : (
          <>{courses}</>
        )}

        <Center py="md">
          <Pagination value={activePage} onChange={setPage} total={data?.totalPages ?? 10} />
        </Center>
      </Container>
    </FormProvider>
  );
}
