import React, { Suspense, useEffect, useState } from 'react';
import CourseThumbnailWithDrawer from '@components/course-thumbnail-with-drawer';
import { useCourseList } from '@hooks/course';
import Loading from '@components/loading';

import CourseSearchInput from '@components/course-search-input';
import { FormProvider, useForm } from 'react-hook-form';
import debounce from 'debounce';
import { Loader2 } from 'lucide-react';

import { Skeleton } from '@components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';

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

  const totalPages = data?.totalPages ?? 10;

  // Simple pagination logic for demonstration. 
  // For production with many pages, you'd want a more robust range generator.
  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, activePage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)} isActive={activePage === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (start > 2) {
        items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
      }
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setPage(i)} isActive={activePage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setPage(totalPages)} isActive={activePage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="container mx-auto max-w-5xl px-4 pb-12">
          <div className="mt-10 mb-6">
            <h3 className="text-2xl font-bold">
              강의 검색하기 🔍
            </h3>
          </div>

          <div className="mb-6">
            <CourseSearchInput />
          </div>

          <div className="relative min-h-[300px]">
            {isUpdating && (
              <div className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm rounded-lg">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}

            {isError ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p className="text-lg">강의 정보를 불러오는데 실패했습니다...!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {isLoading
                  ? [...Array(9)].map((_, index) => <Skeleton key={index} className="h-[166px] w-full rounded-xl" />)
                  : courses
                }
              </div>
            )}
          </div>

          <div className="my-10 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, activePage - 1))}
                    className={activePage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages, activePage + 1))}
                    className={activePage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
