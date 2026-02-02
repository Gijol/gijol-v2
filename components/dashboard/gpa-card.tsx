import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GPACardProps {
  overallAverageGrade: number | null;
  gradeDelta: number | null;
  className?: string;
}

export function GPACard({ overallAverageGrade, gradeDelta, className }: GPACardProps) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-xl border border-slate-300 bg-white p-6', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">누적 GPA</span>
        {gradeDelta !== null && (
          <div className="flex items-center gap-1">
            <TrendingUp size={16} color={gradeDelta >= 0 ? '#2fb344' : '#f03e3e'} />
            <span className={cn('text-sm font-bold', gradeDelta >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {gradeDelta >= 0 ? '+' : ''}
              {gradeDelta.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl leading-none font-extrabold text-gray-900">
          {overallAverageGrade != null ? overallAverageGrade.toFixed(2) : '-'}
        </span>
        <span className="text-sm font-semibold text-gray-500">/ 4.5</span>
      </div>
      <p className="text-xs text-gray-500">누적 평균 학점을 기준으로 계산했어요.</p>
    </div>
  );
}
