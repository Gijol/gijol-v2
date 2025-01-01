import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { getAuthTypeResponse } from '@utils/auth';

export default function NewUser() {
  const { getToken } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const redirectToDashboardIfUserIsNew = async () => {
      const token = await getToken({ template: 'gijol-token-test' });
      const { isNewUser } = await getAuthTypeResponse(token);
      if (!isNewUser) {
        router.push('/dashboard');
      } else {
        router.push('/login/sign-up');
      }
    };
    redirectToDashboardIfUserIsNew();
  }, []);
  return <></>;
}
