import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAuthTypeResponse } from '../utils/auth';
import { useQuery } from '@tanstack/react-query';

export function useAuthState() {
  const { data: session, status, update } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isUnAuthenticated = status === 'unauthenticated';
  const isLoading = status === 'loading';
  const userData = session?.user;
  const expires = session?.expires;
  return { userData, expires, isAuthenticated, isUnAuthenticated, isLoading, update };
}

export function useUserStatus() {
  const [isMember, setIsMember] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const getMemberStatus = async () => {
      const status = await getAuthTypeResponse();
      console.log(status);
      if (status === 'SIGN_IN') {
        setIsMember(true);
      } else if (status === 'SIGN_UP') {
        setIsMember(false);
      }
    };
    getMemberStatus();
  }, []);
  return isMember;
}
