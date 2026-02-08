'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Settings } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { MultiSelect } from '@components/ui/multi-select';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';
import { gradStatusFetchFn, toTakenCourses } from '@utils/graduation/grad-status-helper';
import { useToast } from '@components/ui/use-toast';

export function UserInfoEditDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const { parsed, userMajor, userMinors, entryYear, setFromParsed } = useGraduationStore();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [year, setYear] = useState<number>(entryYear ?? new Date().getFullYear());
  const [major, setMajor] = useState<string>(userMajor);
  const [minors, setMinors] = useState<string[]>(userMinors ?? []);

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setYear(entryYear ?? 2020);
      setMajor(userMajor);
      setMinors(userMinors ?? []);
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);

    try {
      // Create payload with updated metadata
      // Existing taken courses are preserved from parsed data
      // We need to re-fetch grad status because major/minor/year affects requirements
     
      // Note: We need to use valid takenCourses. 
      // Since we don't have direct access to 'rows' like in upload page,
      // we can reuse 'parsed' or 'takenCourses' from store if available.
      // Ideally 'takenCourses' in store is already processed.
      const takenCourses = useGraduationStore.getState().takenCourses;
      
      if (!takenCourses || takenCourses.length === 0) {
        toast({
          title: "오류",
          description: "수강 내역 정보가 없습니다. 성적표를 먼저 업로드해주세요.",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        entryYear: year,
        takenCourses,
        userMajor: major,
        userMinors: minors,
      };

      const grad = await gradStatusFetchFn(payload);

      setFromParsed({
        parsed, // Keep original parsed raw data
        takenCourses,
        gradStatus: grad,
        userMajor: major,
        userMinors: minors,
        entryYear: year,
      });

      toast({
        title: "저장 완료",
        description: "회원 정보와 졸업 요건이 업데이트되었습니다.",
      });
      
      setOpen(false);
      
      // Refresh current page to ensure everything reflects new state
      // router.replace(router.asPath); 
    } catch (e) {
      console.error(e);
      toast({
        title: "저장 실패",
        description: "정보를 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="group gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800">
          <Settings className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
          정보 수정 및 재계산
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>내 정보 수정</DialogTitle>
          <DialogDescription>
            입학년도, 전공, 부전공 정보를 수정하면 졸업 요건이 다시 계산됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              입학년도
            </Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="major" className="text-right">
              전공
            </Label>
            <div className="col-span-3">
              <Select value={major} onValueChange={setMajor}>
                <SelectTrigger>
                  <SelectValue placeholder="전공 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {MAJOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minors" className="text-right">
              부전공
            </Label>
            <div className="col-span-3">
              <MultiSelect
                options={MINOR_OPTIONS}
                selected={minors}
                onChange={setMinors}
                placeholder="부전공 선택 (선택)"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={saving}>
             {saving ? '저장 중...' : '저장하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
