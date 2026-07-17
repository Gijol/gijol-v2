import Link from 'next/link';
import type { ReactNode } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@components/ui/button';
import { PageHeader } from '@components/dashboard/page-shell';

interface WelcomeHeaderProps {
  studentId: string | undefined;
  remainingCredits?: number;
  hasData: boolean;
  actions?: ReactNode;
}

export function WelcomeHeader({ studentId, remainingCredits, hasData, actions }: WelcomeHeaderProps) {
  return (
    <PageHeader
      eyebrow="학업 대시보드"
      title={studentId ? `${studentId}님의 졸업 현황` : '졸업 현황'}
      description={
        hasData && remainingCredits !== undefined
          ? `현재 이수 기록을 기준으로 졸업까지 ${remainingCredits.toLocaleString('ko-KR')}학점 남았습니다.`
          : '성적표를 업로드하면 졸업요건과 수강 기록을 분석합니다.'
      }
      actions={
        <>
          {actions}
          {hasData && (
            <Button asChild variant="brand" className="h-10 px-4 font-semibold">
              <Link href="/dashboard/graduation/upload">
                <Upload aria-hidden="true" className="h-4 w-4" />
                성적표 업데이트
              </Link>
            </Button>
          )}
        </>
      }
    />
  );
}
