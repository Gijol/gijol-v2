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
  badge,
  variant = 'light'
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
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all my-0.5 no-underline",
        isDark ? (
          active
            ? "bg-[#0B62DA] text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        ) : (
          active
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        )
      )}
    >
      <Icon 
        size={20} 
        className={cn(
          isDark ? (
            active ? "text-white" : "text-gray-400"
          ) : (
            active ? "text-blue-700" : "text-gray-500"
          )
        )} 
      />
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );
}

export function SidebarNavigation({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
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
      variant={variant}
    />
  ));

  return (
    <nav className="flex flex-col gap-1">
      {links}
    </nav>
  );
}
