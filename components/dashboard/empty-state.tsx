import { Upload } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/router';

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <Upload className="h-8 w-8 text-[#0B62DA]" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">성적표 업로드가 필요합니다</h3>
      <p className="mb-6 text-sm text-gray-500">
        성적표를 업로드하시면 졸업요건 충족 현황과 수강 내역을 확인할 수 있습니다.
      </p>
      <Button
        size="lg"
        className="bg-[#0B62DA] text-white shadow-lg shadow-blue-500/25 hover:bg-[#0952B8]"
        onClick={() => router.push('/dashboard/graduation/upload')}
      >
        <Upload className="mr-2 h-5 w-5" />
        성적표 업로드하기
      </Button>
    </div>
  );
}
