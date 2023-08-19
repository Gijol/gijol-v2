import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';

const checkUserExistence = async (token: string | null): Promise<boolean> => {
  return true;
};

export default function NewUser() {
  const { getToken } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const redirectToDashboardIfUserIsNew = async () => {
      const token = await getToken({ template: 'gijol-token-test' });
      const isNew = await checkUserExistence(token);
      if (!isNew) {
        router.push('/dashboard');
      } else {
        router.push('/login/sign-up');
      }
    };
    redirectToDashboardIfUserIsNew();
  }, []);
  return <></>;
}
