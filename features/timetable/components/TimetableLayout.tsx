import React, { useState } from 'react';
import { SectionOffering } from '@/lib/types/timetable';
import { AvailabilityWithPreview } from './AvailabilityWithPreview';
import { CourseSidebar } from './CourseSidebar';
import { SelectedCoursesDialog } from './SelectedCoursesDialog';
import { SavedTimetablesDialog } from './SavedTimetablesDialog';
import { CourseDetailDialog } from './CourseDetailDialog';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ListChecks, Menu, FolderOpen, Plus, RotateCcw } from 'lucide-react';

interface TimetableLayoutProps {
  sections: SectionOffering[];
}

export function TimetableLayout({ sections }: TimetableLayoutProps) {
  const scheduledSpans = useTimetableStore((state) => state.scheduledSpans);
  const previewSpans = useTimetableStore((state) => state.previewSpans);
  const removeSection = useTimetableStore((state) => state.removeSection);
  const selectedSections = useTimetableStore((state) => state.selectedSections);
  const reset = useTimetableStore((state) => state.reset);

  const [isSelectedCoursesDialogOpen, setIsSelectedCoursesDialogOpen] = useState(false);
  const [isSavedTimetablesDialogOpen, setIsSavedTimetablesDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCourseDetailDialogOpen, setIsCourseDetailDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const handleNewTimetable = () => {
    if (selectedSections.length > 0) {
      const confirmReset = window.confirm('현재 선택된 강의들이 모두 초기화됩니다. 계속하시겠습니까?');
      if (confirmReset) {
        reset();
      }
    }
  };

  const handleSpanClick = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsCourseDetailDialogOpen(true);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-full flex-col gap-6 overflow-hidden bg-slate-100 p-4 lg:p-6">
        {/* Desktop Layout */}
        <div className="hidden h-full lg:flex lg:gap-6">
          {/* Left: Timetable Grid Area */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-4 flex shrink-0 items-center justify-between px-2">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
                  ⏰ 시간표 빌더
                </h1>
                <p className="text-xs font-bold text-slate-500">
                  시간 중복을 확인하며 나만의 완벽한 학기 시간표를 짜보세요
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleNewTimetable}
                  variant="outline"
                  className="flex items-center gap-2 border-slate-300 font-bold tracking-tight hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <RotateCcw size={18} />
                  시간표 초기화
                </Button>
                <Button
                  onClick={() => setIsSavedTimetablesDialogOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2 border-slate-300 font-bold tracking-tight hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                >
                  <FolderOpen size={18} />
                  저장된 시간표
                </Button>
                <Button
                  onClick={() => setIsSelectedCoursesDialogOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 font-bold tracking-tight hover:bg-blue-700"
                >
                  <ListChecks size={18} />
                  선택된 강의 ({selectedSections.length})
                </Button>
              </div>
            </div>

            <AvailabilityWithPreview
              scheduledSpans={scheduledSpans}
              previewSpans={previewSpans}
              startTime="09:00"
              endTime="18:30"
              timeIncrements={30}
              days={['일', '월', '화', '수', '목', '금', '토']}
              onRemoveSpan={removeSection}
              onSpanClick={handleSpanClick}
              hideWeekends={false}
            />
          </div>

          {/* Right: Sidebar Panel */}
          <div className="flex w-[400px] shrink-0 flex-col">
            <CourseSidebar sections={sections} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex h-full flex-col gap-4 lg:hidden">
          {/* Mobile Header */}
          <div className="flex shrink-0 items-center justify-between px-2">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
                ⏰ 시간표 빌더
              </h1>
              <p className="text-xs font-bold text-slate-500">나만의 완벽한 학기 시간표를 짜보세요</p>
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={handleNewTimetable}
                size="sm"
                variant="outline"
                className="border-slate-300 font-bold tracking-tight hover:border-red-500 hover:bg-red-50 hover:text-red-500"
              >
                <RotateCcw size={16} />
              </Button>
              <Button
                onClick={() => setIsSavedTimetablesDialogOpen(true)}
                size="sm"
                variant="outline"
                className="border-slate-300 font-bold tracking-tight hover:border-blue-500 hover:bg-blue-50"
              >
                <FolderOpen size={16} />
              </Button>
              <Button
                onClick={() => setIsSelectedCoursesDialogOpen(true)}
                size="sm"
                className="bg-blue-600 font-bold tracking-tight hover:bg-blue-700"
              >
                <ListChecks size={16} />
                <span className="ml-1.5">({selectedSections.length})</span>
              </Button>
            </div>
          </div>

          {/* Mobile Timetable Grid (Hide Weekends) */}
          <div className="flex-1 overflow-hidden">
            <AvailabilityWithPreview
              scheduledSpans={scheduledSpans}
              previewSpans={previewSpans}
              startTime="09:00"
              endTime="18:30"
              timeIncrements={30}
              days={['일', '월', '화', '수', '목', '금', '토']}
              onRemoveSpan={removeSection}
              onSpanClick={handleSpanClick}
              hideWeekends={true}
            />
          </div>

          {/* Mobile Bottom Sheet for Sidebar */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-hidden p-0">
              <div className="flex h-full flex-col overflow-hidden px-4 pt-8 pb-4">
                <CourseSidebar sections={sections} isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Dialogs (Shared for both mobile and desktop) */}
        <SelectedCoursesDialog open={isSelectedCoursesDialogOpen} onOpenChange={setIsSelectedCoursesDialogOpen} />
        <SavedTimetablesDialog open={isSavedTimetablesDialogOpen} onOpenChange={setIsSavedTimetablesDialogOpen} />
        <CourseDetailDialog
          open={isCourseDetailDialogOpen}
          onOpenChange={setIsCourseDetailDialogOpen}
          sectionId={selectedSectionId}
        />
      </div>
    </TooltipProvider>
  );
}
