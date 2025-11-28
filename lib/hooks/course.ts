import { useMutation, useQuery } from '@tanstack/react-query';
import { instance } from '@utils/instance';
import { CourseHistory, CourseResponse, CourseSearchCodeType } from '@lib/types/course';

const fetchCourses = async (
  courseSearchCode: CourseSearchCodeType,
  page: number,
  size: number,
  searchString: string
) => {
  const params = new URLSearchParams({
    courseSearchCode: courseSearchCode,
    courseSearchString: searchString,
    page: page.toString(),
    size: size.toString(),
  });
  const res = await instance.get('/api/v1/courses', { params });
  if (res.status !== 200) {
    throw new Error(res.status.toString());
  }
  return res.data;
};
export function useCourseList(
  page: number = 0,
  size: number = 20,
  minorType: CourseSearchCodeType = 'NONE',
  searchString: string = ''
) {
  return useQuery<CourseResponse>({
    queryKey: ['courses', page],
    queryFn: () => fetchCourses(minorType, page, size, searchString),
    refetchOnWindowFocus: false,
  });
}

const fetchCourseWithId = async (
  id: number
): Promise<{ courseHistoryResponses: CourseHistory[] }> => {
  const res = await instance.get(`/api/v1/courses/${id.toString()}`);
  return res.data;
};
export function useSingleCourse() {
  return useMutation(fetchCourseWithId);
}
