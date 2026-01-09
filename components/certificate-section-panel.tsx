import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Progress } from '@components/ui/progress';
import { Separator } from '@components/ui/separator';
// Using standard div for menu list instead of Shadcn Tabs because it behaves more like a navigation menu with external state
// But since the original used Tabs, I will try to use custom styled buttons or a list to mimic the behavior.
// Actually, Shadcn Tabs are for tab content switching. Here it seems to act as a sidebar menu.
// I will use simple buttons for the menu items to avoid wrestling with Tabs styling for vertical menu if not strictly needed.
import { IconFileCheck, IconFileDownload } from '@tabler/icons-react';
import { section_titles, SectionTitleType } from '@const/grad-certificate-inputs';
import { Dispatch, SetStateAction } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from "@/lib/utils";

export default function CertificateSectionPanel({
  activeTab,
  setActiveTab,
}: {
  activeTab: SectionTitleType;
  setActiveTab: Dispatch<SetStateAction<SectionTitleType>>;
}) {
  const { getValues } = useFormContext();

  return (
    <div className="flex flex-col gap-0">
      <Card className="p-4 rounded-md border mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold m-0">
            ✍️ 입력 완성도
          </h3>
          <Badge>80%</Badge>
        </div>
        <Progress value={80} className="h-2" />
      </Card>

      <div className="flex flex-col gap-1">
        {section_titles.map((title) => (
          <button
            key={title}
            onClick={() => setActiveTab(title)}
            className={cn(
              "text-left px-4 py-3 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
              activeTab === title ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
            )}
          >
            {title}
          </button>
        ))}
      </div>

      <div className="hidden xl:block mt-4">
        <Separator className="my-2" />
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            className="flex-1 border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700 bg-teal-50/50"
          >
            <IconFileCheck size={20} className="mr-2" />
            임시저장
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 bg-red-50/50"
          >
            <IconFileDownload size={20} className="mr-2 text-red-600" />
            리셋하기
          </Button>
        </div>
        <Button
          type="submit"
          className="w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
          onClick={() => console.log(getValues())}
        >
          <IconFileDownload size={20} className="mr-2" />
          PDF 생성하기
        </Button>
      </div>
    </div>
  );
}
