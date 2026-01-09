import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Badge } from '@components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { ScrollArea } from '@components/ui/scroll-area';
import { RingProgress } from '@components/ui/ring-progress';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { SingleCategoryType } from '../lib/types/grad';
import { createSpecificStatusMessage, getDomainColor } from '@utils/graduation/grad-formatter';
import { cn } from '@/lib/utils';

export default function GradSpecificDomainStatus({
  specificDomainStatusArr,
}: {
  specificDomainStatusArr: { domain: string; status: SingleCategoryType | undefined }[];
}) {

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {specificDomainStatusArr.map((category) => {
          const domainName = category.domain;
          const { minConditionCredits, totalCredits, satisfied, messages } =
            category.status as SingleCategoryType;
          const temp = Math.round((totalCredits * 100) / minConditionCredits);
          const percentage = totalCredits === 0 ? 0 : temp >= 100 ? 100 : temp;

          const elements = category.status?.userTakenCoursesList.takenCourses;
          const rows = elements?.map((element) => {
            return (
              <TableRow key={`${category.domain} ${element.semester} ${element.courseName}`}>
                <TableCell className="min-w-[120px]">
                  {element.year} {element.semester}
                </TableCell>
                <TableCell className="min-w-[100px]">{element.courseCode}</TableCell>
                <TableCell className="min-w-[220px]">
                  <div className="flex items-center gap-2">
                    {element.courseName}{' '}
                    {element.courseType && <Badge variant="outline" className="text-xs">{element.courseType}</Badge>}
                  </div>
                </TableCell>
                <TableCell>{element.credit}</TableCell>
              </TableRow>
            );
          });

          const domainColor = getDomainColor(domainName);
          // Badge color logic
          const badgeClass = satisfied
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200"
            : category.domain === '부전공'
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200";

          return (
            <AccordionItem
              key={`${category.domain} ${category.status?.satisfied}`}
              value={domainName}
              className="border rounded-md px-2 bg-white dark:bg-slate-950"
            >
              <AccordionTrigger className="hover:no-underline px-2 sm:px-4">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-md sm:text-xl font-medium">
                      {domainName}
                    </span>
                    <Badge variant="outline" className={cn("text-xs sm:text-sm font-normal py-1", badgeClass)}>
                      {minConditionCredits}학점 중 {totalCredits}학점
                    </Badge>
                  </div>
                  <div className="relative">
                    <RingProgress
                      size={64} // Fixed size for consistency, responsiveness handled by scaling if needed
                      thickness={4}
                      value={percentage}
                      color={domainColor} // Assuming string color works, or use a map
                      label={<span className="text-xs sm:text-sm font-bold">{percentage}</span>}
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 sm:px-4 pb-4">
                <div className="mb-10 w-full min-w-[200px]">
                  <h3 className="text-md sm:text-lg font-bold mb-4">요구사항</h3>
                  <ScrollArea className="h-fit max-h-[300px]">
                    <div className="space-y-2">
                      {satisfied && (
                        <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-300 dark:border-green-900/50">
                          <IconCircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <AlertDescription className="ml-2 font-medium">
                            모든 요건들을 충족했습니다! ✨
                          </AlertDescription>
                        </Alert>
                      )}
                      {!satisfied &&
                        messages.map((message) => {
                          return (
                            <Alert
                              key={`${message.length} ${message}`}
                              variant="destructive"
                              className="bg-red-50 dark:bg-red-900/10 dark:text-red-300"
                            >
                              <IconAlertCircle className="h-4 w-4" />
                              <AlertDescription className="ml-2 font-medium">
                                {message}
                              </AlertDescription>
                            </Alert>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="text-md sm:text-lg font-bold mb-4">수강한 강의 목록</h3>
                  <div className="border rounded-md overflow-hidden">
                    <ScrollArea className="w-full">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-900">
                            <TableHead className="min-w-[120px]">수강학기</TableHead>
                            <TableHead className="min-w-[100px]">강의코드</TableHead>
                            <TableHead className="min-w-[220px]">강의명</TableHead>
                            <TableHead>학점</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows && rows.length > 0 ? rows : (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                수강하신 강의가 없습니다!
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={3} className="font-bold text-right">합계</TableCell>
                            <TableCell className="font-bold min-w-[80px]">{totalCredits} 학점</TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
}
