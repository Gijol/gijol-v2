'use client';

import Link from 'next/link';
import { useGraduationMetadataStore } from '@/lib/stores/useGraduationMetadataStore';
import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DISMISSED_STORAGE_KEY = 'gijol:upload-banner-dismissed';

export function UploadBanner() {
  const router = useRouter();
  const { hasData } = useGraduationMetadataStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsDismissed(window.sessionStorage.getItem(DISMISSED_STORAGE_KEY) === 'true');
    setIsHydrated(true);
  }, []);

  // Don't show if data exists or dismissed or not hydrated
  if (!isHydrated || hasData || isDismissed || router.pathname === '/dashboard/graduation/upload') {
    return null;
  }

  return (
    <aside
      aria-label="성적표 업로드 안내"
      className="relative border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-950"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm font-medium">
            <span className="hidden sm:inline">서비스 이용을 위해 </span>
            <strong>성적표를 업로드</strong>해주세요.
            <span className="hidden md:inline"> 성적표 기반으로 졸업요건 분석 및 맞춤 추천을 받을 수 있습니다.</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/graduation/upload"
            className="shrink-0 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-950 no-underline transition-colors hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            지금 업로드
          </Link>
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
              setIsDismissed(true);
            }}
            className="shrink-0 rounded-lg p-1.5 text-amber-700 transition-colors hover:bg-amber-100 hover:text-amber-950 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            aria-label="배너 닫기"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
