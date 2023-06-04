import { useQuery } from '@tanstack/react-query';
import { BASE_DEV_SERVER_URL } from '../const';
import { getSession } from 'next-auth/react';
import { UserTakenCourseWithGradeType } from '../types/score-status';

interface ErrorProps {
  message: string;
}

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
