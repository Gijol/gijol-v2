import { Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GPACardProps {
  overallAverageGrade: number | null;
  majorAverageGrade: number | null;
  gradeDelta: number | null;
  gradesVisible: boolean;
  onGradesVisibleChange: (visible: boolean) => void;
  className?: string;
}

export function GPACard({
  overallAverageGrade,
  majorAverageGrade,
  gradeDelta,
  gradesVisible,
  onGradesVisibleChange,
  className,
}: GPACardProps) {
  const TrendIcon = gradeDelta !== null && gradeDelta < 0 ? TrendingDown : TrendingUp;

  return (
    <section
      aria-labelledby="gpa-card-title"
      className={cn(
        'flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id="gpa-card-title" className="text-base font-semibold text-slate-950 dark:text-slate-50">
            성적 요약
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">전체 및 전공 평점</p>
        </div>
        <button
          type="button"
          aria-pressed={gradesVisible}
          onClick={() => onGradesVisibleChange(!gradesVisible)}
          className="inline-flex h-9 shrink-0 touch-manipulation items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold whitespace-nowrap text-slate-600 transition-[transform,background-color,border-color,color] duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          {gradesVisible ? <EyeOff aria-hidden="true" size={15} /> : <Eye aria-hidden="true" size={15} />}
          {gradesVisible ? '성적 숨기기' : '성적 보기'}
        </button>
      </div>

      <dl className="mt-6 grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800">
        <div className="pr-5">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">전체 평점</dt>
          <dd className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-950 tabular-nums dark:text-slate-50">
              {gradesVisible ? (overallAverageGrade?.toFixed(2) ?? '—') : '•••'}
            </span>
            {gradesVisible && overallAverageGrade !== null && <span className="text-xs text-slate-400">/ 4.5</span>}
          </dd>
        </div>
        <div className="pl-5">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">전공 평점</dt>
          <dd className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-950 tabular-nums dark:text-slate-50">
              {gradesVisible ? (majorAverageGrade?.toFixed(2) ?? '—') : '•••'}
            </span>
            {gradesVisible && majorAverageGrade !== null && <span className="text-xs text-slate-400">/ 4.5</span>}
          </dd>
        </div>
      </dl>

      <div className="mt-auto min-h-6 pt-5 text-xs text-slate-500 dark:text-slate-400">
        {gradesVisible && gradeDelta !== null ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              gradeDelta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
            )}
          >
            <TrendIcon aria-hidden="true" size={14} />
            직전 학기 대비 {gradeDelta >= 0 ? '+' : ''}
            {gradeDelta.toFixed(2)}
          </span>
        ) : (
          <span>{gradesVisible ? '비교할 이전 학기 성적이 없습니다.' : '평점은 요청할 때만 표시됩니다.'}</span>
        )}
      </div>
    </section>
  );
}
