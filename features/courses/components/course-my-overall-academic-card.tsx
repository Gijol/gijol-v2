import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { convertGradeTo4Scale } from '@utils/status';

export default function OverallAcademicCard({
  totalCredit,
  totalRequired,
  averageGrade,
  progress,
}: {
  totalCredit: number;
  totalRequired: number;
  averageGrade: number | null;
  progress: number; // 0~100
}) {
  return (
    <Card className="h-full border-slate-300 p-0 shadow-none">
      <CardHeader className="border-b border-slate-300 p-4">
        <CardTitle className="text-base font-medium">학업 현황</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col p-4">
        {/* 두 개의 핵심 지표를 나란히 배치 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 이수 학점 */}
          <div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-foreground text-3xl font-bold">{totalCredit}</span>
              <span className="text-muted-foreground text-lg">/ {totalRequired}</span>
            </div>
            <div className="text-muted-foreground text-center text-xs">이수 학점</div>
          </div>

          {/* 평균 학점 */}
          <div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-foreground text-3xl font-bold">{averageGrade ?? '-'}</span>
              <span className="text-muted-foreground text-lg">/ 4.5</span>
            </div>
            <div className="text-muted-foreground mt-1 text-center text-xs">평균 학점</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-300 p-4">
        {/* GPA 환산 */}
        {averageGrade != null && (
          <>
            <span className="text-muted-foreground mr-2 text-sm">
              GPA 4.0 환산:{' '}
              <span className="text-foreground font-medium">{convertGradeTo4Scale(averageGrade, 4.5)}</span>
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-secondary hover:bg-secondary/80 cursor-help rounded-full p-0.5 transition-colors">
                    <HelpCircle className="text-muted-foreground h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>정확하지 않으므로 참고용으로만 사용해주세요!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
