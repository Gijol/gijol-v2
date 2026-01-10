import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { SidebarNavigation } from './layout-navbar';
import { Sheet, SheetContent } from '@components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@components/ui/button';

export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = router.pathname.includes('dashboard');

  if (!isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Desktop Sidebar (Dark Theme) */}
      <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-800 bg-[#0F172A] xl:flex">
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
          <div>
            <span className="text-lg font-bold text-white">GradPath</span>
            <p className="text-xs text-gray-400">졸업 관리 시스템</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNavigation variant="dark" />
        </div>

        {/* User Section */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B62DA] text-sm font-semibold text-white">
              서
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">서동호</p>
              <p className="truncate text-xs text-gray-400">sfdw2010@gmail.com</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-400 no-underline transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            로그아웃
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col bg-slate-100 xl:ml-64">
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
            <span className="text-lg font-bold text-gray-900">GradPath</span>
          </Link>
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
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
            <span className="text-lg font-bold text-white">GradPath</span>
          </div>

          <div className="p-4">
            <SidebarNavigation variant="dark" />
          </div>

          {/* User Section */}
          <div className="absolute right-0 bottom-0 left-0 border-t border-gray-800 p-4">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B62DA] text-sm font-semibold text-white">
                서
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">서동호</p>
                <p className="truncate text-xs text-gray-400">sfdw2010@gmail.com</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
