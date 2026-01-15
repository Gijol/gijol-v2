import { useRouter } from 'next/router';
import { IconUpload } from '@tabler/icons-react';
import { Button } from '@components/ui/button';

interface WelcomeHeaderProps {
  entryYear?: number | null;
  remainingCredits?: number;
  hasData: boolean;
}

export function WelcomeHeader({ entryYear, remainingCredits, hasData }: WelcomeHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 md:text-3xl">
            {entryYear ? `안녕하세요, ${entryYear}학번님!` : '안녕하세요!'} 👋
          </h1>
          <p className="mt-1 text-gray-500">
            {hasData ? `졸업까지 ${remainingCredits}학점 남았습니다. 화이팅!` : '먼저 성적표를 업로드해주세요.'}
          </p>
        </div>
        <Button
          size="lg"
          className="bg-[#0B62DA] text-white shadow-lg shadow-blue-500/25 hover:bg-[#0952B8]"
          onClick={() => router.push('/dashboard/graduation/upload')}
        >
          <IconUpload className="mr-2 h-5 w-5" />
          {hasData ? '성적표 업데이트' : '성적표 업로드하기'}
        </Button>
      </div>
    </div>
  );
}
