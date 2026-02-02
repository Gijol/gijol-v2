import { cn } from '@/lib/utils';

interface OverallProgressCardProps {
  totalPercentage: number;
  totalCreditsEarned: number;
  totalRequiredCredits: number;
  className?: string;
}

export function OverallProgressCard({
  totalPercentage,
  totalCreditsEarned,
  totalRequiredCredits,
  className,
}: OverallProgressCardProps) {
  return (
    <div className={cn('rounded-xl border border-slate-300 bg-white p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">전체 졸업 진행률</h2>
        <span className="text-2xl font-bold text-[#0B62DA]">{totalPercentage}%</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-sm text-gray-500">이수:</span>
            <span className="font-semibold text-gray-900">{totalCreditsEarned}학점</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-500">목표:</span>
            <span className="font-semibold text-gray-900">{totalRequiredCredits}학점</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#0B62DA] to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
