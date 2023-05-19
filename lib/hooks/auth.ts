import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAuthTypeResponse } from '../utils/auth';

export function useAuthState() {
  const { data: session, status, update } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isUnAuthenticated = status === 'unauthenticated';
  const isLoading = status === 'loading';
  const userData = session?.user;
  const expires = session?.expires;

  // 1시간마다 next-auth의 세션 업데이트 -> 해당 과정에서 구글에서 토큰 재발급 받는 과정이 진행된다.
  useEffect(() => {
    const interval = setInterval(() => update(), 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, [update]);

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
