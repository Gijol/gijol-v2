import { CheckCircle2, FileDown, Loader2, Pencil, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewSection } from '../sections/review-section';

interface SummaryViewProps {
  onEdit: () => void;
  onExport: () => void;
  onReset: () => void;
  isGenerating: boolean;
}

export function SummaryView({ onEdit, onExport, onReset, isGenerating }: SummaryViewProps) {
  return (
    <div className="mx-auto w-full max-w-5xl pb-6">
      <header className="mb-7 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={20} />
          </div>
          <p className="text-xs font-semibold tracking-[0.12em] text-emerald-700 uppercase">입력 완료</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance text-slate-950 sm:text-3xl">
            확인서 내용을 검토하세요
          </h1>
          <p className="mt-2 text-sm leading-6 text-pretty text-slate-500">
            다운로드 전에 신청자 정보와 이수학점을 한 번 더 확인해 주세요.
          </p>
        </div>
        <Button variant="outline" onClick={onEdit} className="self-start shadow-none sm:self-auto">
          <Pencil aria-hidden="true" />
          입력 내용 수정
        </Button>
      </header>

      <ReviewSection />

      <div className="mt-6 border-t border-slate-200 pt-5 pb-[env(safe-area-inset-bottom)]">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            onClick={onReset}
            className="text-destructive hover:bg-destructive/5 hover:text-destructive shadow-none"
          >
            <RotateCcw aria-hidden="true" />
            초기화
          </Button>
          <Button variant="brand" onClick={onExport} disabled={isGenerating} aria-live="polite" className="sm:min-w-44">
            {isGenerating ? (
              <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
            ) : (
              <FileDown aria-hidden="true" />
            )}
            {isGenerating ? 'Excel 생성 중…' : 'Excel 다운로드'}
          </Button>
        </div>
      </div>
    </div>
  );
}
