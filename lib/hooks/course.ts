import { useQuery } from '@tanstack/react-query';
import { BASE_DEV_SERVER_URL } from '../const';
import { UserTakenCourseWithGradeType } from '../types/score-status';
import { CourseType, MinorType } from '../types/course';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

export function useCourseStatus() {
  const { getToken } = useAuth();
  const courseStatusFetcher = async () => {
    const token = await getToken({ template: 'gijol-token-test' });
    return await fetch(`${BASE_DEV_SERVER_URL}/api/v1/users/me/taken-courses`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    });
  };

  return useQuery<UserTakenCourseWithGradeType>(['course-status'], () => courseStatusFetcher(), {
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

export function useCourseList(page: number, size: number, minorType: MinorType) {
  const fetchCourses = async () => {
    const params = new URLSearchParams({
      minorType: minorType,
      page: page.toString(),
      size: size.toString(),
    });
    const res = await axios.get(`${BASE_DEV_SERVER_URL}/api/v1/courses`, { params });
    if (res.status !== 200) {
      throw new Error(res.status.toString());
    }
    return res.data;
  };

  return useQuery<CourseType[]>({
    queryKey: ['courses', page],
    queryFn: () => fetchCourses(),
    refetchOnWindowFocus: false,
  });
}
