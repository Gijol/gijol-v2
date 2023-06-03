import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  setSessionRefetchInterval: Dispatch<SetStateAction<number>>;
}

export default function RefreshTokenHandler({ setSessionRefetchInterval }: Props) {
  const { data: session } = useSession();
  useEffect(() => {
    if (!!session) {
      const nowTime = Math.round(Date.now() / 1000);
      const timeRemaining = (session.user.expires_at as number) - 7 * 60 - nowTime;
      setSessionRefetchInterval(timeRemaining > 0 ? timeRemaining : 0);
    }
  }, [session, setSessionRefetchInterval]);
  return <></>;
}
