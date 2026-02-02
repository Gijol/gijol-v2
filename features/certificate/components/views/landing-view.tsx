import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
  hasSavedData?: boolean;
}

export function LandingView({ onStart, hasSavedData }: LandingViewProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        {/* Icon */}
        <div className="bg-brand-primary-soft mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
          <Sparkles className="text-brand-primary h-8 w-8" />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          졸업 이수요건 확인서 생성기
        </h1>

        {/* Description */}
        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          복잡한 졸업 이수요건 확인서를 쉽고 간편하게 작성하세요.
          <br className="hidden sm:block" />
          단계별 가이드에 따라 학점을 입력하면 엑셀 파일이 자동으로 생성됩니다.
        </p>

        {/* Features List */}
        <div className="mb-10 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary h-1.5 w-1.5 rounded-full" />
            <span>단계별 입력</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary h-1.5 w-1.5 rounded-full" />
            <span>자동 저장</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary h-1.5 w-1.5 rounded-full" />
            <span>엑셀 내보내기</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <Button size="lg" variant="brand" onClick={onStart} className="h-12 px-8 text-base font-semibold">
            {hasSavedData ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                작성하던 내용 불러오기
              </>
            ) : (
              <>
                생성해보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {hasSavedData && <p className="text-sm text-gray-500">이전에 저장된 데이터가 있습니다</p>}
        </div>
      </div>
    </div>
  );
}
