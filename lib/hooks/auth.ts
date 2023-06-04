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

  // 30분마다 next-auth의 세션 업데이트 -> 해당 과정에서 구글에서 토큰 재발급 받는 과정이 진행된다.
  useEffect(() => {
    const interval = setInterval(() => update(), 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, [update]);

  return { userData, expires, isAuthenticated, isUnAuthenticated, isLoading, update };
}

export function useMemberStatus() {
  const [isMember, setIsMember] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<any | null>(null);
  const { isAuthenticated } = useAuthState(); // 로그인 상태 확인

  useEffect(() => {
    const getMemberStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await getAuthTypeResponse();
          if (status === 'SIGN_IN') {
            setIsMember(true);
          } else if (status === 'SIGN_UP') {
            setIsMember(false);
          }
        } catch (e) {
          setError(e);
        }
      }
    };
    getMemberStatus();
  }, [isAuthenticated]);
  return { isMember, error };
}
