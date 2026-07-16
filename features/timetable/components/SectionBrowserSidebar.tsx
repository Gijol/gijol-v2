import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  projectSectionBrowsingItems,
  type SectionBrowsingInteractionAdapter,
} from '@/features/timetable/section-browsing-adapters';
import { useTimetableSectionBrowser } from '@/features/timetable/hooks/useTimetableSectionBrowser';
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
import { Check, ChevronDown, Filter, Loader2, Search, X } from 'lucide-react';

interface SectionBrowserSidebarProps {
  term: string;
  interaction: SectionBrowsingInteractionAdapter;
  isMobile?: boolean;
  className?: string;
}

export function SectionBrowserSidebar({ term, interaction, isMobile = false, className }: SectionBrowserSidebarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const browser = useTimetableSectionBrowser(term, debouncedQuery, department);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [debouncedQuery, department]);

  useEffect(() => {
    if (department && !browser.departments.includes(department)) setDepartment('');
  }, [browser.departments, department]);

  const items = useMemo(
    () => projectSectionBrowsingItems(browser.sections, interaction),
    [browser.sections, interaction.scheduledSpans, interaction.selectedSectionKeys],
  );

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    if (isNearBottom && browser.hasNextPage && !browser.isFetchingNextPage) void browser.loadMore();
  };

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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 truncate rounded-xl border border-slate-200 bg-slate-50/50 px-3 font-black tracking-tight transition-colors hover:bg-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none ${isMobile ? 'h-9 text-[10px]' : 'h-10 text-[11px]'} ${department ? 'border-blue-300 bg-blue-50/50' : ''}`}
              aria-label="학과 필터"
            >
              <Filter size={14} className="shrink-0 text-slate-400" />
              <span className="max-w-[80px] truncate">{department || '학과'}</span>
              <ChevronDown size={14} className="shrink-0 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[300px] w-[180px] overflow-y-auto">
            {['', ...browser.departments].map((option) => (
              <DropdownMenuItem
                key={option || 'all'}
                onClick={() => setDepartment(option)}
                className="flex cursor-pointer items-center justify-between text-xs font-bold"
              >
                <span className="truncate">{option || '모든 학과'}</span>
                {department === option && <Check size={14} className="shrink-0 text-blue-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(query || department) && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDepartment('');
            }}
            className={`flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 ${isMobile ? 'h-9 w-9' : 'h-10 w-10'}`}
            title="필터 초기화"
            aria-label="강의 검색 필터 초기화"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {browser.graduateSectionCount > 0 && (
        <p className="mt-2 text-[10px] font-bold text-violet-600">
          대학원 {browser.graduateSectionCount.toLocaleString()}개 분반 포함
        </p>
      )}
    </div>
  );

  const courseList = (
    <div className={`w-full min-w-0 overflow-hidden ${isMobile ? '' : 'pb-12'}`}>
      {browser.isLoading ? (
        <div className="w-full p-8 text-center text-sm font-black text-slate-400">강의 목록을 불러오는 중입니다</div>
      ) : browser.error ? (
        <div className="w-full p-8 text-center text-sm font-black text-red-500">
          시간표 데이터를 불러오지 못했습니다
        </div>
      ) : items.length === 0 ? (
        <div className="w-full p-8 text-center">
          <p className="text-sm font-black text-slate-500">일치하는 강의가 없습니다</p>
          <p className="mt-2 text-xs text-slate-400">필터를 다시 확인해 주세요</p>
        </div>
      ) : (
        items.map(({ section, sectionKey, isAdded, isConflict }, index) => (
          <CourseSectionItem
            key={sectionKey}
            section={section}
            isAdded={isAdded}
            isConflict={isConflict}
            onAdd={() => interaction.add(section)}
            onRemove={() => interaction.remove(section)}
            onMouseEnter={() => interaction.preview(section)}
            onMouseLeave={() => interaction.preview(null)}
            compact={isMobile}
            hideBorder={index === items.length - 1 && !browser.hasNextPage}
          />
        ))
      )}
      {browser.hasNextPage && (
        <div className="flex w-full items-center justify-center gap-2 bg-slate-50/30 p-4 text-xs font-black text-slate-400">
          {browser.isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
          스크롤하여 더 보기 ({items.length}/{browser.totalElements})
        </div>
      )}
    </div>
  );

  const content = (
    <>
      {searchContent}
      <div ref={scrollContainerRef} className="w-full min-w-0 flex-1 overflow-y-auto" onScroll={handleScroll}>
        {courseList}
      </div>
    </>
  );

  if (isMobile) return <div className="flex h-full w-full flex-col overflow-hidden">{content}</div>;

  return (
    <Card
      className={cn(
        'relative flex h-full w-full min-w-0 flex-col overflow-hidden border-slate-200 bg-white p-0 shadow-sm',
        className,
      )}
    >
      <CardContent className="z-10 flex w-full min-w-0 flex-1 flex-col overflow-hidden p-0">{content}</CardContent>
    </Card>
  );
}
