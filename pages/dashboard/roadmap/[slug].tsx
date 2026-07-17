// pages/dashboard/roadmap/[slug].tsx
import React, { useEffect, useState } from 'react';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { getRoadmapData } from '@/features/roadmap/fetcher';
import { PresetsSidebar } from '@/features/roadmap/PresetsSidebar';
import { RoadmapProvider } from '@/features/roadmap/RoadmapContext';

import type { RoadmapData } from '@/features/roadmap/types';

// Dynamic import for ReactFlow - loads only on client side
const RoadmapFlowWithProvider = dynamic(() => import('@/features/roadmap/RoadmapFlowClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500" />
        <p className="text-sm text-gray-500">로드맵을 불러오는 중...</p>
      </div>
    </div>
  ),
});

export default function RoadmapPresetPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !slug || typeof slug !== 'string') {
      return;
    }

    setLoading(true);
    setError(null);

    getRoadmapData(slug)
      .then((data) => {
        setRoadmapData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [router.isReady, slug]);

  let canvasContent: React.ReactNode;

  if (loading) {
    canvasContent = (
      <div className="flex h-full w-full items-center justify-center bg-slate-50" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500" />
          <p className="text-sm text-gray-500">로드맵을 불러오는 중...</p>
        </div>
      </div>
    );
  } else if (error) {
    canvasContent = (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">로드맵을 찾을 수 없습니다</h1>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  } else if (!roadmapData) {
    canvasContent = null;
  } else if (slug === 'BIOSCIENCE_RESEARCH') {
    canvasContent = (
      <div className="relative h-full w-full bg-slate-50">
        <Image
          src="/images/BIOSCIENCE_RESEARCH_DIAGRAM.png"
          alt="연구분야별 이수체계"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    );
  } else {
    canvasContent = <RoadmapFlowWithProvider roadmapData={roadmapData} />;
  }

  return (
    <RoadmapProvider>
      <NextSeo
        title={`${typeof slug === 'string' ? slug : ''} 로드맵`}
        description="학과별 수강 로드맵을 확인하세요"
        noindex
      />
      <div className="flex h-full w-full">
        <PresetsSidebar />
        <div className="min-w-0 flex-1">{canvasContent}</div>
      </div>
    </RoadmapProvider>
  );
}

RoadmapPresetPage.getLayout = dashboardLayout;
