import React, { useState } from 'react';
import { useSingleCourse } from '@hooks/course';
import { getCourseTagColor } from '@utils/course/tag-color';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@components/ui/sheet';
import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Card, CardContent, CardTitle } from '@components/ui/card';
import { cn } from '@/lib/utils';

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
      <Badge key={tag} variant="secondary" className="font-medium">
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
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpen();
          }
        }}
        role="button"
        tabIndex={0}
        className="h-full w-full cursor-pointer border-slate-200 bg-white transition-[background-color,border-color] duration-150 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900"
      >
        <CardContent className="flex h-full flex-col justify-between p-4">
          <div>
            <p className="mb-2 text-sm text-gray-500">{code}</p>
            <CardTitle className="w-fit text-xl font-medium">{title}</CardTitle>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">{tagContent}</div>
            <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
              {credit}학점
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="mb-6 space-y-4">
            <div className="space-y-1">
              <SheetDescription className="text-base">{code}</SheetDescription>
              <SheetTitle className="text-3xl font-bold">{title}</SheetTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags?.map((t) => (
                <Badge key={t} variant="secondary" className="px-3 py-1 text-sm">
                  {t}
                </Badge>
              ))}
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {credit}학점
              </Badge>
            </div>
          </SheetHeader>

          <div className="space-y-8 py-4">
            <div>
              <p className="mb-1 text-sm font-medium">선 이수과목</p>
              {none.includes(prerequisites) ? (
                <span className="text-gray-500">없습니다! 😆</span>
              ) : (
                <code className="rounded bg-blue-50 px-2 py-1 font-mono text-sm text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {prerequisites}
                </code>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">강의소개</h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-slate-900">
                <div className={cn('relative overflow-hidden', isExpanded ? 'max-h-full' : 'max-h-[120px]')}>
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {description || '아직 등록된 강의 소개가 없습니다.'}
                  </p>
                  {!isExpanded && description && (
                    <div className="absolute right-0 bottom-0 left-0 h-16 bg-linear-to-t from-gray-50 to-transparent dark:from-slate-900" />
                  )}
                </div>
                {description && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 rounded-sm text-sm font-medium text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-blue-400"
                  >
                    {isExpanded ? '접기' : '더보기'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">강의 히스토리</h3>
              {isCourseHistoryDataLoading ? (
                <Skeleton className="h-[300px] w-full rounded-md" />
              ) : (
                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
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
