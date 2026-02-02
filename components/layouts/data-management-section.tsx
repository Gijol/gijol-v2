'use client';

import Link from 'next/link';
import { useGraduationStore } from '@/lib/stores/useGraduationStore';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function DataManagementSection({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { parsed, lastUploadDate } = useGraduationStore();
  const hasData = !!parsed;

  const content = (
    <Link
      href="/dashboard/graduation/upload"
      className={cn(
        'flex items-center rounded-lg py-2.5 text-sm font-medium no-underline transition-colors',
        isCollapsed ? 'justify-center px-0' : 'gap-3 px-2',
        hasData
          ? 'text-gray-300 hover:bg-white/10 hover:text-white'
          : 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300',
      )}
      title="성적표 업로드"
    >
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn('h-5 w-5', hasData ? 'text-gray-400' : 'text-amber-400')}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {/* Notification dot when no data */}
        {!hasData && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-[#0F172A]" />
        )}
      </div>
      {!isCollapsed && (
        <div className="flex flex-1 flex-col">
          <span>{hasData ? '성적표 갱신' : '성적표 업로드'}</span>
          {hasData && lastUploadDate && (
            <span className="text-xs text-gray-500">{formatRelativeDate(lastUploadDate)} 업로드됨</span>
          )}
          {!hasData && <span className="text-xs text-amber-500/80">업로드 필요</span>}
        </div>
      )}
      {/* Status indicator */}
      {!isCollapsed && (
        <div className="flex items-center">
          {hasData ? (
            <span className="flex h-2 w-2 rounded-full bg-green-500" title="데이터 연동됨" />
          ) : (
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-amber-500" title="업로드 필요" />
          )}
        </div>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <div className="border-t border-gray-800 p-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="border-0 bg-slate-900 text-white">
              <div className="flex flex-col">
                <span>{hasData ? '성적표 갱신' : '성적표 업로드'}</span>
                {hasData && lastUploadDate && (
                  <span className="text-xs text-gray-400">{formatDate(lastUploadDate)}</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-800 p-4">
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">데이터 관리</p>
      {content}
    </div>
  );
}
