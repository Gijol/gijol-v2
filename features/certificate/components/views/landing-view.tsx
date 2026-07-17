import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Clock3, FileSpreadsheet, RotateCcw, ShieldCheck } from 'lucide-react';
import { DashboardPageShell, PageHeader } from '@/components/dashboard/page-shell';

interface LandingViewProps {
  onStart: () => void;
  hasSavedData?: boolean;
}

export function LandingView({ onStart, hasSavedData }: LandingViewProps) {
  return (
    <DashboardPageShell>
      <PageHeader
        eyebrow="졸업 신청 준비"
        title="이수요건 확인서를 단계별로 완성하세요"
        description="신청자 정보와 이수학점을 입력하면 GIST 졸업 신청용 Excel 확인서를 만들어 드립니다."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" variant="brand" onClick={onStart} className="h-11 px-5 text-sm font-semibold">
              {hasSavedData ? (
                <>
                  <RotateCcw aria-hidden="true" />
                  작성하던 내용 불러오기
                </>
              ) : (
                <>
                  확인서 작성 시작
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </Button>
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Clock3 aria-hidden="true" size={15} /> 약 5분 소요
            </span>
          </div>
        }
      />

      {hasSavedData && (
        <p className="mb-5 text-sm font-medium text-blue-700" role="status">
          이 브라우저에 저장된 작성 내용이 있습니다.
        </p>
      )}

      <section
        aria-labelledby="certificate-process-title"
        className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 id="certificate-process-title" className="text-base font-semibold text-slate-950">
              준비할 내용
            </h2>
            <p className="mt-1 text-sm text-slate-500">입력 내용은 브라우저에 자동 저장됩니다.</p>
          </div>
          <ShieldCheck aria-hidden="true" className="shrink-0 text-emerald-600" size={20} />
        </div>

        <ol className="mt-5 space-y-4">
          {[
            ['1', '신청자 정보', '신청 기간, 소속, 학번과 연락처'],
            ['2', '이수학점', '기이수·수강 중 학점을 영역별로 입력'],
            ['3', '검토 및 다운로드', '입력 내용을 확인하고 Excel 생성'],
          ].map(([number, title, description]) => (
            <li key={number} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 tabular-nums">
                {number}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-sm leading-6 text-pretty text-slate-500">{description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3">
          <Check aria-hidden="true" className="mt-0.5 shrink-0 text-blue-700" size={16} />
          <p className="text-xs leading-5 text-slate-600">
            생성된 파일은 기본 서식입니다. 제출 전 세부 내용과 예외 사항을 반드시 확인해 주세요.
          </p>
        </div>
      </section>
    </DashboardPageShell>
  );
}
