import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CourseDB, filterCourses } from '@/lib/const/course-db';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, GripVertical, Menu, PanelLeftClose, PanelLeftOpen, Plus, Palette, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ITEMS_PER_PAGE = 50;

interface RoadmapSidebarProps {
  courses: CourseDB[];
}

export const RoadmapSidebar = ({ courses }: RoadmapSidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter all courses
  const allFilteredCourses = useMemo(() => {
    return filterCourses(courses, query);
  }, [courses, query]);

  // Display only the current page of courses
  const displayedCourses = useMemo(() => {
    return allFilteredCourses.slice(0, displayCount);
  }, [allFilteredCourses, displayCount]);

  const hasMore = displayCount < allFilteredCourses.length;

  // Reset display count when query changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [query]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore]);

  const onDragStart = (event: React.DragEvent, course: CourseDB) => {
    event.dataTransfer.setData('application/reactflow/course', JSON.stringify(course));
    event.dataTransfer.effectAllowed = 'move';
  };

  // If closed, return a thin strip
  if (!isOpen) {
    return (
      <div className="z-20 flex h-full w-12 flex-col items-center gap-4 border-r bg-white py-4">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <PanelLeftOpen className="h-5 w-5 text-gray-500" />
        </Button>
        <div
          className="writing-mode-vertical font-mono text-xs tracking-widest text-slate-600 uppercase"
          style={{ writingMode: 'vertical-lr' }}
        >
          Course Palette
        </div>
      </div>
    );
  }

  return (
    <div className="z-20 flex h-full w-[280px] flex-col border-r bg-white transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-slate-50/50 p-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Palette className="h-4 w-4 text-gray-500" />
          강의 목록
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
          <PanelLeftClose className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-2 border-b p-3">
        <div className="relative">
          <Search className="absolute top-2.5 left-2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="과목 검색..."
            className="h-8 border-slate-200 bg-slate-50 pl-8 text-sm focus-visible:ring-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400">
          <span>드래그하여 추가하세요</span>
          <span>
            {displayedCourses.length} / {allFilteredCourses.length}개
          </span>
        </div>
      </div>

      {/* Course List - Compact Design */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 p-2">
          {displayedCourses.map((course) => (
            <div
              key={course.courseUid}
              draggable
              onDragStart={(event) => onDragStart(event, course)}
              className="group flex cursor-grab items-center gap-2 rounded-md border border-slate-100 bg-white p-2 text-left shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md active:cursor-grabbing"
            >
              {/* Grip Handle */}
              <GripVertical className="h-3 w-3 shrink-0 text-gray-300 group-hover:text-blue-400" />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-medium text-gray-500 group-hover:text-blue-600">
                    {course.primaryCourseCode}
                  </span>
                  <span className="rounded bg-slate-100 px-1 text-[10px] text-gray-400 group-hover:bg-white">
                    {course.creditHours}학점
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  {course.displayTitleKo}
                </div>
              </div>

              {/* Add Icon (Optional Hint) */}
              <Plus className="h-3 w-3 text-transparent transition-colors group-hover:text-blue-400" />
            </div>
          ))}

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="ml-2 text-xs text-gray-400">더 불러오는 중...</span>
            </div>
          )}

          {displayedCourses.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-400">검색 결과가 없습니다.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
