import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'blue' | 'gray' | 'yellow' | 'white';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'white',
  className,
}: StatCardProps) {
  const variantStyles = {
    blue: 'bg-gradient-to-br from-[#0B62DA] to-[#3B82F6] text-white',
    gray: 'bg-white border border-gray-200 text-gray-900',
    yellow: 'bg-gradient-to-br from-amber-400 to-orange-400 text-white',
    white: 'bg-white border border-gray-200 text-gray-900',
  };

  const iconStyles = {
    blue: 'bg-white/20 text-white',
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-white/20 text-white',
    white: 'bg-gray-100 text-gray-600',
  };

  const subtitleStyles = {
    blue: 'text-white/80',
    gray: 'text-gray-500',
    yellow: 'text-white/80',
    white: 'text-gray-500',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-5 flex items-start justify-between shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex-1">
        <p className={cn('text-sm font-medium mb-1', variant === 'white' || variant === 'gray' ? 'text-gray-600' : 'text-white/90')}>
          {title}
        </p>
        <p className="text-3xl font-bold tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className={cn('text-sm mt-1', subtitleStyles[variant])}>
            {subtitle}
          </p>
        )}
      </div>
      {icon && (
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', iconStyles[variant])}>
          {icon}
        </div>
      )}
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  current: number;
  total: number;
  percentage: number;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'gray';
  className?: string;
}

export function CategoryCard({
  title,
  current,
  total,
  percentage,
  color = 'blue',
  className,
}: CategoryCardProps) {
  const colorStyles = {
    blue: {
      badge: 'bg-blue-100 text-blue-700',
      progress: 'bg-blue-500',
    },
    green: {
      badge: 'bg-emerald-100 text-emerald-700',
      progress: 'bg-emerald-500',
    },
    yellow: {
      badge: 'bg-amber-100 text-amber-700',
      progress: 'bg-amber-500',
    },
    purple: {
      badge: 'bg-purple-100 text-purple-700',
      progress: 'bg-purple-500',
    },
    orange: {
      badge: 'bg-orange-100 text-orange-700',
      progress: 'bg-orange-500',
    },
    gray: {
      badge: 'bg-gray-100 text-gray-700',
      progress: 'bg-gray-500',
    },
  };

  return (
    <div className={cn('bg-white rounded-xl p-4 border border-gray-100 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold', colorStyles[color].badge)}>
            {title}
          </span>
        </div>
        <span className={cn('text-sm font-semibold', colorStyles[color].badge.replace('bg-', 'text-').split(' ')[1])}>
          {percentage}%
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-sm text-gray-500">이수:</span>
        <span className="font-semibold text-gray-900">{current}학점</span>
        <span className="text-gray-400 text-sm mx-1">/</span>
        <span className="text-sm text-gray-500">필요:</span>
        <span className="font-semibold text-gray-900">{total}학점</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorStyles[color].progress)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
