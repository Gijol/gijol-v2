import { useSession } from 'next-auth/react';

export default function useAuthState() {
  const { data: session, status, update } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isUnAuthenticated = status === 'unauthenticated';
  const isLoading = status === 'loading';
  const userData = session?.user;
  const expires = session?.expires;
  return { userData, expires, isAuthenticated, isUnAuthenticated, isLoading, update };
}
