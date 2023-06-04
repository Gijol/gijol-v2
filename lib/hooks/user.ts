import { getSession } from 'next-auth/react';
import { BASE_DEV_SERVER_URL } from '../const';
import { useQuery } from '@tanstack/react-query';
import { UserStatusType } from '../types/user';

export function useUserInfo() {
  const userStatusFetcher = async () => {
    const session = await getSession();
    return await fetch(`${BASE_DEV_SERVER_URL}/api/v1/users/me/`, {
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
  const { data, isLoading, isError, status, error } = useQuery<UserStatusType>(
    ['user-status'],
    () => userStatusFetcher(),
    { retry: 0, refetchOnWindowFocus: false }
  );
  return { data, isLoading, isError, status, error };
}
