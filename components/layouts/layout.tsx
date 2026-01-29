import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { SidebarNavigation } from './layout-navbar';
import { DataManagementSection } from './data-management-section';
import { UploadBanner } from './upload-banner';
import { Sheet, SheetContent } from '@components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@components/ui/button';

import { cn } from '@/lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDashboard = router.pathname.includes('dashboard');

  if (!isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Desktop Sidebar (Dark Theme) */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 hidden h-screen shrink-0 flex-col border-r border-gray-800 bg-[#0F172A] transition-all duration-300 xl:flex',
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B62DA]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-white">Gijol</span>
              <p className="text-xs text-gray-400">졸업 관리 시스템</p>
            </div>
          )}
        </div>

        {/* Toggle Button (Absolute placement or in header?) Let's put it on the border or inside */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-8 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 bg-[#0F172A] text-gray-400 hover:bg-slate-800 hover:text-white"
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
          'flex h-screen flex-1 flex-col overflow-hidden bg-slate-100 transition-all duration-300',
          // Only apply margin on xl screens (when sidebar is visible)
          isCollapsed ? 'xl:ml-[80px]' : 'xl:ml-[256px]',
        )}
      >
        {/* Top Header (Mobile only shows hamburger) */}
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 xl:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B62DA]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Gijol</span>
          </Link>
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Upload Banner */}
        <UploadBanner />

        {/* Page Content */}
        <main
          className={`flex-1 ${router.pathname.startsWith('/dashboard/roadmap') ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-6'}`}
        >
          <div className={`${router.pathname.startsWith('/dashboard/roadmap') ? 'h-full' : 'mx-auto max-w-7xl'}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-gray-800 bg-[#0F172A] p-0">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B62DA]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
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
