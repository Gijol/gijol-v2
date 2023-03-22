import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { gradStatus } from '../atoms/gradStatus';

export const useSessionStorageGradStatus = () => {
  const [status, setStatus] = useRecoilState(gradStatus);
  const [isAtomDefault, setIsAtomDefault] = useState(true);
  const getFromSession = async () => {
    const sessionGradStatus = await sessionStorage.getItem('gradStatus');
    if (sessionGradStatus) {
      setStatus(JSON.parse(sessionGradStatus).gradStatus);
      setIsAtomDefault(false);
    }
  };
  useEffect(() => {
    getFromSession();
  }, []);

  return { status, isAtomDefault };
};
