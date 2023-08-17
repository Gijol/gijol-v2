import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAuthTypeResponse } from '../utils/auth';

export function useAuthState() {
  const { data: session, status, update } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isUnAuthenticated = status === 'unauthenticated';
  const isLoading = status === 'loading';
  const userData = session?.user;

  // Force sign in to resolve error at client side
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signIn();
    }
  }, [session]);

  return { userData, isAuthenticated, isUnAuthenticated, isLoading, update };
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
          console.log('Auth type response error', e);
        }
      }
    };
    getMemberStatus();
  }, [isAuthenticated]);

  return { isMember, error };
}
