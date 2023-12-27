import { BASE_SERVER_URL } from '../const';
import { GradStatusResponseType } from '../types/grad';
import { initialValue } from '../const/grad';
import { useQuery } from '@tanstack/react-query';
import { extractOverallStatus, getFeedbackNumbers } from '../utils/graduation/grad-formatter';
import { useAuth } from '@clerk/nextjs';

export function useGraduation() {
  const { getToken } = useAuth();
  const getGradStatus = async () => {
    const token = await getToken({ template: 'gijol-token-test' });
    const gradStatus: GradStatusResponseType = await fetch(
      `${BASE_SERVER_URL}/api/v1/users/me/graduation`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
  const { data, isLoading, isError, error, isSuccess, isInitialLoading, isFetching, status } =
    useQuery<GradStatusResponseType>(['grad-status'], () => getGradStatus(), {
      refetchOnWindowFocus: false,
      retry: 0,
    });
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
    isInitialLoading,
    isFetching,
    isError,
    isSuccess,
    error,
    data,
  };
}
