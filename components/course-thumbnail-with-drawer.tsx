import React, { useState } from 'react';
import { useSingleCourse } from '@hooks/course';
import { getCourseTagColor } from '@utils/course/tag-color';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@components/ui/sheet';
import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import {
  Card,
  CardContent,
  CardTitle,
} from '@components/ui/card';
import { cn } from "@/lib/utils";

export default function CourseThumbnailWithDrawer({
  id,
  code,
  title,
  credit,
  tags,
  description,
  prerequisites,
}: {
  id: number;
  code: string;
  title: string;
  credit: number;
  description: string | null;
  prerequisites: string;
  tags?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // mutation for history
  const { data: single_course, isLoading: isCourseHistoryDataLoading, mutate } = useSingleCourse();

  const handleOpen = () => {
    mutate(id);
    setOpen(true);
  };

  const tagContent = tags?.map((tag) => {
    const color = getCourseTagColor(tag);
    // Custom logic to map Mantine colors to Tailwind/CSS variables could go here.
    // For now, we use a default badge style with inline style for specific colors if critical,
    // or just rely on 'variant="secondary"' for a clean look.
    // Using inline style for border color to mimic previous behavior if needed, or simplifed.
    return (
      <Badge
        key={tag}
        variant="secondary"
        className="font-medium"
      >
        {tag}
      </Badge>
    );
  });

  const none = ['none', 'NONE', 'None', '-', '', ' '];

  const rows = single_course?.courseHistoryResponses.map((element, idx) => (
    <TableRow key={idx}>
      <TableCell>{element.year}</TableCell>
      <TableCell>{element.semester}</TableCell>
      <TableCell>{element.courseProfessor}</TableCell>
      <TableCell>{element.courseTime}</TableCell>
      <TableCell>{element.courseRoom}</TableCell>
    </TableRow>
  ));

  return (
    <>
      <Card
        onClick={handleOpen}
        className="w-full h-full cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-slate-950"
      >
        <CardContent className="flex flex-col justify-between h-full p-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">{code}</p>
            <CardTitle className="text-xl font-medium w-fit">{title}</CardTitle>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-2 mt-6">
            <div className="flex gap-2 flex-wrap">{tagContent}</div>
            <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
              {credit}학점
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6 space-y-4">
            <div className="space-y-1">
              <SheetDescription className="text-base">{code}</SheetDescription>
              <SheetTitle className="text-3xl font-bold">{title}</SheetTitle>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tags?.map((t) => (
                <Badge key={t} variant="secondary" className="text-sm px-3 py-1">
                  {t}
                </Badge>
              ))}
              <Badge variant="outline" className="text-sm px-3 py-1">
                {credit}학점
              </Badge>
            </div>
          </SheetHeader>

          <div className="py-4 space-y-8">
            <div>
              <p className="text-sm font-medium mb-1">선 이수과목</p>
              {none.includes(prerequisites) ? (
                <span className="text-gray-500">없습니다! 😆</span>
              ) : (
                <code className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded text-sm font-mono">
                  {prerequisites}
                </code>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">강의소개</h3>
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-slate-900">
                <div className={cn("relative overflow-hidden transition-all duration-300", isExpanded ? "max-h-full" : "max-h-[120px]")}>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {description || "아직 데이터가 없습니다... 😓"}
                  </p>
                  {!isExpanded && description && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-slate-900 to-transparent" />
                  )}
                </div>
                {description && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none"
                  >
                    {isExpanded ? '접기' : '더보기'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">강의 히스토리</h3>
              {isCourseHistoryDataLoading ? (
                <Skeleton className="h-[300px] w-full rounded-md" />
              ) : (
                <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>연도</TableHead>
                        <TableHead>학기</TableHead>
                        <TableHead>교수명</TableHead>
                        <TableHead>강의 시간대</TableHead>
                        <TableHead>강의실</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{rows}</TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
