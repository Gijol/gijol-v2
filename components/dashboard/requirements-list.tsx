'use client';

import { useState } from 'react';
import { IconAlertTriangle, IconCircleCheck, IconChevronRight } from '@tabler/icons-react';
import { Progress } from '@components/ui/progress';
import { Badge } from '@components/ui/badge';
import { ScrollArea } from '@components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@components/ui/sheet';
import { cn } from '@/lib/utils';

interface Requirement {
  domain: string;
  required: number;
  earned: number;
  percentage: number;
  satisfied: boolean;
  messages: string[];
  courses: any[];
}

interface RequirementsListProps {
  requirements: Requirement[];
  className?: string;
}



export function RequirementsList({ requirements, className }: RequirementsListProps) {
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCardClick = (req: Requirement) => {
    setSelectedRequirement(req);
    setIsSheetOpen(true);
  };

  return (
    <>
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
        <span className="text-xl">📋</span> 영역별 이수 현황
      </h2>

      {/* Grid Card Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requirements.map((req) => {

          return (
            <button
              key={req.domain}
              onClick={() => handleCardClick(req)}
              className={cn(
                'group relative rounded-xl border p-4 text-left transition-all duration-200',
                'bg-white hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300',
                'focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none',
                'border-gray-200'
              )}
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {req.satisfied ? (
                    <IconCircleCheck size={20} className="text-emerald-600" />
                  ) : (
                    <IconAlertTriangle size={20} className="text-amber-500" />
                  )}
                  <span className="font-bold text-gray-900">{req.domain}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-bold px-2 py-0.5 border-none rounded-full',
                    req.satisfied
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : 'bg-red-100 text-red-600 hover:bg-red-200',
                  )}
                >
                  {req.percentage}%
                </Badge>
              </div>

              {/* Credit Stats (Replacing Progress Bar) */}
              <div className="flex items-end gap-1.5 py-2">
                <span className="text-3xl font-extrabold text-gray-900 leading-none">
                  {req.earned}
                </span>
                <span className="mb-0.5 text-sm font-medium text-gray-500">
                  / {req.required} 학점
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedRequirement && (
            <>
              <SheetHeader className="border-b border-gray-50 pb-4">
                <div className="flex items-center gap-2">
                  {selectedRequirement.satisfied ? (
                    <IconCircleCheck size={24} className="text-emerald-600" />
                  ) : (
                    <IconAlertTriangle size={24} className="text-amber-500" />
                  )}
                  <SheetTitle className="text-xl">{selectedRequirement.domain}</SheetTitle>
                </div>
                
                <SheetDescription asChild>
                  <div className="mt-2">
                    <div className="flex items-end justify-between">
                      {/* Credit Stats */}
                      <div className="flex items-end gap-1.5">
                        <span className="text-4xl font-extrabold text-gray-900 leading-none">
                          {selectedRequirement.earned}
                        </span>
                        <span className="mb-1 text-sm font-medium text-gray-500">
                           / {selectedRequirement.required} 학점
                        </span>
                      </div>
                      
                      {/* Badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 border-none rounded-full mb-1',
                          selectedRequirement.satisfied
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-red-100 text-red-600',
                        )}
                      >
                        {selectedRequirement.percentage}%
                      </Badge>
                    </div>
                    {/* Progress Bar (Restored for Sheet View) */}
                    <Progress 
                      value={selectedRequirement.percentage} 
                      className="mt-4 h-2 bg-gray-100"
                    />
                  </div>
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="-mx-6 mt-4 h-[calc(100vh-200px)] px-6">
                {/* Warning Messages */}
                {!selectedRequirement.satisfied && selectedRequirement.messages.length > 0 && (
                  <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <IconAlertTriangle size={16} />
                      주의사항
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedRequirement.messages.map((msg) => (
                        <li key={msg} className="flex items-start gap-2 text-sm text-amber-700">
                          <span className="mt-1 text-amber-400">•</span>
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course List */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-700">이수 과목</h4>
                    <Badge variant="secondary" className="text-xs">
                      {selectedRequirement.courses.length}
                    </Badge>
                  </div>

                  {selectedRequirement.courses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRequirement.courses.map((course, idx) => (
                        <div
                          key={`${course.courseCode}-${idx}`}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{course.courseName ?? '-'}</span>
                              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                <span className="font-mono">{course.courseCode ?? '-'}</span>
                                <span>
                                  {course.year?.toString().slice(2) ?? '-'}-
                                  {course.semester?.toString().replace('학기', '') ?? '-'}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-xs font-semibold text-blue-700">
                              {course.credit ?? 0}학점
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                      <p className="text-sm text-gray-500">아직 이수한 과목이 없습니다.</p>
                      <p className="mt-1 text-xs text-gray-400">성적표를 업로드하면 자동으로 반영됩니다.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
