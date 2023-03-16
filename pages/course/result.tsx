import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { gradStatus } from '../../lib/atoms/gradStatus';

export default function Result() {
  const status = useRecoilValue(gradStatus);
  useEffect(() => {
    console.log(status);
  }, [status]);
  return <div>{status?.totalCredits}</div>;
}
