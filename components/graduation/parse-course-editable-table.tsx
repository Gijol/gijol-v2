import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { ScrollArea } from '@components/ui/scroll-area';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Button } from '@components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { EditableCourseRow } from '@lib/types/graduation-editable';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';

type Props = {
  rows: EditableCourseRow[];
  onChangeRow: (id: string, patch: Partial<EditableCourseRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
};

const SEMESTER_OPTIONS = [
  { value: '1학기', label: '1학기' },
  { value: '2학기', label: '2학기' },
  { value: '여름학기', label: '여름학기' },
  { value: '겨울학기', label: '겨울학기' },
];

export function ParsedCourseEditableTable({ rows, onChangeRow, onAddRow, onRemoveRow }: Props) {
  return (
    <Card className="border-slate-300 p-0">
      <CardHeader className="border-b border-slate-300 p-4">
        <CardTitle className="text-base font-medium">수강 목록</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[420px] p-4">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow>
              <TableHead className="w-[90px]">연도</TableHead>
              <TableHead className="w-[80px]">학기</TableHead>
              <TableHead className="w-[80px]">구분</TableHead>
              <TableHead className="w-[90px]">과목코드</TableHead>
              <TableHead>과목명</TableHead>
              <TableHead className="w-[80px]">학점</TableHead>
              <TableHead className="w-[80px]">성적</TableHead>
              <TableHead className="w-[50px]">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="p-2">
                  <Input
                    type="number"
                    value={row.year}
                    onChange={(e) => onChangeRow(row.id, { year: Number(e.target.value) || 0 })}
                    placeholder="연도"
                    min={2000}
                    max={2100}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Select value={row.semester} onValueChange={(v) => onChangeRow(row.id, { semester: v })}>
                    <SelectTrigger className="h-8 w-full text-xs">
                      <SelectValue placeholder="학기" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    value={row.courseType}
                    onChange={(e) => onChangeRow(row.id, { courseType: e.currentTarget.value })}
                    placeholder="전공/교양"
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    value={row.courseCode}
                    onChange={(e) => onChangeRow(row.id, { courseCode: e.currentTarget.value })}
                    placeholder="예: CS101"
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    value={row.courseName}
                    onChange={(e) => onChangeRow(row.id, { courseName: e.currentTarget.value })}
                    placeholder="과목명"
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    type="number"
                    value={row.credit}
                    onChange={(e) => onChangeRow(row.id, { credit: Number(e.target.value) || 0 })}
                    placeholder="학점"
                    min={0}
                    max={10}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    value={row.grade ?? ''}
                    onChange={(e) => onChangeRow(row.id, { grade: e.currentTarget.value })}
                    placeholder="성적"
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onRemoveRow(row.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </ScrollArea>

      <div className="flex justify-end p-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onAddRow} variant="outline" size="icon" className="h-9 w-9">
              <Plus size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>행 추가하기 (하단에 추가됨)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
}
