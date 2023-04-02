import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { overallScoreStatus } from '../../lib/atoms/gradStatus';

export default function MyPage() {
  const overall = useRecoilValue(overallScoreStatus);
  useEffect(() => {
    console.log(overall);
  }, [overall]);

  return <></>;
}
