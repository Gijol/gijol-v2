import React, { useState, useEffect, useRef } from 'react';
import type { RoadmapCourseCandidate } from '@/features/course-catalog/roadmap';
import { fetchRoadmapCourseCandidates } from '@/features/roadmap/course-candidates';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  GripVertical,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Palette,
  Loader2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RoadmapSidebarProps {
  savedRoadmaps?: Array<{
    id: string;
    name: string;
    timestamp: number;
    nodes: any[];
    edges: any[];
  }>;
  onLoad?: (data: any) => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export const RoadmapSidebar = ({ savedRoadmaps = [], onLoad, onDelete, onClearAll }: RoadmapSidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [courses, setCourses] = useState<RoadmapCourseCandidate[]>([]);
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => setPage(1), [debouncedQuery]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetchRoadmapCourseCandidates(debouncedQuery, page, controller.signal)
      .then((result) => {
        setCourses((current) => (page === 1 ? result.content : [...current, ...result.content]));
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setLoadError(error instanceof Error ? error.message : '과목 후보를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, page]);

  const hasMore = page < totalPages;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) setPage((current) => current + 1);
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const onDragStart = (event: React.DragEvent, course: RoadmapCourseCandidate) => {
    event.dataTransfer.setData('application/reactflow/course', JSON.stringify(course));
    event.dataTransfer.effectAllowed = 'move';
  };

  // If closed, return a thin strip
  if (!isOpen) {
    return (
      <div className="z-20 flex h-full w-12 flex-col items-center gap-4 border-r bg-white py-4">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="강의 목록 펼치기">
          <PanelLeftOpen aria-hidden="true" className="h-5 w-5 text-slate-500" />
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
    <div className="z-20 flex h-full w-[280px] flex-col border-r bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-slate-50/50 p-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Palette aria-hidden="true" className="h-4 w-4 text-slate-500" />
          강의 목록
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsOpen(false)}
          aria-label="강의 목록 접기"
        >
          <PanelLeftClose aria-hidden="true" className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-2 border-b p-3">
        <div className="relative">
          <Search aria-hidden="true" className="absolute top-2.5 left-2 h-3.5 w-3.5 text-slate-400" />
          <Input
            aria-label="로드맵 과목 검색"
            name="roadmap-course-search"
            autoComplete="off"
            placeholder="과목 검색…"
            className="h-8 border-slate-200 bg-slate-50 pl-8 text-sm focus-visible:ring-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Saved Roadmaps Section */}
        {savedRoadmaps && savedRoadmaps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-gray-700">저장된 로드맵</span>
              {onClearAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={onClearAll}
                >
                  <Trash2 aria-hidden="true" className="mr-1 h-3 w-3" />
                  모두 삭제
                </Button>
              )}
            </div>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {savedRoadmaps.slice(0, 10).map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs hover:bg-slate-100"
                >
                  <button
                    className="min-w-0 flex-1 truncate text-left font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => onLoad?.(saved)}
                  >
                    {saved.name}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 text-gray-400 hover:text-red-600"
                    onClick={() => onDelete?.(saved.id)}
                    aria-label={`${saved.name} 삭제`}
                  >
                    <Trash2 aria-hidden="true" className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400">
          <span>드래그하여 추가하세요</span>
          <span>
            {courses.length} / {totalElements}개
          </span>
        </div>
      </div>

      {/* Course List - Compact Design */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 p-2">
          {courses.map((course) => (
            <div
              key={course.courseId}
              draggable
              onDragStart={(event) => onDragStart(event, course)}
              className="group flex cursor-grab items-center gap-2 rounded-md border border-slate-100 bg-white p-2 text-left shadow-sm transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-ui-out)] hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md active:cursor-grabbing"
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
          {(hasMore || isLoading) && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="ml-2 text-xs text-gray-400">더 불러오는 중…</span>
            </div>
          )}

          {loadError && <div className="px-2 py-6 text-center text-xs text-red-500">{loadError}</div>}

          {!isLoading && !loadError && courses.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-400">검색 결과가 없습니다.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
