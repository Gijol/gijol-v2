import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { BASE_DEV_SERVER_URL } from '../const';
import { GradStatusResponseType } from '../types/grad';
import { initialValue } from '../const/grad';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { extractOverallStatus, getFeedbackNumbers } from '../utils/grad';

export default function useGraduation() {
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
    ).then((res) => res.json());

    return gradStatus;
  };
  const { data, isLoading, isError, isFetching } = useQuery<GradStatusResponseType>(
    ['grad-status'],
    () => getGradStatus(),
    {
      initialData: initialValue,
      refetchOnWindowFocus: false,
    }
  );
  const { categoriesArr, totalCredits, totalPercentage, minDomain, minDomainPercentage, domains } =
    extractOverallStatus(data);
  const numbers = getFeedbackNumbers(data);
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
    isFetching,
  };
}
