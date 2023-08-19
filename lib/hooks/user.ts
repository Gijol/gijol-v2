import { BASE_DEV_SERVER_URL } from '../const';
import { useQuery } from '@tanstack/react-query';
import { UserStatusType } from '../types/user';
import { useAuth } from '@clerk/nextjs';

export function useUserInfo() {
  const { getToken } = useAuth();
  const userStatusFetcher = async () => {
    const token = await getToken({ template: 'gijol-token-test' });
    const res = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/users/me/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
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
