import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SectionOffering, TimetableSpan } from '@/lib/types/timetable';
import { useTimetablePlanStore } from '@/lib/stores/timetable-plan.store';
import { checkConflict } from '@/features/timetable/conflict';
import { createSectionKey } from '@/features/timetable/plan-model';
import { CourseSectionItem } from './CourseSectionItem';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, Filter, Search, X } from 'lucide-react';

interface PlanCourseSidebarProps {
  planId: string;
  sections: SectionOffering[];
  scheduledSpans: TimetableSpan[];
  selectedSectionKeys: Set<string>;
  isMobile?: boolean;
  isLoading?: boolean;
  className?: string;
  onPreview: (section: SectionOffering | null) => void;
}

const ITEMS_PER_PAGE = 30;

export function PlanCourseSidebar({
  planId,
  sections,
  scheduledSpans,
  selectedSectionKeys,
  isMobile = false,
  isLoading = false,
  className,
  onPreview,
}: PlanCourseSidebarProps) {
  const addSectionDirect = useTimetablePlanStore((state) => state.addSectionDirect);
  const clearSelectedSectionByKey = useTimetablePlanStore((state) => state.clearSelectedSectionByKey);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('모든 학과');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const departments = useMemo(() => {
    const depts = new Set(sections.map((section) => section.department).filter(Boolean));
    return ['모든 학과', ...Array.from(depts).sort()];
  }, [sections]);

  const filteredSections = useMemo(
    () =>
      sections.filter((section) => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch =
          section.title.toLowerCase().includes(searchLower) ||
          section.course_code.toLowerCase().includes(searchLower) ||
          section.instructors.some((instructor) => instructor.name.toLowerCase().includes(searchLower));

        if (!matchSearch) return false;
        if (selectedDept !== '모든 학과' && section.department !== selectedDept) return false;

        return true;
      }),
    [sections, searchTerm, selectedDept],
  );

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [searchTerm, selectedDept]);

  useEffect(() => {
    if (!departments.includes(selectedDept)) {
      setSelectedDept('모든 학과');
    }
  }, [departments, selectedDept]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const threshold = 100;
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;

      if (isNearBottom && displayCount < filteredSections.length) {
        setDisplayCount((current) => Math.min(current + ITEMS_PER_PAGE, filteredSections.length));
      }
    },
    [displayCount, filteredSections.length],
  );

  const searchContent = (
    <div
      className={`w-full shrink-0 overflow-hidden ${isMobile ? 'sticky top-0 z-20 bg-white pb-3' : 'border-b border-slate-100 bg-white p-4'}`}
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="group relative min-w-0 flex-1">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"
            size={16}
          />
          <Input
            aria-label="강의 검색"
            name="course-search"
            autoComplete="off"
            placeholder="과목명, 코드, 교수…"
            className={`w-full rounded-xl border-slate-200 bg-slate-50/50 pl-9 font-medium focus-visible:ring-blue-500 ${isMobile ? 'h-9 text-sm' : 'h-10 text-sm'}`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 truncate rounded-xl border border-slate-200 bg-slate-50/50 px-3 font-black tracking-tight transition-colors hover:bg-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none ${isMobile ? 'h-9 text-[10px]' : 'h-10 text-[11px]'} ${selectedDept !== '모든 학과' ? 'border-blue-300 bg-blue-50/50' : ''}`}
              aria-label="학과 필터"
            >
              <Filter size={14} className="shrink-0 text-slate-400" />
              <span className="max-w-[80px] truncate">{selectedDept === '모든 학과' ? '학과' : selectedDept}</span>
              <ChevronDown size={14} className="shrink-0 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[300px] w-[180px] overflow-y-auto">
            {departments.map((department) => (
              <DropdownMenuItem
                key={department}
                onClick={() => setSelectedDept(department)}
                className="flex cursor-pointer items-center justify-between text-xs font-bold"
              >
                <span className="truncate">{department}</span>
                {selectedDept === department && <Check size={14} className="shrink-0 text-blue-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(searchTerm || selectedDept !== '모든 학과') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedDept('모든 학과');
            }}
            className={`flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 ${isMobile ? 'h-9 w-9' : 'h-10 w-10'}`}
            title="필터 초기화"
            aria-label="강의 검색 필터 초기화"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );

  const displayedSections = filteredSections.slice(0, displayCount);

  const courseList = (
    <div className={`w-full min-w-0 overflow-hidden ${isMobile ? '' : 'pb-12'}`}>
      {isLoading ? (
        <div className="w-full p-8 text-center">
          <p className="text-sm font-black text-slate-400">강의 목록을 불러오는 중입니다</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="w-full p-8 text-center">
          <p className="text-sm font-black text-slate-500">일치하는 강의가 없습니다</p>
          <p className="mt-2 text-xs text-slate-400">필터를 다시 확인해 주세요</p>
        </div>
      ) : (
        displayedSections.map((section, index) => {
          const sectionKey = createSectionKey(section);
          const isAdded = selectedSectionKeys.has(sectionKey);
          const isConflict = !isAdded && checkConflict(section, scheduledSpans);
          const isLastItem = index === displayedSections.length - 1;

          return (
            <CourseSectionItem
              key={sectionKey}
              section={section}
              isAdded={isAdded}
              isConflict={isConflict}
              onAdd={() => addSectionDirect(planId, section)}
              onRemove={() => clearSelectedSectionByKey(planId, sectionKey)}
              onMouseEnter={(hoveredSection) => onPreview(hoveredSection)}
              onMouseLeave={() => onPreview(null)}
              compact={isMobile}
              hideBorder={isLastItem}
            />
          );
        })
      )}
      {displayCount < filteredSections.length && (
        <div className="w-full bg-slate-50/30 p-4 text-center">
          <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
            스크롤하여 더 보기 ({displayCount}/{filteredSections.length})
          </p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        {searchContent}
        <div ref={scrollContainerRef} className="w-full flex-1 overflow-y-auto" onScroll={handleScroll}>
          {courseList}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'relative flex h-full w-full min-w-0 flex-col overflow-hidden border-slate-200 bg-white p-0 shadow-sm',
        className,
      )}
    >
      <CardContent className="z-10 flex w-full min-w-0 flex-1 flex-col overflow-hidden p-0">
        {searchContent}
        <div ref={scrollContainerRef} className="w-full min-w-0 flex-1 overflow-y-auto" onScroll={handleScroll}>
          {courseList}
        </div>
      </CardContent>
    </Card>
  );
}
