'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Settings } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { MultiSelect } from '@components/ui/multi-select';
import { MinorDeclarationTermFields } from '@components/dashboard/minor-declaration-term-fields';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';
import { gradStatusFetchFn } from '@utils/graduation/grad-status-helper';
import { useToast } from '@components/ui/use-toast';
import type { MinorDeclarationTerms } from '@lib/types/grad';
import { pruneMinorDeclarationTerms } from '@utils/graduation/minor-declaration-terms';

interface UserInfoEditDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

export function UserInfoEditDialog({ open: controlledOpen, onOpenChange, trigger }: UserInfoEditDialogProps = {}) {
  const { toast } = useToast();
  const {
    parsed,
    userMajor,
    userMinors,
    minorDeclarationTerms: storedMinorDeclarationTerms,
    entryYear,
    updateAcademicContext,
  } = useGraduationStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Form states
  const [year, setYear] = useState<number>(entryYear ?? new Date().getFullYear());
  const [major, setMajor] = useState<string>(userMajor);
  const [minors, setMinors] = useState<string[]>(userMinors ?? []);
  const [minorDeclarationTerms, setMinorDeclarationTerms] = useState<MinorDeclarationTerms>({});

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setYear(entryYear ?? 2020);
      setMajor(userMajor);
      setMinors(userMinors ?? []);
      setMinorDeclarationTerms(pruneMinorDeclarationTerms(storedMinorDeclarationTerms, userMinors ?? []));
    }
    setOpen(isOpen);
  };

  const handleChangeMinors = (nextMinors: string[]) => {
    setMinors(nextMinors);
    setMinorDeclarationTerms((prev) => pruneMinorDeclarationTerms(prev, nextMinors));
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);

    try {
      const takenCourses = useGraduationStore.getState().takenCourses;

      if (!takenCourses || takenCourses.length === 0) {
        toast({
          title: '오류',
          description: '수강 내역 정보가 없습니다. 성적표를 먼저 업로드해주세요.',
          variant: 'destructive',
        });
        return;
      }

      const finalMinorDeclarationTerms = pruneMinorDeclarationTerms(minorDeclarationTerms, minors);

      const payload = {
        entryYear: year,
        takenCourses,
        userMajor: major,
        userMinors: minors,
        minorDeclarationTerms: finalMinorDeclarationTerms,
      };

      const grad = await gradStatusFetchFn(payload);

      updateAcademicContext({
        gradStatus: grad,
        userMajor: major,
        userMinors: minors,
        minorDeclarationTerms: finalMinorDeclarationTerms,
        entryYear: year,
      });

      toast({
        title: '저장 완료',
        description: '회원 정보와 졸업 요건이 업데이트되었습니다.',
      });

      setOpen(false);
    } catch (e) {
      console.error(e);
      toast({
        title: '저장 실패',
        description: '정보를 업데이트하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="lg"
            className="group gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
          >
            <Settings className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            정보 수정 및 재계산
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>내 정보 수정</DialogTitle>
          <DialogDescription>입학년도, 전공, 부전공 정보를 수정하면 졸업 요건이 다시 계산됩니다.</DialogDescription>
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
                onChange={handleChangeMinors}
                placeholder="부전공 선택 (선택)"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <div className="hidden sm:block" />
            <div className="col-span-4 sm:col-span-3">
              <MinorDeclarationTermFields
                selectedMinors={minors}
                terms={minorDeclarationTerms}
                onChange={setMinorDeclarationTerms}
                compact
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
