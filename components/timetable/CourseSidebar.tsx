import React, { useState, useMemo } from 'react';
import { SectionOffering } from '@/lib/types/timetable';
import { CourseSectionItem } from './CourseSectionItem';
import { SelectedSectionList } from './SelectedSectionList';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { checkConflict } from '@/features/timetable/conflict';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, ListChecks } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface CourseSidebarProps {
  sections: SectionOffering[];
}

export function CourseSidebar({ sections }: CourseSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('모든 학과');

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

  return (
    <Card className="relative flex h-full w-[400px] max-w-[400px] min-w-0 flex-col overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
      {/* Top Section: Accordion for Selected Courses */}
      <div className="z-20 w-full shrink-0 overflow-hidden bg-slate-50/50">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="selected-list" className="border-none">
            <AccordionTrigger className="px-6 py-4 transition-colors hover:bg-slate-100/50 hover:no-underline">
              <div className="flex items-center gap-2 overflow-hidden">
                <ListChecks size={18} className="shrink-0 text-blue-600" />
                <span className="truncate text-sm font-black tracking-tight text-slate-900">
                  선택된 강의 ({selectedSections.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="w-full overflow-hidden px-6 pt-2 pb-6">
              <SelectedSectionList />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Separator className="z-20" />

      {/* Course Search Section - Condensed Header */}
      <CardContent className="z-10 flex w-full min-w-0 flex-1 flex-col overflow-hidden p-0">
        <div className="w-full shrink-0 overflow-hidden border-b border-slate-100 bg-white p-4">
          <div className="flex w-full min-w-0 items-center gap-2">
            {/* Condensed Search Input */}
            <div className="group relative min-w-0 flex-1">
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"
                size={16}
              />
              <Input
                placeholder="과목명, 교수..."
                className="h-10 w-full rounded-xl border-slate-200 bg-slate-50/50 pl-9 text-sm font-medium focus-visible:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Condensed Department Filter */}
            <div className="relative w-32 shrink-0">
              <Filter className="absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400" size={14} />
              <select
                className="h-10 w-full cursor-pointer appearance-none truncate rounded-xl border border-slate-200 bg-slate-50/50 pr-6 pl-8 text-[11px] font-black tracking-tight focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="w-full min-w-0 flex-1">
          <div className="w-full min-w-0 divide-y divide-slate-100 overflow-hidden pb-12">
            {filteredSections.length === 0 ? (
              <div className="w-full p-16 text-center">
                <p className="text-sm font-black tracking-widest text-slate-300 uppercase">일치하는 결과 없음</p>
                <p className="mt-2 text-xs text-slate-400">필터를 다시 확인해 주세요</p>
              </div>
            ) : (
              filteredSections.slice(0, 50).map((section) => {
                const combinedId = `${section.course_code}-${section.section}`;
                const isAdded = selectedSections.some((sel) => sel.id === combinedId);
                const isConflict = !isAdded && checkConflict(section, scheduledSpans);

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
                  />
                );
              })
            )}
            {filteredSections.length > 50 && (
              <div className="w-full bg-slate-50/30 p-6 text-center">
                <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                  {filteredSections.length}개 중 상위 50개 표시됨
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
