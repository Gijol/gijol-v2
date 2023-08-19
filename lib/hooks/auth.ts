import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAuthTypeResponse } from '../utils/auth';
import { useAuth } from '@clerk/nextjs';

export function useAuthState() {
  const { data: session, status, update } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isUnAuthenticated = status === 'unauthenticated';
  const isLoading = status === 'loading';
  const userData = session?.user;

  // Force sign in to resolve error at client side
  // useEffect(() => {
  //   if (session?.error === 'RefreshAccessTokenError') {
  //     signIn();
  //   }
  // }, [session]);

  return { userData, isAuthenticated, isUnAuthenticated, isLoading, update };
}

export function useMemberStatus() {
  const [isMember, setIsMember] = useState<boolean | undefined>(undefined);

  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    const getMemberStatus = async () => {
      const token = await getToken({ template: 'gijol-token-test' });
      try {
        const { isNewUser } = await getAuthTypeResponse(token);
        if (isNewUser) {
          setIsMember(true);
        } else {
          setIsMember(false);
        }
      } catch (e) {
        console.log('Auth type response error', e);
      }
    };
    getMemberStatus();
  }, []);

  return { isMember };
}
