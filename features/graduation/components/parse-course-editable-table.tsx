import React from 'react';
import { Card, CardHeader, CardTitle } from '@components/ui/card';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Button } from '@components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { EditableCourseRow } from '@lib/types/graduation-editable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Label } from '@components/ui/label';

type Props = {
  rows: EditableCourseRow[];
  onChangeRow: (id: string, patch: Partial<EditableCourseRow>) => void;
  onAddRow: (row: Omit<EditableCourseRow, 'id'>) => void;
  onRemoveRow: (id: string) => void;
};

const SEMESTER_OPTIONS = [
  { value: '1', label: '1학기' },
  { value: '여름학기', label: '여름' },
  { value: '2', label: '2학기' },
  { value: '겨울학기', label: '겨울' },
];

const COURSE_TYPE_OPTIONS = [
  { value: 'M', label: '필수', code: 'M' },
  { value: 'E', label: '선택', code: 'E' },
  { value: 'HUS', label: '인문', code: 'HUS' },
  { value: 'PPE', label: '사회', code: 'PPE' },
  { value: 'GSC', label: '융합', code: 'GSC' },
  { value: '전공', label: '전공' },
  { value: '전공선택', label: '전공 선택' },
  { value: '교양', label: '교양' },
  { value: '기타', label: '기타' },
];

const EMPTY_COURSE_ROW: Omit<EditableCourseRow, 'id'> = {
  year: '',
  semester: '1',
  courseType: 'E',
  courseCode: '',
  courseName: '',
  credit: '',
  grade: '',
};

function semesterRank(semester: string): number {
  const normalized = String(semester).trim();
  if (normalized === '1' || normalized === '1학기' || normalized === '봄') return 1;
  if (normalized === '여름' || normalized === '여름학기') return 2;
  if (normalized === '2' || normalized === '2학기' || normalized === '가을') return 3;
  if (normalized === '겨울' || normalized === '겨울학기') return 4;
  return 99;
}

function normalizeSemesterValue(semester: string): string {
  const normalized = String(semester).trim();
  if (normalized === '1학기' || normalized === '봄') return '1';
  if (normalized === '2학기' || normalized === '가을') return '2';
  if (normalized === '여름') return '여름학기';
  if (normalized === '겨울') return '겨울학기';
  return normalized;
}

function getSemesterLabel(semester: string): string {
  const normalized = normalizeSemesterValue(semester);
  return SEMESTER_OPTIONS.find((option) => option.value === normalized)?.label ?? normalized;
}

function normalizeCourseTypeValue(courseType: string): string {
  const normalized = String(courseType).trim();
  if (COURSE_TYPE_OPTIONS.some((option) => option.value === normalized)) return normalized;
  return '기타';
}

function getCourseTypeOption(courseType: string) {
  return (
    COURSE_TYPE_OPTIONS.find((option) => option.value === normalizeCourseTypeValue(courseType)) ??
    COURSE_TYPE_OPTIONS.find((option) => option.value === '기타')!
  );
}

function CourseTypeOptionLabel({ value }: { value: string }) {
  const option = getCourseTypeOption(value);

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate">{option.label}</span>
      {option.code ? (
        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] leading-none font-semibold text-slate-500">
          {option.code}
        </span>
      ) : null}
    </span>
  );
}

function compareCourseRows(a: EditableCourseRow, b: EditableCourseRow): number {
  const yearA = a.year === '' ? Number.MAX_SAFE_INTEGER : Number(a.year);
  const yearB = b.year === '' ? Number.MAX_SAFE_INTEGER : Number(b.year);
  if (yearA !== yearB) return yearA - yearB;

  const semesterDiff = semesterRank(a.semester) - semesterRank(b.semester);
  if (semesterDiff !== 0) return semesterDiff;

  return a.courseCode.localeCompare(b.courseCode);
}

type SemesterCourseGroup = {
  key: string;
  label: string;
  rows: EditableCourseRow[];
  totalCredits: number;
};

