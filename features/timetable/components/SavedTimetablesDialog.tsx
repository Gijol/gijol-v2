import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SavedTimetablesManager } from './SavedTimetablesManager';

interface SavedTimetablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SavedTimetablesDialog({ open, onOpenChange }: SavedTimetablesDialogProps) {
  const handleLoadTimetable = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight">저장된 시간표</DialogTitle>
          <p className="mt-1 text-sm font-medium text-slate-500">
            저장된 시간표를 불러와서 수정하거나 삭제할 수 있습니다
          </p>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pb-6">
          <SavedTimetablesManager onLoadTimetable={handleLoadTimetable} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
