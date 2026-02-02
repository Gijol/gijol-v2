import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { SectionOffering } from '@/lib/types/timetable';
import { CourseSectionItem } from './CourseSectionItem';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { checkConflict } from '@/features/timetable/conflict';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, ChevronDown, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CourseSidebarProps {
  sections: SectionOffering[];
  isMobile?: boolean;
}

const ITEMS_PER_PAGE = 30;

export function CourseSidebar({ sections, isMobile = false }: CourseSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('모든 학과');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedSections = useTimetableStore((state) => state.selectedSections);
  const scheduledSpans = useTimetableStore((state) => state.scheduledSpans);
  const addSection = useTimetableStore((state) => state.addSection);
  const removeSection = useTimetableStore((state) => state.removeSection);
  const setPreview = useTimetableStore((state) => state.setPreview);
  const clearPreview = useTimetableStore((state) => state.clearPreview);

  const departments = useMemo(() => {
    const depts = new Set(sections.map((s) => s.department));
    return ['모든 학과', ...Array.from(depts).sort()];
  }, [sections]);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        s.title.toLowerCase().includes(searchLower) ||
        s.course_code.toLowerCase().includes(searchLower) ||
        s.instructors.some((i) => i.name.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;
      if (selectedDept !== '모든 학과' && s.department !== selectedDept) return false;

      return true;
    });
  }, [sections, searchTerm, selectedDept]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedDept]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const threshold = 100;
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;

      if (isNearBottom && displayCount < filteredSections.length) {
        setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredSections.length));
      }
    },
    [displayCount, filteredSections.length],
  );

  const searchContent = (
    <div
      className={`w-full shrink-0 overflow-hidden ${isMobile ? 'sticky top-0 z-20 bg-white pb-3' : 'border-b border-slate-100 bg-white p-4'}`}
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        {/* Search Input */}
        <div className="group relative min-w-0 flex-1">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"
            size={16}
          />
          <Input
            placeholder="과목명, 교수..."
            className={`w-full rounded-xl border-slate-200 bg-slate-50/50 pl-9 font-medium focus-visible:ring-blue-500 ${isMobile ? 'h-9 text-sm' : 'h-10 text-sm'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Department Filter - shadcn Dropdown */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 truncate rounded-xl border border-slate-200 bg-slate-50/50 px-3 font-black tracking-tight transition-colors hover:bg-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none ${isMobile ? 'h-9 text-[10px]' : 'h-10 text-[11px]'} ${selectedDept !== '모든 학과' ? 'border-blue-300 bg-blue-50/50' : ''}`}
            >
              <Filter size={14} className="shrink-0 text-slate-400" />
              <span className="max-w-[80px] truncate">{selectedDept === '모든 학과' ? '학과' : selectedDept}</span>
              <ChevronDown size={14} className="shrink-0 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[300px] w-[180px] overflow-y-auto">
            {departments.map((d) => (
              <DropdownMenuItem
                key={d}
                onClick={() => setSelectedDept(d)}
                className="flex cursor-pointer items-center justify-between text-xs font-bold"
              >
                <span className="truncate">{d}</span>
                {selectedDept === d && <Check size={14} className="shrink-0 text-blue-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Button - only show when filters are active */}
        {(searchTerm || selectedDept !== '모든 학과') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDept('모든 학과');
            }}
            className={`flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 ${isMobile ? 'h-9 w-9' : 'h-10 w-10'}`}
            title="필터 초기화"
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
      {filteredSections.length === 0 ? (
        <div className="w-full p-8 text-center">
          <p className="text-sm font-black tracking-widest text-slate-300 uppercase">일치하는 결과 없음</p>
          <p className="mt-2 text-xs text-slate-400">필터를 다시 확인해 주세요</p>
        </div>
      ) : (
        displayedSections.map((section, index) => {
          const combinedId = `${section.course_code}-${section.section}`;
          const isAdded = selectedSections.some((sel) => sel.id === combinedId);
          const isConflict = !isAdded && checkConflict(section, scheduledSpans);
          const isLastItem = index === displayedSections.length - 1;

          return (
            <CourseSectionItem
              key={combinedId}
              section={section}
              isAdded={isAdded}
              isConflict={isConflict}
              onAdd={addSection}
              onRemove={(s) => removeSection(`${s.course_code}-${s.section}`)}
              onMouseEnter={setPreview}
              onMouseLeave={clearPreview}
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

  // Mobile version - no Card wrapper
  if (isMobile) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        {searchContent}
        <div className="w-full flex-1 overflow-y-auto" onScroll={handleScroll}>
          {courseList}
        </div>
      </div>
    );
  }

  // Desktop version - with Card wrapper
  return (
    <Card className="relative flex h-full w-[400px] max-w-[400px] min-w-0 flex-col overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
      <CardContent className="z-10 flex w-full min-w-0 flex-1 flex-col overflow-hidden p-0">
        {searchContent}
        <div className="w-full min-w-0 flex-1 overflow-y-auto" onScroll={handleScroll}>
          {courseList}
        </div>
      </CardContent>
    </Card>
  );
}