function getCreditValue(row: EditableCourseRow): number {
  return row.credit === '' ? 0 : Number(row.credit) || 0;
}

function groupRowsBySemester(rows: EditableCourseRow[]): SemesterCourseGroup[] {
  return rows.reduce<SemesterCourseGroup[]>((groups, row) => {
    const year = row.year === '' ? '연도 미상' : `${row.year}년`;
    const semester = getSemesterLabel(row.semester) || '학기 미상';
    const key = `${year}-${semester}`;
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.key === key) {
      lastGroup.rows.push(row);
      lastGroup.totalCredits += getCreditValue(row);
      return groups;
    }

    groups.push({
      key,
      label: `${year} ${semester}`,
      rows: [row],
      totalCredits: getCreditValue(row),
    });
    return groups;
  }, []);
}

export function ParsedCourseEditableTable({ rows, onChangeRow, onAddRow, onRemoveRow }: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [draftRow, setDraftRow] = React.useState<Omit<EditableCourseRow, 'id'>>(EMPTY_COURSE_ROW);

  const sortedRows = React.useMemo(() => [...rows].sort(compareCourseRows), [rows]);
  const semesterGroups = React.useMemo(() => groupRowsBySemester(sortedRows), [sortedRows]);

  const updateDraftRow = (patch: Partial<Omit<EditableCourseRow, 'id'>>) => {
    setDraftRow((current) => ({ ...current, ...patch }));
  };

  const canAddDraftRow =
    draftRow.year !== '' &&
    draftRow.credit !== '' &&
    draftRow.courseCode.trim().length > 0 &&
    draftRow.courseName.trim().length > 0;

  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setDraftRow(EMPTY_COURSE_ROW);
    }
  };

  const handleAddDraftRow = () => {
    if (!canAddDraftRow) return;

    onAddRow({
      ...draftRow,
      courseCode: draftRow.courseCode.trim().toUpperCase(),
      courseName: draftRow.courseName.trim(),
      grade: draftRow.grade?.trim().toUpperCase() ?? '',
    });
    handleAddDialogOpenChange(false);
  };

  return (
    <Card className="gap-0 overflow-hidden border-slate-300 p-0">
      <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpenChange}>
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="text-base font-semibold">수강 목록</CardTitle>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {sortedRows.length}과목
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 px-3 text-xs"
            onClick={() => handleAddDialogOpenChange(true)}
          >
            <Plus size={14} />
            과목 추가
          </Button>
        </CardHeader>

        <div className="max-h-[360px] overflow-auto">
          <table className="w-full min-w-[820px] caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-900/95">
              <TableRow>
                <TableHead className="h-9 w-[90px] px-2 text-xs font-semibold">연도</TableHead>
                <TableHead className="h-9 w-[92px] px-2 text-xs font-semibold">학기</TableHead>
                <TableHead className="h-9 w-[96px] px-2 text-xs font-semibold">구분</TableHead>
                <TableHead className="h-9 w-[112px] px-2 text-xs font-semibold">과목코드</TableHead>
                <TableHead className="h-9 min-w-[260px] px-2 text-xs font-semibold">과목명</TableHead>
                <TableHead className="h-9 w-[74px] px-2 text-xs font-semibold">학점</TableHead>
                <TableHead className="h-9 w-[74px] px-2 text-xs font-semibold">성적</TableHead>
                <TableHead className="h-9 w-[48px] px-2 text-center text-xs font-semibold">삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesterGroups.map((group) => (
                <React.Fragment key={group.key}>
                  <TableRow className="border-y border-slate-200 bg-slate-100/80 hover:bg-slate-100/80 dark:bg-slate-900/80 dark:hover:bg-slate-900/80">
                    <TableCell colSpan={8} className="h-8 px-3 py-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{group.label}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                          {group.rows.length}과목
                        </span>
                        <span className="text-slate-500">{group.totalCredits}학점</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                      <TableCell className="p-1.5">
                        <Input
                          type="number"
                          value={row.year}
                          onChange={(e) => onChangeRow(row.id, { year: Number(e.target.value) || 0 })}
                          placeholder="연도"
                          min={2000}
                          max={2100}
                          className="h-8 min-w-[68px] px-2 text-xs tabular-nums"
                        />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Select
                          value={normalizeSemesterValue(row.semester)}
                          onValueChange={(v) => onChangeRow(row.id, { semester: v })}
                        >
                          <SelectTrigger className="h-8 w-full px-2 text-xs">
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
                      <TableCell className="p-1.5">
                        <Select
                          value={normalizeCourseTypeValue(row.courseType)}
                          onValueChange={(v) => onChangeRow(row.id, { courseType: v })}
                        >
                          <SelectTrigger className="h-8 w-full px-2 text-xs">
                            <SelectValue placeholder="구분" />
                          </SelectTrigger>
                          <SelectContent>
                            {COURSE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                textValue={opt.code ? `${opt.label} ${opt.code}` : opt.label}
                              >
                                <CourseTypeOptionLabel value={opt.value} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input
                          value={row.courseCode}
                          onChange={(e) => onChangeRow(row.id, { courseCode: e.currentTarget.value })}
                          placeholder="코드"
                          className="h-8 px-2 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input
                          value={row.courseName}
                          onChange={(e) => onChangeRow(row.id, { courseName: e.currentTarget.value })}
                          placeholder="과목명"
                          className="h-8 px-2 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input
                          type="number"
                          value={row.credit}
                          onChange={(e) => onChangeRow(row.id, { credit: Number(e.target.value) || 0 })}
                          placeholder="학점"
                          min={0}
                          max={10}
                          className="h-8 px-2 text-xs tabular-nums"
                        />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input
                          value={row.grade ?? ''}
                          onChange={(e) => onChangeRow(row.id, { grade: e.currentTarget.value })}
                          placeholder="성적"
                          className="h-8 px-2 text-xs tabular-nums"
                        />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => onRemoveRow(row.id)}
                            aria-label={`${row.courseCode || row.courseName || '수강 이력'} 삭제`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </table>
        </div>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>수강 이력 추가</DialogTitle>
            <DialogDescription>새 수강 이력을 입력한 뒤 추가를 누르면 목록에 반영됩니다.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-course-year">연도</Label>
              <Input
                id="new-course-year"
                type="number"
                value={draftRow.year}
                onChange={(e) => updateDraftRow({ year: e.target.value ? Number(e.target.value) : '' })}
                min={2000}
                max={2100}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>학기</Label>
              <Select value={draftRow.semester} onValueChange={(v) => updateDraftRow({ semester: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>구분</Label>
              <Select value={draftRow.courseType} onValueChange={(v) => updateDraftRow({ courseType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      textValue={opt.code ? `${opt.label} ${opt.code}` : opt.label}
                    >
                      <CourseTypeOptionLabel value={opt.value} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-course-code">과목코드</Label>
              <Input
                id="new-course-code"
                value={draftRow.courseCode}
                onChange={(e) => updateDraftRow({ courseCode: e.currentTarget.value })}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="new-course-name">과목명</Label>
              <Input
                id="new-course-name"
                value={draftRow.courseName}
                onChange={(e) => updateDraftRow({ courseName: e.currentTarget.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-course-credit">학점</Label>
              <Input
                id="new-course-credit"
                type="number"
                value={draftRow.credit}
                onChange={(e) => updateDraftRow({ credit: e.target.value ? Number(e.target.value) : '' })}
                min={0}
                max={10}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-course-grade">성적</Label>
              <Input
                id="new-course-grade"
                value={draftRow.grade ?? ''}
                onChange={(e) => updateDraftRow({ grade: e.currentTarget.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleAddDialogOpenChange(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleAddDraftRow} disabled={!canAddDraftRow}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
