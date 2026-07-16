import React from 'react';
import { CalendarRange, Gauge, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export default function OverallSemesterCard({
  start_y,
  start_s,
  end_y,
  end_s,
  semesterCount,
  avgCreditPerSemester,
  bestSemester,
}: {
  start_y?: number;
  start_s?: string;
  end_y?: number;
  end_s?: string;
  semesterCount: number;
  avgCreditPerSemester: number;
  bestSemester: any | null;
}) {
  const rangeLabel = start_y && start_s && end_y && end_s ? `${start_y}년 ${start_s} ~ ${end_y}년 ${end_s}` : '-';

  const bestLabel = bestSemester ? `${bestSemester.year}년 ${bestSemester.semester_str}` : '-';

  const bestGrade = bestSemester ? bestSemester.grade.toFixed(2) : null;

  const metrics = [
    {
      label: '이수 학기',
      value: `${semesterCount}`,
      suffix: '학기',
      icon: CalendarRange,
      tone: 'text-blue-600 bg-blue-50',
    },
    {
      label: '학기당 평균',
      value: `${avgCreditPerSemester}`,
      suffix: '학점',
      icon: Gauge,
      tone: 'text-violet-600 bg-violet-50',
    },
    {
      label: '최고 성적 학기',
      value: bestGrade ?? '-',
      suffix: bestGrade ? '평점' : '',
      icon: Trophy,
      tone: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <Card className="h-full overflow-hidden border-slate-200 p-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <CardTitle className="text-base font-black tracking-tight text-slate-950">이수 학기 정보</CardTitle>
        <p className="text-xs font-medium text-slate-500">수강 기록의 기간과 학기별 흐름을 요약합니다.</p>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
          <div className="text-[11px] font-black tracking-[0.12em] text-blue-600 uppercase">이수 기간</div>
          <div className="mt-1 text-base font-black tracking-tight text-slate-950">{rangeLabel}</div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {metrics.map(({ label, value, suffix, icon: Icon, tone }) => (
            <div key={label} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <div className="mt-3 flex min-w-0 items-baseline gap-1">
                <span className="truncate text-xl font-black tracking-tight text-slate-950">{value}</span>
                {suffix && <span className="shrink-0 text-[11px] font-bold text-slate-400">{suffix}</span>}
              </div>
              <div className="mt-0.5 truncate text-[11px] font-bold text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <span className="font-medium text-slate-500">가장 높은 평점을 기록한 학기</span>
          <span className="text-right font-black text-slate-800">{bestLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
