import { useInfiniteQuery } from '@tanstack/react-query';
import type { SectionBrowsingPage, SectionProgramLevel } from '@/features/timetable/section-browsing';

type TimetableSectionPageResponse = SectionBrowsingPage & {
  term: string;
  label: string;
  count: number;
};

export async function fetchTimetableSectionPage(
  term: string,
  query: string,
  department: string,
  programLevel: SectionProgramLevel,
  page: number,
  signal?: AbortSignal,
  courseCodes: readonly string[] = [],
): Promise<TimetableSectionPageResponse> {
  const params = new URLSearchParams({ q: query, page: String(page) });
  if (department) params.set('department', department);
  params.set('level', programLevel);
  courseCodes.forEach((courseCode) => params.append('courseCode', courseCode));

  const response = await fetch(`/api/timetable/${encodeURIComponent(term)}?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`Failed to browse ${term}: ${response.status}`);
  return response.json();
}

export async function fetchTimetableSectionsByCourseCodes(
  term: string,
  courseCodes: readonly string[],
  signal?: AbortSignal,
) {
  const sections: TimetableSectionPageResponse['content'] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetchTimetableSectionPage(term, '', '', 'all', page, signal, courseCodes);
    sections.push(...response.content);
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages);

  return sections;
}

export function useTimetableSectionBrowser(
  term: string,
  query: string,
  department: string,
  programLevel: SectionProgramLevel,
) {
  const result = useInfiniteQuery({
    queryKey: ['timetable-section-browser', term, query, department, programLevel],
    queryFn: ({ pageParam = 1, signal }) =>
      fetchTimetableSectionPage(term, query, department, programLevel, pageParam, signal),
    enabled: Boolean(term),
    staleTime: Infinity,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
  });

  const firstPage = result.data?.pages[0];

  return {
    sections: result.data?.pages.flatMap((page) => page.content) ?? [],
    departments: firstPage?.departments ?? [],
    totalElements: firstPage?.totalElements ?? 0,
    undergraduateSectionCount: firstPage?.undergraduateSectionCount ?? 0,
    graduateSectionCount: firstPage?.graduateSectionCount ?? 0,
    isLoading: result.isLoading,
    isFetchingNextPage: result.isFetchingNextPage,
    hasNextPage: Boolean(result.hasNextPage),
    loadMore: result.fetchNextPage,
    refetch: result.refetch,
    error: result.error instanceof Error ? result.error.message : null,
  };
}
