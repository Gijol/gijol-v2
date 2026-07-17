import React from 'react';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { DashboardPageShell, PageHeader } from '@/components/dashboard/page-shell';

export default function SchoolInfo() {
  return (
    <DashboardPageShell>
      <PageHeader title="학교 유용한 정보" description="학교 생활에 필요한 정보를 모아 제공합니다." />
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">준비 중인 페이지입니다.</p>
    </DashboardPageShell>
  );
}

SchoolInfo.getLayout = dashboardLayout;
