import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { initialValue } from '@const/grad';
import { BASE_SERVER_URL } from '@const/index';
import { GradStatusResponseType, GradOverallStatusType } from '@lib/types/grad';
import { extractOverallStatus, getFeedbackNumbers } from '@utils/graduation/grad-formatter';

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
  const { data, isLoading, isError, error, isSuccess, isInitialLoading, isFetching } =
    useQuery<GradStatusResponseType>(['grad-status'], () => getGradStatus(), {
      refetchOnWindowFocus: false,
      retry: 0,
    });

  // extractOverallStatus 가 undefined 나올 경우, provide a safe default
  const defaultOverall: GradOverallStatusType = {
    categoriesArr: [],
    totalCredits: 0,
    totalPercentage: 0,
    minDomain: '',
    minDomainPercentage: 0,
    domains: [],
  };

  const overall = extractOverallStatus(data ?? initialValue) ?? defaultOverall;
  const { categoriesArr, totalCredits, totalPercentage, minDomain, minDomainPercentage, domains } =
    overall;
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
