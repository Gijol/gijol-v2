// features/roadmap/CourseDetailSheet.tsx
import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Book, Clock, Building2, Calendar, Info } from 'lucide-react';
import type { CourseNodeData } from '@/types/roadmap';
import type { CourseDB } from '@/lib/const/course-db';

interface CourseDetailSheetProps {
  course: CourseNodeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: CourseDB[]; // Course database for lookup
}

const categoryColors: Record<string, string> = {
  기초필수: 'bg-blue-100 text-blue-800',
  기초선택: 'bg-cyan-100 text-cyan-800',
  전공필수: 'bg-purple-100 text-purple-800',
  전공선택: 'bg-green-100 text-green-800',
  교양필수: 'bg-orange-100 text-orange-800',
  교양선택: 'bg-yellow-100 text-yellow-800',
};

export function CourseDetailSheet({ course, open, onOpenChange, courses }: CourseDetailSheetProps) {
  const [courseDetails, setCourseDetails] = useState<CourseDB | null>(null);

  // Find course details from course database
  useEffect(() => {
    if (course && courses.length > 0) {
      const found = courses.find(
        (c) => c.primaryCourseCode === course.courseCode || c.aliasCodes?.includes(course.courseCode),
      );
      setCourseDetails(found || null);
    } else {
      setCourseDetails(null);
    }
  }, [course, courses]);

  if (!course) return null;

  const categoryStyle = categoryColors[course.category] || 'bg-gray-100 text-gray-800';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge className={categoryStyle}>{course.category}</Badge>
            <Badge variant="outline">{course.credits}학점</Badge>
          </div>
          <SheetTitle className="text-xl">{course.label}</SheetTitle>
          <SheetDescription className="font-mono text-sm">{course.courseCode}</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {/* Semester Info */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">권장 이수학기:</span>
            <span className="font-medium">{course.semester}</span>
          </div>

          {/* Course DB Details */}
          {courseDetails ? (
            <>
              {/* English Title */}
              {courseDetails.displayTitleEn && (
                <div className="flex items-start gap-3 text-sm">
                  <Book className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-600">English:</span>
                    <p className="font-medium">{courseDetails.displayTitleEn}</p>
                  </div>
                </div>
              )}

              {/* Department */}
              {courseDetails.departmentContext && (
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-600">개설학과:</span>
                    <p className="font-medium">{courseDetails.departmentContext}</p>
                  </div>
                </div>
              )}

              {/* Hours */}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">시간:</span>
                <span className="font-medium">
                  강의 {courseDetails.lectureHours}시간
                  {courseDetails.labHours > 0 && `, 실습 ${courseDetails.labHours}시간`}
                </span>
              </div>

              {/* Offered Semesters */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">2025년 개설:</span>
                {courseDetails.offered2025_1 && (
                  <Badge variant="secondary" className="text-xs">
                    1학기
                  </Badge>
                )}
                {courseDetails.offered2025_2 && (
                  <Badge variant="secondary" className="text-xs">
                    2학기
                  </Badge>
                )}
                {!courseDetails.offered2025_1 && !courseDetails.offered2025_2 && (
                  <span className="text-xs text-gray-400">미개설</span>
                )}
              </div>

              {/* Description */}
              {courseDetails.description && (
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                    <Info className="h-4 w-4" />
                    <span>과목 설명</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{courseDetails.description}</p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-sm text-gray-500">
              상세 정보를 찾을 수 없습니다.
              <br />
              <span className="text-xs text-gray-400">과목 코드: {course.courseCode}</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
