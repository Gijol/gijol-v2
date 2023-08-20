import { useEffect, useState } from 'react';
import { getAuthTypeResponse } from '../utils/auth';
import { useAuth } from '@clerk/nextjs';

export function useMemberStatus() {
  const [isMember, setIsMember] = useState<boolean>(false);
  const auth = useAuth();

  useEffect(() => {
    const getMemberStatus = async () => {
      const token = await auth.getToken({ template: 'gijol-token-test' });
      try {
        const { isNewUser } = await getAuthTypeResponse(token);
        if (isNewUser) {
          setIsMember(false);
        } else {
          setIsMember(true);
        }
      } catch (e) {
        console.log('Auth type response error', e);
      }
    };
    getMemberStatus();
  }, []);

  return { isMember, ...auth };
}
