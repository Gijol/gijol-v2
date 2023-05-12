import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { BASE_DEV_SERVER_URL } from '../const';
import { GradStatusType } from '../types/grad';
import { initialValue } from '../const/grad';
import { getFeedbackNumbers, getOverallStatus } from '../utils/grad';

export default function useGraduation() {
  const [status, setStatus] = useState<GradStatusType>(initialValue);
  useEffect(() => {
    const getGradStatus = async () => {
      const session = await getSession();
      const id_token = session?.user.id_token;
      const gradStatus: GradStatusType = await fetch(`${BASE_DEV_SERVER_URL}/graduation`, {
        headers: {
          Authorization: `Bearer ${id_token}`,
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
      setStatus(gradStatus);
    };
    getGradStatus();
  }, []);
  const {
    categoriesArr,
    totalCredits,
    totalPercentage,
    minDomain,
    minDomainPercentage,
    overall: domains,
  } = getOverallStatus(status);
  const numbers = getFeedbackNumbers(status);
  return {
    status,
    categoriesArr,
    totalCredits,
    totalPercentage,
    minDomain,
    minDomainPercentage,
    domains,
    numbers,
  };
}
