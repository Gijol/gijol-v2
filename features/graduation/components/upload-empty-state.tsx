import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@components/ui/button';

export default function UploadEmptyState() {
  const router = useRouter();
  return (
    <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4">
        <p className="text-gray-900 dark:text-gray-100">
          아직 수강 내역이 로드되지 않았어요.
          <br />
          먼저 <b>졸업요건 파서</b>에서 엑셀 파일을 업로드하면, 이 페이지에서 내 수강현황과 학기별
          통계를 확인할 수 있습니다.
        </p>
        <div className="flex">
          <Button
            onClick={() => router.push('/dashboard/graduation/upload')}
            className="bg-blue-600 hover:bg-blue-700 font-medium"
          >
            엑셀 업로드하러 가기
          </Button>
        </div>
      </div>
    </div>
  );
}


