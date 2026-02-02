// features/roadmap/CourseEditSheet.tsx
import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { CourseNodeData } from '@/lib/types/roadmap';

interface CourseEditSheetProps {
  course: CourseNodeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, newData: CourseNodeData) => void;
}

const CATEGORIES = [
  '기초필수',
  '기초선택',
  '전공필수',
  '전공선택',
  'MOOC',
  '타전공1',
  '타전공2',
  '편성예정',
];

export function CourseEditSheet({ course, open, onOpenChange, onSave }: CourseEditSheetProps) {
  const [formData, setFormData] = useState<Partial<CourseNodeData>>({});

  useEffect(() => {
    if (course) {
      setFormData({
        label: course.label,
        courseCode: course.courseCode,
        credits: course.credits,
        category: course.category,
        semester: course.semester,
      });
    }
  }, [course]);

  const handleChange = (field: keyof CourseNodeData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (course && formData.label && formData.courseCode) {
      onSave(course.courseCode || '', {
        ...course,
        ...formData,
      } as CourseNodeData);
      onOpenChange(false);
    }
  };

  if (!course) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>과목 정보 수정</SheetTitle>
          <SheetDescription>로드맵 노드의 정보를 수정합니다.</SheetDescription>
        </SheetHeader>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="label">과목명</Label>
            <Input id="label" value={formData.label || ''} onChange={(e) => handleChange('label', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="courseCode">학수번호</Label>
              <Input
                id="courseCode"
                value={formData.courseCode || ''}
                onChange={(e) => handleChange('courseCode', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credits">학점</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits || 0}
                onChange={(e) => handleChange('credits', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">이수구분</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="구분 선택" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="semester">권장학기</Label>
              <Input
                id="semester"
                value={formData.semester || ''}
                onChange={(e) => handleChange('semester', e.target.value)}
                placeholder="예: 1-1"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>저장하기</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
