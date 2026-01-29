'use client';

import Link from 'next/link';
import { useGraduationStore } from '@/lib/stores/useGraduationStore';
import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function UploadBanner() {
  const { parsed } = useGraduationStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't show if data exists or dismissed or not hydrated
  if (!isHydrated || parsed || isDismissed) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            <span className="hidden sm:inline">서비스 이용을 위해 </span>
            <strong>성적표를 업로드</strong>해주세요.
            <span className="hidden md:inline"> 성적표 기반으로 졸업요건 분석 및 맞춤 추천을 받을 수 있습니다.</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/graduation/upload"
            className="shrink-0 rounded-lg bg-white/20 px-4 py-1.5 text-sm font-semibold text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            지금 업로드
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="shrink-0 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="배너 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
