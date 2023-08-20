import React, { useEffect, useState, useTransition } from 'react';
import {
  Container,
  Text,
  Select,
  Group,
  Pagination,
  Center,
  Grid,
  rem,
  NumberInput,
  Skeleton,
  TextInput,
  Button,
  Flex,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import CourseThumbnailWithDrawer from '../../../../components/course-thumbnail-with-drawer';
import { useCourseList } from '../../../../lib/hooks/course';
import Loading from '../../../../components/loading';
import { CourseSearchCodeType } from '../../../../lib/types/course';
import { useRouter } from 'next/navigation';
import { useDebouncedState, useInputState } from '@mantine/hooks';

export default function Index() {
  const router = useRouter();

  // search string input state 관리
  const [typedString, setTypedString] = useInputState('');
  const [courseSearchString, setCourseSearchString] = useState('');
  const [isPending, startTransition] = useTransition();

  // active page 및 page size 관리
  const [activePage, setPage] = useState(1);
  const [pageSize, setPageSize] = useDebouncedState<number | ''>(20, 500);

  // search code 관리
  const [courseSearchCode, setCourseSearchCode] = useState<CourseSearchCodeType>('NONE');

  // 강의 리스트 관리
  const { data, isLoading, isError, error, refetch, isFetching } = useCourseList(
    activePage - 1,
    Number(pageSize),
    courseSearchCode,
    courseSearchString
  );
  useEffect(() => {
    refetch();
  }, [pageSize, activePage, courseSearchCode, courseSearchString]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     startTransition(() => {
  //       refetch();
  //     });
  //   }, 1500);
  // }, [courseSearchString, pageSize, activePage, courseSearchCode]);

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

  if (isError) {
    //@ts-ignore
    router.push(`/dashboard/error?status=${error.message}`);
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
  return (
    <Container>
      <Text size={32} weight={700} my={32}>
        강의 검색
      </Text>
      <Grid align="center" mb={rem(40)}>
        <Grid.Col md="auto">
          <Grid columns={2}>
            <Grid.Col md="auto">
              <TextInput
                id="course-search"
                label="검색어를 입력해주세요!"
                placeholder="강의코드, 강의명으로 검색해주세요!"
                size="sm"
                radius="sm"
                icon={<IconSearch size="1rem" />}
                value={typedString}
                onChange={(e: any) => {
                  setTypedString(e.currentTarget.value);
                }}
                styles={{
                  input: {
                    fontSize: rem(14),
                  },
                }}
              />
            </Grid.Col>
            <Grid.Col md={0.5}>
              <Button
                maw={200}
                mt="xl"
                disabled={typedString === ''}
                onClick={() => setCourseSearchString(typedString)}
              >
                검색하기
              </Button>
            </Grid.Col>
          </Grid>
        </Grid.Col>
        <Grid.Col md={5}>
          <Group grow>
            <Select
              label="HUS, PPE, 또는 부전공"
              size="sm"
              data={minor_types}
              value={courseSearchCode}
              onChange={(type: CourseSearchCodeType) => {
                setCourseSearchCode(type);
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
      ) : isFetching || isPending ? (
        <>
          {[...Array(5)].map((_) => (
            <Skeleton height={100} mb="xl" radius="md" animate />
          ))}
        </>
      ) : (
        <>{courses}</>
      )}

      <Center py="md">
        <Pagination value={activePage} onChange={setPage} total={data?.totalPages ?? 10} />
      </Center>
    </Container>
  );
}
