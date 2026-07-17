import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageWidth = 'default' | 'reading' | 'full';

const widthClassNames: Record<PageWidth, string> = {
  default: 'max-w-7xl',
  reading: 'max-w-5xl',
  full: 'max-w-none',
};

export function DashboardPageShell({
  className,
  width = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { width?: PageWidth }) {
  return <div className={cn('mx-auto w-full pb-12', widthClassNames[width], className)} {...props} />;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold tracking-[0.14em] text-blue-700 uppercase">{eyebrow}</p>}
        <h1
          className={cn(
            'text-2xl font-semibold tracking-tight text-balance text-slate-950 sm:text-3xl',
            eyebrow && 'mt-2',
          )}
        >
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-pretty text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-pretty text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
