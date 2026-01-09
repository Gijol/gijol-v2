import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Progress } from '@components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { IconBolt, IconPresentationAnalytics, IconReportAnalytics } from '@tabler/icons-react';
import { getStatusMessage } from '@utils/graduation/grad-formatter';
import React from 'react';

type OverallDomain = {
  title: string;
  percentage: number;
  satisfied: boolean | undefined;
};

type Props = {
  scrollIntoView: (options?: any) => void;
  totalCredits: number | undefined;
  totalPercentage: number;
  overallStatus: OverallDomain[];
  minDomain: string;
  minDomainPercentage: number;
  feedbackNumbers: number;
};

export default function GradOverallStatus({
  scrollIntoView,
  totalCredits,
  totalPercentage,
  overallStatus,
  minDomain,
  minDomainPercentage,
  feedbackNumbers,
}: Props) {

  const courseRows = overallStatus.map((element) => (
    <TableRow key={element.title}>
      <TableCell className="font-medium">
        {element.title}
      </TableCell>
      <TableCell className="min-w-[220px] py-2 align-middle">
        <div className="flex items-center gap-2">
          <Progress
            value={element.percentage}
            className="h-4 w-full"
          />
          <span className="text-sm font-medium w-10 text-right">{element.percentage}%</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap align-middle">
        {getStatusMessage(element.satisfied, element.title)}
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* 총 학점 카드 */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              총 학점
            </CardTitle>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <IconPresentationAnalytics size={20} className="text-gray-900 dark:text-gray-100" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-between h-auto gap-4">
              <div className="text-2xl font-bold">
                {totalCredits ?? 0} <span className="text-base font-normal">학점</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  기준 학점 : 130
                </span>
                <Badge variant="outline">{totalPercentage}% 이수중</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 최저 이수 영역 카드 */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              최저 이수 영역
            </CardTitle>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <IconReportAnalytics size={20} className="text-gray-900 dark:text-gray-100" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="text-2xl font-bold pt-1 pb-1">
                {minDomain}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground mb-1">
                  이 영역을 우선적으로 채우는 것이 좋아요.
                </span>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200" variant="outline">
                  {minDomainPercentage}% 이수중
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 피드백 카드 */}
        <div className="rounded-xl border-2 border-orange-400 bg-white dark:bg-gray-950 p-4 shadow-[0_0_16px_2px_rgba(255,165,0,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-semibold">
                Gijol의 피드백
              </h4>
              <IconBolt className="text-yellow-400 fill-current" />
            </div>
            <div className="text-2xl font-bold pb-2">
              {feedbackNumbers} <span className="text-base font-normal">개</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              부족한 영역을 중심으로 정리된 추천 사항이에요.
            </p>
          </div>
          <Button
            className="w-full font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 animate-pulse"
            size="sm"
            onClick={() =>
              scrollIntoView({
                alignment: 'center',
              })
            }
          >
            추천 / 피드백 보러가기
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="min-w-[100px]">
                  영역
                </TableHead>
                <TableHead>충족도</TableHead>
                <TableHead>충족 여부</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{courseRows}</TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
