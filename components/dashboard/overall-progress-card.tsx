import { cn } from '@/lib/utils';

interface OverallProgressCardProps {
  totalPercentage: number;
  totalCreditsEarned: number;
  totalRequiredCredits: number;
  remainingCredits: number;
  completedCourses: number;
  className?: string;
}

export function OverallProgressCard({
  totalPercentage,
  totalCreditsEarned,
  totalRequiredCredits,
  remainingCredits,
  completedCourses,
  className,
}: OverallProgressCardProps) {
  const safePercentage = Math.min(Math.max(totalPercentage, 0), 100);

  return (
    <section
      aria-labelledby="overall-progress-title"
      className={cn(
        'flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-950',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id="overall-progress-title" className="text-base font-semibold text-slate-950 dark:text-slate-50">
            전체 졸업 진행률
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">총 이수학점을 기준으로 계산합니다.</p>
        </div>
        <p className="shrink-0 text-3xl font-bold tracking-tight text-blue-700 tabular-nums dark:text-blue-400">
          {Math.round(safePercentage)}%
        </p>
      </div>

      <div className="mt-7 flex items-end gap-2">
        <span className="text-4xl leading-none font-bold tracking-tight text-slate-950 tabular-nums dark:text-slate-50">
          {totalCreditsEarned.toLocaleString('ko-KR')}
        </span>
        <span className="pb-0.5 text-sm font-medium text-slate-400 tabular-nums">
          / {totalRequiredCredits.toLocaleString('ko-KR')}학점
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="전체 졸업 진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safePercentage)}
        className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      >
        <div
          className="h-full origin-left rounded-full bg-blue-600 transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${safePercentage / 100})` }}
        />
      </div>

      <dl className="mt-6 grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200 pt-5 dark:divide-slate-800 dark:border-slate-800">
        <div className="pr-5">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">남은 학점</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {remainingCredits.toLocaleString('ko-KR')}학점
          </dd>
        </div>
        <div className="pl-5">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">이수 과목</dt>
          <dd className="mt-1 text-xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {completedCourses.toLocaleString('ko-KR')}과목
          </dd>
        </div>
      </dl>
    </section>
  );
}
