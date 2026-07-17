'use client';

import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';

interface UserInfoCardProps {
  studentId?: string;
  entryYear: number | null;
  userMajor: string;
  userMinors: string[];
  className?: string;
}

function getMajorLabel(value: string): string {
  return MAJOR_OPTIONS.find((option) => option.value === value)?.label || value || '미선택';
}

function getMinorLabels(values: string[]): string[] {
  return values.map((value) => MINOR_OPTIONS.find((option) => option.value === value)?.label || value);
}

export function UserInfoCard({ studentId, entryYear, userMajor, userMinors, className }: UserInfoCardProps) {
  const minorLabels = getMinorLabels(userMinors);

  return (
    <section
      aria-labelledby="student-info-title"
      className={cn(
        'h-full min-w-0 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <User aria-hidden="true" size={16} />
        </div>
        <div>
          <h3 id="student-info-title" className="text-base font-semibold text-slate-950 dark:text-slate-50">
            학적 정보
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">졸업요건 계산 기준</p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">학번</dt>
          <dd className="min-w-0 text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {studentId || '미확인'}
          </dd>
        </div>
        <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">입학년도</dt>
          <dd className="text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {entryYear ? `${entryYear}년` : '미입력'}
          </dd>
        </div>
        <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">전공</dt>
          <dd className="min-w-0 text-sm font-semibold break-words text-slate-900 dark:text-slate-100">
            {getMajorLabel(userMajor)}
          </dd>
        </div>
        <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">부전공</dt>
          <dd className="min-w-0 text-sm text-slate-700 dark:text-slate-300">
            {minorLabels.length ? minorLabels.join(', ') : '미선택'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
