import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCntTab } from '@utils/status';
import { navLinks } from '@const/nav-links';
import { cn } from '@/lib/utils';

function TailwindNavLink({
  label,
  href,
  active,
  icon: Icon,
  badge
}: {
  label: string;
  href: string;
  active: boolean;
  icon: any;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors my-1",
        active
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      )}
    >
      <Icon size={20} className={cn(active ? "text-blue-700 dark:text-blue-300" : "text-gray-500 dark:text-gray-400")} />
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );
}

export function SidebarNavigation() {
  const router = useRouter();
  const cntRoute = getCntTab(router.route);

  const links = navLinks.map((link) => (
    <TailwindNavLink
      key={link.label}
      active={link.label === cntRoute}
      label={link.label}
      href={link.href}
      icon={link.icon}
      badge={link.badge}
    />
  ));

  return (
    <div className="flex flex-col h-full py-2">
      {links}
    </div>
  );
}


