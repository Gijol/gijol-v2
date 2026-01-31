import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectedSectionList } from './SelectedSectionList';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, Check, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SelectedCoursesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SelectedCoursesDialog({ open, onOpenChange }: SelectedCoursesDialogProps) {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [timetableName, setTimetableName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const saveTimetable = useTimetableStore((state) => state.saveTimetable);
  const selectedSections = useTimetableStore((state) => state.selectedSections);
  const reset = useTimetableStore((state) => state.reset);

  const handleSave = async () => {
    if (timetableName.trim()) {
      setIsSaving(true);
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 300));
      saveTimetable(timetableName.trim());
      setIsSaving(false);
      setShowSaveSuccess(true);
      setTimetableName('');
      setShowSaveInput(false);

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 2000);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setShowSaveInput(false);
      setTimetableName('');
      setShowSaveSuccess(false);
    }
    onOpenChange(isOpen);
  };

  const handleReset = () => {
    const confirmReset = window.confirm('현재 선택된 강의들이 모두 초기화됩니다. 계속하시겠습니까?');
    if (confirmReset) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight">선택된 강의 목록</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6">
          <SelectedSectionList hideResetButton />
        </div>

        {selectedSections.length > 0 && (
          <>
            <Separator className="mt-4" />
            <div className="space-y-3 bg-slate-50/50 p-6 pt-4">
              {/* Success Message */}
              {showSaveSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
                  <Check size={18} className="text-green-600" />
                  시간표가 성공적으로 저장되었습니다!
                </div>
              )}

              {showSaveInput ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="시간표 이름을 입력하세요..."
                    value={timetableName}
                    onChange={(e) => setTimetableName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') {
                        setShowSaveInput(false);
                        setTimetableName('');
                      }
                    }}
                    autoFocus
                    className="flex-1 border-slate-200 bg-white text-sm font-medium focus-visible:ring-blue-500"
                    disabled={isSaving}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={!timetableName.trim() || isSaving}
                    className="min-w-[80px] bg-blue-600 font-bold tracking-tight hover:bg-blue-700"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : '저장'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSaveInput(false);
                      setTimetableName('');
                    }}
                    variant="outline"
                    className="font-bold tracking-tight"
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-11 flex-1 border-red-200 text-xs font-black tracking-wider text-red-500 uppercase transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} className="mr-2" />
                    시간표 초기화
                  </Button>
                  <Button
                    onClick={() => setShowSaveInput(true)}
                    className="h-11 flex-1 bg-blue-600 font-bold tracking-tight hover:bg-blue-700"
                  >
                    <Save size={18} className="mr-2" />
                    현재 시간표 저장하기
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
