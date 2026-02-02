import { Button } from '@components/ui/button';
import { useRouter } from 'next/router';

export default function DashboardUnsignedPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto py-20">
      <h1 className="text-center font-black text-[32px] sm:text-[38px]">
        비로그인 상태입니다..!
      </h1>
      <p className="text-lg text-center text-muted-foreground max-w-[500px] mx-auto mt-6 mb-9">
        로그인 이후 이용 부탁드립니다!
      </p>
      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
          대쉬보드로 돌아가기
        </Button>
      </div>
    </div>
  );
}
