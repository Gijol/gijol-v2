import { cn } from '@/lib/utils';

export const BentoGrid = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn('mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3', className)}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  disableHover = false,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  disableHover?: boolean;
}) => {
  return (
    <div
      className={cn(
        'group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-slate-200 bg-white p-4 transition duration-200 dark:border-white/20 dark:bg-black dark:shadow-none',
        !disableHover && 'hover:shadow-xl',
        className,
      )}
    >
      {header}
      <div className={cn('transition duration-200', !disableHover && 'group-hover/bento:translate-x-2')}>
        {icon}
        <div className="mt-2 mb-2 font-sans font-bold text-gray-900 dark:text-neutral-200">{title}</div>
        <div className="font-sans text-xs font-normal text-gray-500 dark:text-neutral-300">{description}</div>
      </div>
    </div>
  );
};
