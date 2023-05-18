import { useQuery } from '@tanstack/react-query';
import { BASE_DEV_SERVER_URL } from '../const';
import { getSession } from 'next-auth/react';

export function useCourseStatus() {
  const courseStatusFetcher = async () => {
    const session = await getSession();
    return await fetch(`${BASE_DEV_SERVER_URL}/api/v1/users/me/taken-courses`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session?.user.id_token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  };
  const { data, isLoading } = useQuery(['course-status'], () => courseStatusFetcher());
  return { data, isLoading };
}
