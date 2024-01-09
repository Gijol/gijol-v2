import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { instance } from '@utils/instance';
import { UserStatusType } from '@lib/types/user';

export function useUserInfo() {
  const { getToken } = useAuth();
  const userStatusFetcher = async () => {
    const token = await getToken({ template: 'gijol-token-test' });
    const res = await instance.get('/api/v1/users/me/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    // if (!res.ok) {
    //   throw new Error(res.status.toString());
    // }
    return res.data;
  };

  return useQuery<UserStatusType>(['user-status'], () => userStatusFetcher(), {
    retry: false,
    refetchOnWindowFocus: false,
  });
}
