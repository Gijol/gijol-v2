import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Progress } from '@components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Zap, BarChart3, FileBarChart } from 'lucide-react';
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
      <TableCell className="font-medium">{element.title}</TableCell>
      <TableCell className="min-w-[220px] py-2 align-middle">
        <div className="flex items-center gap-2">
          <Progress value={element.percentage} className="h-4 w-full" />
          <span className="w-10 text-right text-sm font-medium">{element.percentage}%</span>
        </div>
      </TableCell>
      <TableCell className="align-middle whitespace-nowrap">
        {getStatusMessage(element.satisfied, element.title)}
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* 총 학점 카드 */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학점</CardTitle>
            <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
              <BarChart3 size={20} className="text-gray-900 dark:text-gray-100" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-auto flex-col justify-between gap-4">
              <div className="text-2xl font-bold">
                {totalCredits ?? 0} <span className="text-base font-normal">학점</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">기준 학점 : 130</span>
                <Badge variant="outline">{totalPercentage}% 이수중</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 최저 이수 영역 카드 */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최저 이수 영역</CardTitle>
            <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
              <FileBarChart size={20} className="text-gray-900 dark:text-gray-100" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="pt-1 pb-1 text-2xl font-bold">{minDomain}</div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground mb-1 text-xs">이 영역을 우선적으로 채우는 것이 좋아요.</span>
                <Badge
                  className="border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-200"
                  variant="outline"
                >
                  {minDomainPercentage}% 이수중
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 피드백 카드 */}
        <div className="flex flex-col justify-between rounded-xl border-2 border-orange-400 bg-white p-4 shadow-[0_0_16px_2px_rgba(255,165,0,0.2)] dark:bg-gray-950">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h4 className="text-sm font-semibold">Gijol의 피드백</h4>
              <Zap className="fill-current text-yellow-400" />
            </div>
            <div className="pb-2 text-2xl font-bold">
              {feedbackNumbers} <span className="text-base font-normal">개</span>
            </div>
            <p className="text-muted-foreground mb-4 text-xs">부족한 영역을 중심으로 정리된 추천 사항이에요.</p>
          </div>
          <Button
            className="w-full animate-pulse border-0 bg-gradient-to-r from-yellow-400 to-orange-500 font-bold text-white hover:from-yellow-500 hover:to-orange-600"
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
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="min-w-[100px]">영역</TableHead>
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
