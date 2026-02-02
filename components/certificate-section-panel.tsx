import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Progress } from '@components/ui/progress';
import { Separator } from '@components/ui/separator';
import { FileCheck, FileDown } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { cn } from '@/lib/utils';

// Section titles defined locally to avoid importing from grad-certificate-inputs
const section_titles = [
  '신청자 정보',
  '기초 및 교양 학점',
  '전공 | 연구 | 자유선택 학점',
  '무학점 필수',
  '기타 학점',
] as const;

type SectionTitleType = (typeof section_titles)[number];

export default function CertificateSectionPanel({
  activeTab,
  setActiveTab,
  onSave,
  onReset,
  onSubmit,
}: {
  activeTab: SectionTitleType;
  setActiveTab: Dispatch<SetStateAction<SectionTitleType>>;
  onSave?: () => void;
  onReset?: () => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="flex flex-col gap-0">
      <div className="mb-4 rounded-md border border-gray-200 bg-white/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-base font-semibold">✍️ 입력 완성도</h3>
          <Badge>80%</Badge>
        </div>
        <Progress value={80} className="h-2" />
      </div>

      <div className="flex flex-col gap-1">
        {section_titles.map((title) => (
          <button
            key={title}
            onClick={() => setActiveTab(title)}
            className={cn(
              'relative rounded-md px-4 py-3 text-left text-sm font-medium transition-all',
              activeTab === title
                ? 'bg-blue-50 font-semibold text-blue-700 before:absolute before:top-1/2 before:left-0 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-blue-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {title}
          </button>
        ))}
      </div>

      <div className="mt-4 hidden xl:block">
        <Separator className="my-2" />
        <div className="mb-2 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-teal-500 bg-teal-50/50 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
            onClick={onSave}
          >
            <FileCheck size={20} className="mr-2" />
            임시저장
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-500 bg-red-50/50 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onReset}
          >
            <FileDown size={20} className="mr-2 text-red-600" />
            리셋하기
          </Button>
        </div>
        <Button
          type="button"
          className="w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
          onClick={onSubmit}
        >
          <FileDown size={20} className="mr-2" />
          PDF 생성하기
        </Button>
      </div>
    </div>
  );
}

export { section_titles, type SectionTitleType };
