import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export function useAuth0() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const { user } = useUser();
  useEffect(() => {
    if (user) {
      setAuthenticated(true);
    }
  }, [user]);

  return { authenticated };
}
