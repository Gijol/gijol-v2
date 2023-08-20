import { useQuery } from '@tanstack/react-query';
import { BASE_SERVER_URL } from '../const';
import { UserTakenCourseWithGradeType } from '../types/score-status';
import { CourseHistory, CourseResponse, CourseType, CourseSearchCodeType } from '../types/course';
import { useAuth } from '@clerk/nextjs';
import { instance } from '../utils/instance';
import axios from 'axios';

export function useCourseStatus() {
  const { getToken } = useAuth();
  const courseStatusFetcher = async () => {
    const token = await getToken({ template: 'gijol-token-test' });
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    // return await fetch(`${BASE_DEV_SERVER_URL}/api/v1/users/me/taken-courses`, {
    //   method: 'GET',
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // }).then((res) => {
    //   if (!res.ok) {
    //     throw new Error(res.status.toString());
    //   }
    //   return res.json();
    // });
    const res = await instance.get('/api/v1/users/me/taken-courses', { headers });
    return res.data;
  };

  return useQuery<UserTakenCourseWithGradeType>(['course-status'], () => courseStatusFetcher(), {
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

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
  page: number,
  size: number,
  minorType: CourseSearchCodeType,
  searchString: string
) {
  return useQuery<CourseResponse>({
    queryKey: ['courses', page],
    queryFn: () => fetchCourses(minorType, page, size, searchString),
    refetchOnWindowFocus: false,
  });
}

const fetchCourseWithId = async (id: number) => {
  const res = await instance.get(`/api/v1/courses/${id.toString()}`);
  return res.data;
};
export function useSingleCourse(id: number) {
  return useQuery<{ courseHistoryResponses: CourseHistory[] }>(
    ['course-history'],
    () => fetchCourseWithId(id),
    {
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
}
