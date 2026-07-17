import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { SidebarNavigation } from './layout-navbar';
import { DataManagementSection } from './data-management-section';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@components/ui/button';

import { cn } from '@/lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isWorkspaceRoute =
    router.pathname.startsWith('/dashboard/roadmap') || router.pathname === '/dashboard/timetable/[planId]';
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <a
        href="#dashboard-content"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 motion-reduce:transition-none"
      >
        본문으로 건너뛰기
      </a>
      {/* Desktop Sidebar (Dark Theme) */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 hidden h-screen shrink-0 flex-col border-r border-gray-800 bg-[#0F172A] transition-[width] duration-200 ease-[var(--ease-ui-out)] xl:flex',
          mobileOpen ? 'w-64' : 'w-64', // Fallback, but we use a local state for collapse
        )}
        style={{ width: isCollapsed ? '80px' : '256px' }}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center border-b border-gray-800 py-5',
            isCollapsed ? 'justify-center px-0' : 'gap-3 px-5',
          )}
        >
          <Link href="/dashboard" aria-label="Gijol 대시보드 홈" className="shrink-0">
            <Image src="/images/gijol_3d_icon.png" alt="" width={42} height={42} priority className="drop-shadow-lg" />
          </Link>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-white">Gijol</span>
              <p className="text-xs text-gray-400">졸업 관리 시스템</p>
            </div>
          )}
        </div>

        {/* Toggle Button (Absolute placement or in header?) Let's put it on the border or inside */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-8 -right-3 flex h-6 w-6 touch-manipulation items-center justify-center rounded-full border border-gray-700 bg-[#0F172A] text-gray-400 transition-[background-color,color,transform] hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none active:scale-[0.96] motion-reduce:transform-none"
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </button>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNavigation variant="dark" isCollapsed={isCollapsed} />
        </div>

        {/* 데이터 관리 Section */}
        <DataManagementSection isCollapsed={isCollapsed} />
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex h-screen flex-1 flex-col overflow-hidden bg-slate-100 transition-[margin-left] duration-200 ease-[var(--ease-ui-out)]',
          // Only apply margin on xl screens (when sidebar is visible)
          isCollapsed ? 'xl:ml-[80px]' : 'xl:ml-[256px]',
        )}
      >
        {/* Top Header (Mobile only shows hamburger) */}
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 xl:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline" aria-label="Gijol 홈">
            <Image src="/images/gijol_3d_icon.png" alt="" width={34} height={34} priority className="drop-shadow-sm" />
            <span className="text-lg font-bold text-gray-900">Gijol</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={mobileOpen}
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main
          id="dashboard-content"
          tabIndex={-1}
          className={`flex-1 ${isWorkspaceRoute ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-6'}`}
        >
          <div className={isWorkspaceRoute ? 'h-full' : 'mx-auto max-w-7xl'}>{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-gray-800 bg-[#0F172A] p-0">
          <SheetTitle className="sr-only">모바일 내비게이션</SheetTitle>
          <SheetDescription className="sr-only">대시보드 주요 화면으로 이동하는 모바일 메뉴입니다.</SheetDescription>

          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-5">
            <Image src="/images/gijol_3d_icon.png" alt="Gijol" width={40} height={40} className="drop-shadow-md" />
            <span className="text-lg font-bold text-white">Gijol</span>
          </div>

          <div className="p-4">
            <SidebarNavigation variant="dark" />
          </div>

          {/* 데이터 관리 Section */}
          <div className="absolute right-0 bottom-0 left-0">
            <DataManagementSection isCollapsed={false} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
