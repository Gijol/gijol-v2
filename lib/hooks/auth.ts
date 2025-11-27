// Replace Clerk-dependent hook with a harmless stub that allows the app to run without authentication.
import { useQuery } from '@tanstack/react-query';

export function useMemberStatus() {
  // Always return not a new user and not loading so pages don't block on auth.
  return useQuery(['is-new-user'], async () => ({ isNewUser: false }), {
    initialData: { isNewUser: false },
    refetchOnWindowFocus: false,
    retry: false,
  });
}
