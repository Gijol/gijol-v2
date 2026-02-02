import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCntTab } from '@utils/status';
import { navLinks, guideLinks } from '@const/nav-links';
import { cn } from '@/lib/utils';

function TailwindNavLink({
  label,
  href,
  active,
  icon: Icon,
  badge,
  variant = 'light',
}: {
  label: string;
  href: string;
  active: boolean;
  icon: any;
  badge?: React.ReactNode;
  variant?: 'light' | 'dark';
}) {
  const isDark = variant === 'dark';

  return (
    <Link
      href={href}
      className={cn(
        'my-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all',
        isDark
          ? active
            ? 'bg-slate-800 text-blue-500'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
          : active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100',
      )}
    >
      <Icon
        size={20}
        className={cn(
          isDark ? (active ? 'text-blue-500' : 'text-gray-400') : active ? 'text-blue-700' : 'text-gray-500',
        )}
      />
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SidebarNavigation({
  variant = 'light',
  isCollapsed = false,
}: {
  variant?: 'light' | 'dark';
  isCollapsed?: boolean;
}) {
  const router = useRouter();
  const cntRoute = getCntTab(router.route);

  const renderLinks = (linksToRender: typeof navLinks) =>
    linksToRender.map((link) => {
      const isActive = link.label === cntRoute;
      const button = (
        <Link
          href={link.href}
          className={cn(
            'my-0.5 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all',
            isCollapsed ? 'justify-center' : 'gap-3',
            variant === 'dark'
              ? isActive
                ? 'bg-slate-800 text-blue-500'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
              : isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100',
          )}
        >
          <link.icon
            size={20}
            className={cn(
              variant === 'dark'
                ? isActive
                  ? 'text-blue-500'
                  : 'text-gray-400'
                : isActive
                  ? 'text-blue-700'
                  : 'text-gray-500',
              isCollapsed ? '' : '',
            )}
          />
          {!isCollapsed && <span className="flex-1 truncate">{link.label}</span>}
          {!isCollapsed && link.badge}
        </Link>
      );

      if (isCollapsed) {
        return (
          <TooltipProvider key={link.label} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right" className="border-0 bg-slate-900 text-white">
                {link.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return <div key={link.label}>{button}</div>;
    });

  return (
    <nav className="flex flex-col gap-1">
      {renderLinks(navLinks)}
      <div className="my-2 border-t border-gray-200 dark:border-slate-800" />
      {renderLinks(guideLinks)}
    </nav>
  );
}
