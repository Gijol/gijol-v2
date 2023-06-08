import { useQuery } from '@tanstack/react-query';
import { BASE_DEV_SERVER_URL } from '../const';
import { getSession } from 'next-auth/react';
import { UserTakenCourseWithGradeType } from '../types/score-status';
import { CourseType, MinorType } from '../types/course';
import axios from 'axios';

export function useCourseStatus() {
  const courseStatusFetcher = async () => {
    const session = await getSession();
    return await fetch(`${BASE_DEV_SERVER_URL}/api/v1/users/me/taken-courses`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session?.user.id_token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    });
  };

  const { data, isLoading, isError, status, error } = useQuery<UserTakenCourseWithGradeType>(
    ['course-status'],
    () => courseStatusFetcher(),
    { retry: 0, refetchOnWindowFocus: false }
  );
  return { data, isLoading, isError, status, error };
}

export function useCourseList(page: number, minorType: MinorType) {
  const fetchProjects = async (page: number) => {
    const params = new URLSearchParams({
      minorType: minorType,
      pageNumber: page.toString(),
      sorted: 'true',
    });
    const res = await axios.get(`${BASE_DEV_SERVER_URL}/api/v1/courses`, { params });
    if (res.status !== 200) {
      throw new Error(res.status.toString());
    }
    return res.data;
  };

  const { isLoading, isError, error, data, isPreviousData } = useQuery<CourseType[]>({
    queryKey: ['projects', page],
    queryFn: () => fetchProjects(page),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
  return { data, isLoading, isError, error };
}
