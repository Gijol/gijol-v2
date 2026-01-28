import React from 'react';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Trash2, Calendar, Clock } from 'lucide-react';

interface SavedTimetablesManagerProps {
  onLoadTimetable?: () => void;
}

export function SavedTimetablesManager({ onLoadTimetable }: SavedTimetablesManagerProps) {
  const loadTimetable = useTimetableStore((state) => state.loadTimetable);
  const deleteTimetable = useTimetableStore((state) => state.deleteTimetable);
  const savedTimetables = useTimetableStore((state) => state.savedTimetables);

  // Derive the list from the savedTimetables state
  const savedTimetablesList = React.useMemo(() => {
    return Object.entries(savedTimetables)
      .map(([name, data]) => ({
        name,
        savedAt: data.savedAt,
      }))
      .sort((a, b) => b.savedAt - a.savedAt);
  }, [savedTimetables]);

  const handleLoad = (name: string) => {
    loadTimetable(name);
    onLoadTimetable?.();
  };

  const handleDelete = (name: string) => {
    const confirmDelete = window.confirm(`"${name}" 시간표를 삭제하시겠습니까?`);
    if (confirmDelete) {
      deleteTimetable(name);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (savedTimetablesList.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <p className="text-sm font-black tracking-tight text-slate-400 uppercase">저장된 시간표가 없습니다</p>
        <p className="mt-2 text-xs font-bold text-slate-300">선택된 강의에서 시간표를 저장해 보세요</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-auto max-h-[400px]">
      <div className="space-y-2 pr-4">
        {savedTimetablesList.map((timetable) => (
          <div
            key={timetable.name}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-blue-400 hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold tracking-tight text-slate-900">{timetable.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <Clock size={12} />
                {formatDate(timetable.savedAt)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoad(timetable.name)}
                className="h-9 border-blue-200 px-3 font-bold text-blue-600 transition-colors hover:border-blue-500 hover:bg-blue-50"
              >
                <Download size={16} className="mr-1.5" />
                불러오기
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(timetable.name)}
                className="h-9 rounded-lg px-3 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={16} className="mr-1.5" />
                삭제
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
