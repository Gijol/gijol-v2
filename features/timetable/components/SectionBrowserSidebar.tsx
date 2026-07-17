import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  projectSectionBrowsingItems,
  type SectionBrowsingInteractionAdapter,
} from '@/features/timetable/section-browsing-adapters';
import { useTimetableSectionBrowser } from '@/features/timetable/hooks/useTimetableSectionBrowser';
import type { SectionProgramLevel } from '@/features/timetable/section-browsing';
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

const NUMBER_FORMAT = new Intl.NumberFormat('ko-KR');

interface SectionBrowserSidebarProps {
  term: string;
  interaction: SectionBrowsingInteractionAdapter;
  isMobile?: boolean;
  className?: string;
}

export function SectionBrowserSidebar({ term, interaction, isMobile = false, className }: SectionBrowserSidebarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(() => (typeof router.query.q === 'string' ? router.query.q : ''));
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [department, setDepartment] = useState(() =>
    typeof router.query.department === 'string' ? router.query.department : '',
  );
  const [programLevel, setProgramLevel] = useState<Exclude<SectionProgramLevel, 'all'>>(() =>
    router.query.level === 'graduate' ? 'graduate' : 'undergraduate',
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const browser = useTimetableSectionBrowser(term, debouncedQuery, department, programLevel);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [debouncedQuery, department, programLevel]);

  useEffect(() => {
    if (!router.isReady) return;
    const currentQuery = typeof router.query.q === 'string' ? router.query.q : '';
    const currentDepartment = typeof router.query.department === 'string' ? router.query.department : '';
    const currentLevel = router.query.level === 'graduate' ? 'graduate' : 'undergraduate';
    if (currentQuery === debouncedQuery && currentDepartment === department && currentLevel === programLevel) {
      return;
    }

    const nextQuery = { ...router.query };
    if (debouncedQuery) nextQuery.q = debouncedQuery;
    else delete nextQuery.q;
    if (department) nextQuery.department = department;
    else delete nextQuery.department;
    if (programLevel === 'graduate') nextQuery.level = 'graduate';
    else delete nextQuery.level;

    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true, scroll: false });
  }, [debouncedQuery, department, programLevel, router]);

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
      className={`w-full shrink-0 overflow-hidden ${isMobile ? 'sticky top-0 z-20 bg-white pb-4' : 'border-b border-slate-100 bg-white p-4'}`}
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="group relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"
            size={16}
          />
          <Input
            aria-label="강의 검색"
            name="course-search"
            autoComplete="off"
            placeholder="과목명, 코드, 교수…"
            className={`w-full rounded-lg border-slate-200 bg-slate-50/70 pl-9 font-medium focus-visible:bg-white focus-visible:ring-blue-500 ${isMobile ? 'h-10 text-sm' : 'h-10 text-sm'}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`flex h-10 shrink-0 cursor-pointer touch-manipulation items-center gap-1.5 truncate rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold tracking-tight transition-[background-color,border-color,color] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none ${department ? 'border-blue-300 bg-blue-50 text-blue-700' : ''}`}
              aria-label="학과 필터"
            >
              <Filter aria-hidden="true" size={14} className="shrink-0 text-slate-400" />
              <span className="max-w-[80px] truncate">{department || '학과'}</span>
              <ChevronDown aria-hidden="true" size={14} className="shrink-0 text-slate-400" />
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
                {department === option && <Check aria-hidden="true" size={14} className="shrink-0 text-blue-500" />}
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
            className="flex h-10 w-10 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-slate-50/70 transition-[background-color,border-color,color,transform] hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 focus-visible:outline-none active:scale-[0.96] motion-reduce:transform-none"
            title="필터 초기화"
            aria-label="강의 검색 필터 초기화"
          >
            <X aria-hidden="true" size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
        <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label="과정 선택">
          {(
            [
              ['undergraduate', '학부', browser.undergraduateSectionCount],
              ['graduate', '대학원', browser.graduateSectionCount],
            ] as const
          ).map(([level, label, count]) => {
            const isActive = programLevel === level;
            return (
              <button
                key={level}
                type="button"
                className={cn(
                  'h-8 min-w-[92px] touch-manipulation rounded-md px-2 text-xs font-semibold tabular-nums transition-[background-color,color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none active:scale-[0.97] motion-reduce:transform-none',
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-800',
                )}
                aria-pressed={isActive}
                onClick={() => setProgramLevel(level)}
              >
                {label}{' '}
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{NUMBER_FORMAT.format(count)}</span>
              </button>
            );
          })}
        </div>
        <p className="min-w-0 truncate text-right text-xs font-medium text-slate-400" aria-live="polite">
          {browser.isLoading ? '검색 중…' : `${NUMBER_FORMAT.format(browser.totalElements)}개 분반`}
        </p>
      </div>
    </div>
  );

  const courseList = (
    <div className={`w-full min-w-0 overflow-hidden ${isMobile ? '' : 'pb-12'}`}>
      {browser.isLoading ? (
        <div className="w-full p-8 text-center" role="status" aria-live="polite">
          <Loader2
            aria-hidden="true"
            className="mx-auto animate-spin text-blue-600 motion-reduce:animate-none"
            size={18}
          />
          <p className="mt-3 text-sm font-semibold text-slate-500">강의 목록을 불러오는 중…</p>
        </div>
      ) : browser.error ? (
        <div className="w-full p-8 text-center" role="alert">
          <p className="text-sm font-semibold text-red-600">강의 목록을 불러오지 못했습니다</p>
          <p className="mt-1 text-xs font-medium text-slate-500">네트워크 연결을 확인한 뒤 다시 시도해 주세요.</p>
          <button
            type="button"
            className="mt-3 h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            onClick={() => void browser.refetch()}
          >
            다시 불러오기
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="w-full p-8 text-center">
          <p className="text-sm font-semibold text-slate-600">
            조건에 맞는 {programLevel === 'graduate' ? '대학원' : '학부'} 강의가 없습니다
          </p>
          <p className="mt-2 text-xs text-slate-400">검색어 또는 학과 필터를 바꿔 보세요.</p>
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
        <div className="flex w-full items-center justify-center gap-2 bg-slate-50/30 p-4 text-xs font-semibold text-slate-400">
          {browser.isFetchingNextPage && (
            <Loader2 aria-hidden="true" size={14} className="animate-spin motion-reduce:animate-none" />
          )}
          스크롤하여 더 보기 ({NUMBER_FORMAT.format(items.length)}/{NUMBER_FORMAT.format(browser.totalElements)})
        </div>
      )}
    </div>
  );

  const content = (
    <>
      {searchContent}
      <div
        ref={scrollContainerRef}
        className="w-full min-w-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={handleScroll}
        aria-busy={browser.isLoading || browser.isFetchingNextPage}
      >
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
