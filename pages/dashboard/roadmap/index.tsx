// pages/dashboard/roadmap/index.tsx
// Roadmap index page - shows sidebar with presets and an intro canvas
import React from 'react';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { NextSeo } from 'next-seo';
import { Map, ArrowRight } from 'lucide-react';
import { PresetsSidebar } from '@/features/roadmap/PresetsSidebar';

export default function RoadmapPage() {
  return (
    <div className="flex h-full w-full">
      <NextSeo title="로드맵" description="수강 로드맵을 확인하고 계획하세요" noindex />
      {/* Sidebar with presets */}
      <PresetsSidebar />

      {/* Main content area - intro/welcome screen */}
      <section
        aria-labelledby="roadmap-empty-title"
        className="flex min-w-0 flex-1 items-center justify-center bg-slate-50"
      >
        <div className="max-w-md px-8 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-blue-100 p-4">
            <Map aria-hidden="true" className="h-10 w-10 text-blue-600" />
          </div>
          <h1 id="roadmap-empty-title" className="mb-3 text-2xl font-semibold tracking-tight text-slate-950">
            로드맵 프리셋
          </h1>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            왼쪽 사이드바에서 학과별 권장 로드맵을 선택하여 확인하거나,
            <br />
            <span className="font-medium text-blue-700">“나만의 로드맵 만들기”</span> 버튼을 눌러
            <br />
            직접 로드맵을 설계해 보세요.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
            <span>좌측에서 프리셋을 선택하세요</span>
          </div>
        </div>
      </section>
    </div>
  );
}

RoadmapPage.getLayout = dashboardLayout;
