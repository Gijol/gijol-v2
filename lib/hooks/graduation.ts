import { getSession } from 'next-auth/react';
import { BASE_DEV_SERVER_URL } from '../const';
import { GradStatusResponseType } from '../types/grad';
import { initialValue } from '../const/grad';
import { useQuery } from '@tanstack/react-query';
import { extractOverallStatus, getFeedbackNumbers } from '../utils/graduation/grad-formatter';
import router, { useRouter } from 'next/router';

export function useGraduation() {
  const router = useRouter();
  const getGradStatus = async () => {
    const session = await getSession();
    const id_token = session?.user.id_token;
    const gradStatus: GradStatusResponseType = await fetch(
      `${BASE_DEV_SERVER_URL}/api/v1/users/me/graduation`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      }
    ).then((res) => {
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    });

    return gradStatus;
  };
  const { data, isLoading, isError, error, isSuccess, status } = useQuery<GradStatusResponseType>(
    ['grad-status'],
    () => getGradStatus(),
    {
      refetchOnWindowFocus: false,
      retry: 0,
    }
  );
  const { categoriesArr, totalCredits, totalPercentage, minDomain, minDomainPercentage, domains } =
    extractOverallStatus(data ? data : initialValue);
  const numbers = getFeedbackNumbers(data ? data : initialValue);
  const isInitial = data === initialValue;

  return {
    status: {
      categoriesArr,
      totalCredits,
      totalPercentage,
      minDomain,
      minDomainPercentage,
      domains,
      numbers,
    },
    isInitial,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
  };
}
