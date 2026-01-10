import { IconUpload } from '@tabler/icons-react';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/router';

export function EmptyState() {
  const router = useRouter();
  
  return (
    <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
        <IconUpload className="w-8 h-8 text-[#0B62DA]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">성적표 업로드가 필요합니다</h3>
      <p className="text-gray-500 text-sm mb-6">
        성적표를 업로드하시면 졸업요건 충족 현황과 수강 내역을 확인할 수 있습니다.
      </p>
      <Button
        size="lg"
        className="bg-[#0B62DA] hover:bg-[#0952B8] text-white shadow-lg shadow-blue-500/25"
        onClick={() => router.push('/dashboard/graduation/upload')}
      >
        <IconUpload className="mr-2 h-5 w-5" />
        성적표 업로드하기
      </Button>
    </div>
  );
}
