import { FileDown, Pencil, RotateCcw, Loader2 } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col bg-gray-50/50 pt-8 pb-8">
      <div className="mx-auto w-full max-w-4xl flex-1 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">📜 졸업 이수요건 정보 미리보기</h1>
          <p className="mt-1 text-sm text-gray-500">입력하신 데이터를 바탕으로 생성된 확인서입니다.</p>
        </div>

        {/* Review Content */}

        <ReviewSection />
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-8 z-50 mx-auto w-fit">
        <div className="flex items-center gap-2 rounded-full border border-gray-400 bg-white/95 p-2 shadow-xl backdrop-blur-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-destructive hover:bg-destructive/5 hover:text-destructive rounded-full hover:cursor-pointer"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            초기화
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} className="rounded-full hover:cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />
            수정하기
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={onExport}
            disabled={isGenerating}
            className="rounded-full hover:cursor-pointer"
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            {isGenerating ? '생성 중...' : 'Excel 다운로드'}
          </Button>
        </div>
      </div>
    </div>
  );
}
