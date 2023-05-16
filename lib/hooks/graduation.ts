import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { BASE_DEV_SERVER_URL } from '../const';
import { GradStatusResponseType } from '../types/grad';
import { initialValue } from '../const/grad';

export default function useGraduation() {
  const [status, setStatus] = useState<GradStatusResponseType>(initialValue);
  const getGradStatus = async () => {
    const session = await getSession();
    console.log(session?.user.id_token);
    const id_token = session?.user.id_token;
    try {
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
      setStatus(gradStatus);
    } catch (err) {
      setStatus((prevState) => prevState);
    }
  };
  useEffect(() => {
    getGradStatus();
  }, []);
  return { status };
}
