import { Button } from '@components/ui/button';
import Image from 'next/image';
import PleadingFace from '../public/images/pleading-face.svg';
import router from 'next/router';

export default function DashboardFileUploadEncouragement() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center p-6 text-center">
        <Image src={PleadingFace} alt="파일 업로드 부탁드립니다!" width={200} height={200} />
        <p className="text-3xl mt-6 font-semibold">
          아직 파일을 업로드하지 않으셨군요..!
        </p>
        <p className="text-base mt-2">원활한 서비스 이용을 위해 파일 업로드를 부탁드립니다! 🙏</p>
        <div className="flex justify-center mt-6">
          <Button variant="outline" size="lg" className="text-lg h-14 px-8" onClick={() => router.push('/login/sign-up')}>
            업로드 하러 가기 👉
          </Button>
        </div>
      </div>
    </div>
  );
}
