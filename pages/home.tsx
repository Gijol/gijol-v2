import { useRecoilState } from 'recoil';
import { overallScoreStatus } from '../lib/atoms/gradStatus';

export default function Home() {
  const overallStatus = useRecoilState(overallScoreStatus);
  return <div></div>;
}
