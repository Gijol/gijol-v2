'use client';

import { useState } from 'react';
import { IconAlertTriangle, IconCircleCheck, IconChevronRight } from '@tabler/icons-react';
import { Progress } from '@components/ui/progress';
import { Badge } from '@components/ui/badge';
import { ScrollArea } from '@components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@components/ui/sheet';
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

// Color palette for different domains
const domainColors: Record<string, { bg: string; progress: string; border: string; icon: string }> = {
  '언어기초': { bg: 'from-blue-50 to-blue-100/50', progress: 'bg-blue-500', border: 'border-blue-200 hover:border-blue-300', icon: 'text-blue-600' },
  '기초과학': { bg: 'from-emerald-50 to-emerald-100/50', progress: 'bg-emerald-500', border: 'border-emerald-200 hover:border-emerald-300', icon: 'text-emerald-600' },
  '전공필수': { bg: 'from-violet-50 to-violet-100/50', progress: 'bg-violet-500', border: 'border-violet-200 hover:border-violet-300', icon: 'text-violet-600' },
  '전공선택': { bg: 'from-purple-50 to-purple-100/50', progress: 'bg-purple-500', border: 'border-purple-200 hover:border-purple-300', icon: 'text-purple-600' },
  '인문사회': { bg: 'from-amber-50 to-amber-100/50', progress: 'bg-amber-500', border: 'border-amber-200 hover:border-amber-300', icon: 'text-amber-600' },
  '일반선택': { bg: 'from-cyan-50 to-cyan-100/50', progress: 'bg-cyan-500', border: 'border-cyan-200 hover:border-cyan-300', icon: 'text-cyan-600' },
  '연구': { bg: 'from-rose-50 to-rose-100/50', progress: 'bg-rose-500', border: 'border-rose-200 hover:border-rose-300', icon: 'text-rose-600' },
};

const defaultColor = { bg: 'from-gray-50 to-gray-100/50', progress: 'bg-gray-500', border: 'border-gray-200 hover:border-gray-300', icon: 'text-gray-600' };

function getColorScheme(domain: string) {
  return domainColors[domain] || defaultColor;
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
      <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-6", className)}>
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span className="text-xl">📋</span> 영역별 이수 현황
        </h2>
        
        {/* Grid Card Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requirements.map((req) => {
            const colors = getColorScheme(req.domain);
            return (
              <button
                key={req.domain}
                onClick={() => handleCardClick(req)}
                className={cn(
                  "group relative text-left p-4 rounded-xl border-2 transition-all duration-200",
                  "bg-gradient-to-br hover:shadow-md hover:-translate-y-0.5",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400",
                  colors.bg,
                  colors.border
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {req.satisfied ? (
                      <IconCircleCheck size={20} className="text-emerald-600" />
                    ) : (
                      <IconAlertTriangle size={20} className="text-amber-500" />
                    )}
                    <span className="font-bold text-gray-900">{req.domain}</span>
                  </div>
                  <Badge
                    variant={req.satisfied ? "default" : "secondary"}
                    className={cn(
                      "text-xs font-bold",
                      req.satisfied 
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                        : "bg-amber-100 text-amber-700 border-amber-200"
                    )}
                  >
                    {req.percentage}%
                  </Badge>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <Progress 
                    value={req.percentage} 
                    className="h-2 bg-white/60"
                  />
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    이수: <span className="font-semibold text-gray-700">{req.earned}학점</span>
                  </span>
                  <span className="text-gray-500">
                    필요: <span className="font-semibold text-gray-700">{req.required}학점</span>
                  </span>
                </div>

                {/* Hover indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconChevronRight size={18} className="text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedRequirement && (
            <>
              <SheetHeader className="pb-4 border-b border-gray-100">
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
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        이수: <span className="font-bold text-gray-900">{selectedRequirement.earned}학점</span>
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">
                        필요: <span className="font-bold text-gray-900">{selectedRequirement.required}학점</span>
                      </span>
                      <Badge
                        variant={selectedRequirement.satisfied ? "default" : "secondary"}
                        className={cn(
                          "ml-auto",
                          selectedRequirement.satisfied 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {selectedRequirement.percentage}%
                      </Badge>
                    </div>
                    <Progress 
                      value={selectedRequirement.percentage} 
                      className="h-2 mt-3"
                    />
                  </div>
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-200px)] mt-4 -mx-6 px-6">
                {/* Warning Messages */}
                {!selectedRequirement.satisfied && selectedRequirement.messages.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <IconAlertTriangle size={16} />
                      주의사항
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedRequirement.messages.map((msg) => (
                        <li key={msg} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course List */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
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
                          className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {course.courseName ?? '-'}
                              </span>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="font-mono">{course.courseCode ?? '-'}</span>
                                <span>
                                  {course.year?.toString().slice(2) ?? '-'}-{course.semester?.toString().replace('학기', '') ?? '-'}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs font-semibold bg-blue-100 text-blue-700">
                              {course.credit ?? 0}학점
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="text-sm text-gray-500">
                        아직 이수한 과목이 없습니다.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        성적표를 업로드하면 자동으로 반영됩니다.
                      </p>
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
