import Link from 'next/link';
import { FileUp } from 'lucide-react';
import { Button } from '@components/ui/button';

export function EmptyState() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
        <FileUp aria-hidden="true" size={19} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">분석할 성적표가 없습니다.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-pretty text-slate-500 dark:text-slate-400">
        성적표를 업로드하면 전체 진행률, 영역별 이수 현황과 앞으로 들을 과목을 확인할 수 있습니다.
      </p>
      <Button asChild variant="brand" className="mt-6 touch-manipulation shadow-none">
        <Link href="/dashboard/graduation/upload">성적표 업로드</Link>
      </Button>
    </section>
  );
}
