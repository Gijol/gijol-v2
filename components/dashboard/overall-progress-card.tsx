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
    <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">전체 졸업 진행률</h2>
        <span className="text-2xl font-bold text-[#0B62DA]">{totalPercentage}%</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-gray-500">이수:</span>
            <span className="font-semibold text-gray-900">{totalCreditsEarned}학점</span>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-sm text-gray-500">목표:</span>
            <span className="font-semibold text-gray-900">{totalRequiredCredits}학점</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0B62DA] to-cyan-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
