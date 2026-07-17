import React from 'react';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { convertGradeTo4Scale } from '@utils/status';

export default function OverallAcademicCard({
  totalCredit,
  totalRequired,
  averageGrade,
  majorAverageGrade,
  progress,
  studentId,
  majorName,
  entryYear,
  gradesVisible,
  onGradesVisibleChange,
}: {
  totalCredit: number;
  totalRequired: number;
  averageGrade: number | null;
  majorAverageGrade: number | null;
  progress: number;
  studentId?: string;
  majorName?: string;
  entryYear?: number;
  gradesVisible: boolean;
  onGradesVisibleChange: (visible: boolean) => void;
}) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <Card className="h-full min-w-0 gap-0 overflow-hidden border-slate-200 bg-white p-0 shadow-none dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-slate-950 dark:text-slate-50">학업 현황</CardTitle>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">졸업 이수학점과 현재 평점을 요약합니다.</p>
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
      </CardHeader>

      <CardContent className="grid flex-1 gap-0 p-0 md:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.75fr)]">
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">이수 학점</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-4xl leading-none font-bold tracking-tight text-slate-950 tabular-nums dark:text-slate-50">
                {totalCredit}
              </span>
              <span className="pb-0.5 text-sm font-medium text-slate-400 tabular-nums dark:text-slate-500">
                / {totalRequired}학점
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-4 text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">졸업 이수학점 진행률</span>
              <span className="font-semibold text-blue-700 tabular-nums dark:text-blue-400">
                {Math.round(safeProgress)}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="졸업 이수학점 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(safeProgress)}
              className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-200 ease-out motion-reduce:transition-none"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="border-r border-slate-200 pr-4 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">전체 평점</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-950 tabular-nums dark:text-slate-50">
                  {gradesVisible ? (averageGrade ?? '—') : '•••'}
                </span>
                {gradesVisible && averageGrade != null && (
                  <span className="text-xs text-slate-400 tabular-nums">/ 4.5</span>
                )}
              </div>
            </div>
            <div className="pl-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">전공 평점</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-950 tabular-nums dark:text-slate-50">
                  {gradesVisible ? (majorAverageGrade ?? '—') : '•••'}
                </span>
                {gradesVisible && majorAverageGrade != null && (
                  <span className="text-xs text-slate-400 tabular-nums">/ 4.5</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto min-h-6 pt-5 text-xs text-slate-500 dark:text-slate-400">
            {gradesVisible && averageGrade != null ? (
              <div className="flex items-center gap-1.5">
                <span>
                  4.0 환산{' '}
                  <strong className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">
                    {convertGradeTo4Scale(averageGrade, 4.5)}
                  </strong>
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="4.0 환산 평점 안내"
                        className="rounded-full text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:hover:text-slate-200"
                      >
                        <HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>환산 평점은 참고용 값입니다.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <span>평점은 ‘성적 보기’를 누르면 표시됩니다.</span>
            )}
          </div>
        </div>

        <dl className="grid content-start gap-0 border-t border-slate-200 bg-slate-50/70 px-5 py-2 md:border-t-0 md:border-l dark:border-slate-800 dark:bg-slate-900/50">
          <div className="border-b border-slate-200 py-4 dark:border-slate-800">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">소속학과</dt>
            <dd className="mt-1 text-sm font-semibold break-words text-slate-900 dark:text-slate-100">
              {majorName || '미선택'}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 py-4 md:grid-cols-1 dark:border-slate-800">
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">학번</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {studentId || '미확인'}
              </dd>
            </div>
            <div className="md:mt-4">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">입학년월</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {entryYear ? `${entryYear}년 3월` : '미확인'}
              </dd>
            </div>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
