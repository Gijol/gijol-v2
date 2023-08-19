import { getSession } from 'next-auth/react';
import { BASE_DEV_SERVER_URL } from '../const';
import { useQuery } from '@tanstack/react-query';
import { UserStatusType } from '../types/user';

export function useUserInfo() {
  const userStatusFetcher = async () => {
    const session = await getSession();
    const res = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/users/me/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session?.user.id_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(res.status.toString());
    }
    return res.json();
  };

  return useQuery<UserStatusType>(['user-status'], () => userStatusFetcher(), {
    retry: false,
    refetchOnWindowFocus: false,
  });
}
