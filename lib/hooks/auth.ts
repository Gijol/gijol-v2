import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { getAuthTypeResponse } from '@utils/auth';

export function useMemberStatus() {
  const auth = useAuth();
  const getMemberStatus = async () => {
    const token = await auth.getToken({ template: 'gijol-token-test' });
    return await getAuthTypeResponse(token);
  };

  return useQuery<{ isNewUser: boolean }>(['is-new-user'], () => getMemberStatus(), {
    refetchOnWindowFocus: false,
    retry: false,
  });
}
