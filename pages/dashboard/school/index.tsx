import { NextSeo } from 'next-seo';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { DashboardPageShell, PageHeader } from '@/components/dashboard/page-shell';

export default function SchoolMainPage() {
  return (
    <DashboardPageShell>
      <NextSeo title="학교 정보" description="GIST 학교 정보를 확인하세요" noindex />
      <PageHeader title="학교 정보" description="GIST 생활에 필요한 정보를 확인하세요." />
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">준비 중인 페이지입니다.</p>
    </DashboardPageShell>
  );
}

SchoolMainPage.getLayout = dashboardLayout;
