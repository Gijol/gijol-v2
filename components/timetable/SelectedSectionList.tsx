import React from 'react';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SelectedSectionListProps {
  hideResetButton?: boolean;
}

export function SelectedSectionList({ hideResetButton = false }: SelectedSectionListProps) {
  const selectedSections = useTimetableStore((state) => state.selectedSections);
  const removeSection = useTimetableStore((state) => state.removeSection);
  const setPreview = useTimetableStore((state) => state.setPreview);
  const clearPreview = useTimetableStore((state) => state.clearPreview);

  const totalCredits = selectedSections.reduce((sum, s) => sum + s.section.hours.credits, 0);

  if (selectedSections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-black tracking-tight text-slate-400 uppercase">선택된 강의가 없습니다</p>
        <p className="mt-1 text-xs font-bold text-slate-300 uppercase">강의 목록에서 추가해 보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <Badge
            variant="secondary"
            className="border-none bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-600 uppercase hover:bg-blue-50"
          >
            {selectedSections.length}개 과목 선택됨
          </Badge>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] leading-none font-black text-slate-400 uppercase">총 이수 학점</span>
          <span className="text-2xl leading-tight font-black text-blue-600">
            {totalCredits}
            <span className="ml-0.5 text-sm">학점</span>
          </span>
        </div>
      </div>

      <ScrollArea className="h-auto max-h-[300px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 text-[11px] font-black text-slate-500">과목명</TableHead>
              <TableHead className="h-10 w-[100px] text-[11px] font-black text-slate-500">과목코드</TableHead>
              <TableHead className="h-10 w-[60px] text-center text-[11px] font-black text-slate-500">학점</TableHead>
              <TableHead className="h-10 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedSections.map(({ id, section, color }) => (
              <TableRow
                key={id}
                className="cursor-default transition-colors hover:bg-slate-50"
                onMouseEnter={() => setPreview(section)}
                onMouseLeave={clearPreview}
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="truncate text-sm font-bold text-slate-900">{section.title}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">
                    {section.course_code}-{section.section}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-center">
                  <span className="font-bold text-slate-600">{section.hours.credits}</span>
                </TableCell>
                <TableCell className="py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(id)}
                    className="h-7 w-7 rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove section"
                  >
                    <X size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
