import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@components/ui/button';


export function DashboardLayoutHeader({
  open,
}: {
  open: () => void;
}) {
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-slate-950">
      <div className='h-full py-2 flex items-center justify-between w-full'>
        <Link href="/dashboard" className="text-black no-underline dark:text-white">
          <span className="text-xl font-bold">
            🎓 Gijol.v2
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Dark mode disabled for now */}
          <div className="xl:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500"
              onClick={open}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
