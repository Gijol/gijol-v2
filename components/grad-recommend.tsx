import { Alert, AlertDescription } from '@components/ui/alert';
import { Badge } from '@components/ui/badge';
import { Card } from '@components/ui/card';
import { Progress } from '@components/ui/progress';
import { ScrollArea } from '@components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconListCheck,
  IconTargetArrow,
} from '@tabler/icons-react';
import type { SingleCategoryType } from '@lib/types/grad';
import {
  getDomainColor,
  verifyStatus,
} from '@utils/graduation/grad-formatter';
import React from 'react';

type Props = {
  specificDomainStatusArr: { domain: string; status: SingleCategoryType | undefined }[];
};

export default function GradRecommend({ specificDomainStatusArr }: Props) {
  if (!specificDomainStatusArr || specificDomainStatusArr.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6 rounded-md">
      <Tabs
        defaultValue={specificDomainStatusArr[0]?.domain}
        className="w-full"
      >
        <ScrollArea className="w-full pb-2">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
            {specificDomainStatusArr.map((category) => {
              const status = verifyStatus(category.status?.satisfied, category.domain);

              return (
                <TabsTrigger
                  key={category.domain}
                  value={category.domain}
                  className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground border border-transparent data-[state=active]:border-border px-3 py-2 h-auto"
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>{category.domain}</span>
                    {status === 'satisfied' ? (
                      <IconCircleCheck size="1.2rem" className="text-green-500" stroke={1.6} />
                    ) : status === 'unSatisfied' ? (
                      <IconAlertTriangle size="1.2rem" className="text-red-500" stroke={1.6} />
                    ) : (
                      <IconAlertCircle size="1.2rem" className="text-blue-500" stroke={1.6} />
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </ScrollArea>

        {specificDomainStatusArr.map((category) => {
          const status = category.status;
          const statusType = verifyStatus(status?.satisfied, category.domain);
          const domainColor = getDomainColor(category.domain); // Assuming this returns a HEX or generic color name.

          const minCredits = status?.minConditionCredits ?? 0;
          const totalCredits = status?.totalCredits ?? 0;
          const percentage =
            minCredits > 0 ? Math.min(100, Math.round((totalCredits * 100) / minCredits)) : 0;

          const messages = status?.messages ?? [];
          const hasMessages = messages.length > 0;

          // 우선순위 1순위: 첫 번째 메시지
          const primaryMessage = hasMessages ? messages[0] : null;
          const secondaryMessages = hasMessages ? messages.slice(1) : [];

          let badgeVariant = "outline";
          let badgeClass = "";
          if (statusType === 'satisfied') {
            badgeClass = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300";
          } else if (statusType === 'unSatisfied') {
            badgeClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
          } else {
            badgeClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
          }

          // Progress color handling might need custom style or CSS variable override if domainColor is HEX
          // Shadcn Progress uses bg-primary. 
          // We can use style={{ backgroundColor: domainColor }} on the Indicator if we expose it, but shadcn component encapsulates it.
          // For now, let's just use default color or apply a class if domainColor maps to one.
          // If domainColor is HEX, we can't easily pass it to className.
          // I will assume default styling for now to keep it simple, or add inline style to Progress component if needed.
          // Customizing Progress component to accept indicatorColor would be better, but I'll stick to standard for now or minimal hack.

          return (
            <TabsContent key={category.domain} value={category.domain} className="mt-4 space-y-4">
              {/* 상단 요약 영역 */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg sm:text-lg">
                      {category.domain}
                    </span>
                    <Badge variant={badgeVariant as any} className={badgeClass}>
                      {statusType === 'satisfied'
                        ? '충족됨'
                        : statusType === 'unSatisfied'
                          ? '부족'
                          : '선택 사항'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {minCredits > 0
                        ? `${minCredits}학점 필요 중 ${totalCredits}학점 이수`
                        : `총 ${totalCredits}학점 이수`}
                    </span>
                    {minCredits > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {percentage}% 진행
                      </Badge>
                    )}
                  </div>
                </div>

                {minCredits > 0 && (
                  <div className="flex flex-col items-end w-full sm:w-auto">
                    <span className="text-xs text-muted-foreground mb-1 text-right">
                      이수 진행률
                    </span>
                    <div className="flex items-center gap-2 w-full sm:w-[200px]">
                      <Progress value={percentage} className="h-4" />
                      <span className="text-sm font-medium w-9 text-right">{percentage}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-border my-4" />

              {/* 피드백 / 추천 영역 */}
              <div className="space-y-3">
                {/* 1) 전체 상태 요약 메시지 */}
                {statusType === 'satisfied' && (
                  <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-300">
                    <IconCircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="ml-2 font-medium">
                      모든 요건을 충족했습니다! 🎉 이 영역은 더 이상 신경 쓰지 않아도 괜찮아요.
                    </AlertDescription>
                  </Alert>
                )}

                {statusType === 'notRequired' && (
                  <Alert className="bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/10 dark:text-blue-300">
                    <IconAlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="ml-2 font-medium">
                      부전공 등 선택 영역입니다. 관심이 있다면 해당 영역의 과목을 추가로 이수해 보세요.
                    </AlertDescription>
                  </Alert>
                )}

                {statusType === 'unSatisfied' && !hasMessages && (
                  <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 dark:text-red-300">
                    <IconAlertTriangle className="h-4 w-4" />
                    <AlertDescription className="ml-2 font-medium">
                      아직 이 영역의 졸업요건을 충족하지 못했습니다. 아래 요건을 다시 확인해 주세요.
                    </AlertDescription>
                  </Alert>
                )}

                {/* 2) 우선순위 추천 (맨 앞 메세지 하나 강조) */}
                {primaryMessage && statusType === 'unSatisfied' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-md p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-700 dark:text-yellow-400">
                        <IconTargetArrow size="1.2rem" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base mb-1 text-yellow-900 dark:text-yellow-100">
                          지금 가장 먼저 할 일
                        </div>
                        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">{primaryMessage}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3) 나머지 추천/피드백 리스트 */}
                {secondaryMessages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                        <IconListCheck size="1rem" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">추가로 이런 것들을 확인해보세요</span>
                    </div>
                    <ScrollArea className="h-[180px] rounded-md border p-2">
                      <div className="space-y-2">
                        {secondaryMessages.map((msg, idx) => (
                          <div
                            key={`${category.domain}-${idx}`}
                            className="flex items-start gap-2 text-sm sm:text-base"
                          >
                            <span className="font-bold text-gray-500 w-6 text-right shrink-0">
                              {idx + 2}.
                            </span>
                            <span>{msg}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* 메시지가 아예 없는 경우 */}
                {!hasMessages && statusType !== 'satisfied' && statusType !== 'notRequired' && (
                  <span className="text-sm text-muted-foreground block text-center py-4">
                    이 영역에 대한 상세 피드백이 아직 없습니다. 학사편람과 졸업요건 표를 함께 확인해
                    주세요.
                  </span>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
