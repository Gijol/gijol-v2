import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayoutHeader } from './dashboard-layout-header';
import { SidebarNavigation } from './layout-navbar';
import { Sheet, SheetContent } from '@components/ui/sheet';

export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = router.pathname.includes('dashboard');

  if (!isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Top Header (Full Width) */}
      <DashboardLayoutHeader open={() => setMobileOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (Fixed below header) */}
        <aside className="!hidden xl:!block w-60 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 h-[calc(100vh-60px)] overflow-y-auto sticky top-0 shrink-0">
          <div className="p-4">
            <SidebarNavigation />
          </div>
        </aside>



        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)] w-full">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>


      {/* Mobile Sidebar (Sheet - Top) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="top" className="p-0 bg-white dark:bg-slate-950">
          <div className="flex h-[60px] items-center px-2 border-b border-gray-200 dark:border-gray-800 mb-4 justify-between">
            <span className="text-xl font-bold">🎓 Gijol.v2</span>
          </div>
          <div className="px-4 pb-6">
            <SidebarNavigation />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
