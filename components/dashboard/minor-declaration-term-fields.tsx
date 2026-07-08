'use client';

import type { MinorDeclarationTerms } from '@lib/types/grad';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Badge } from '@components/ui/badge';
import { MINOR_OPTIONS } from '@const/major-minor-options';
import { getDeclarationTermRequiredMinors } from '@utils/graduation/minor-declaration-terms';

interface MinorDeclarationTermFieldsProps {
  selectedMinors: string[];
  terms: MinorDeclarationTerms;
  onChange: (terms: MinorDeclarationTerms) => void;
  compact?: boolean;
}

function getMinorLabel(minorCode: string): string {
  return MINOR_OPTIONS.find((option) => option.value === minorCode)?.label ?? minorCode;
}

export function MinorDeclarationTermFields({
  selectedMinors,
  terms,
  onChange,
  compact = false,
}: MinorDeclarationTermFieldsProps) {
  const requiredMinors = getDeclarationTermRequiredMinors(selectedMinors);

  if (requiredMinors.length === 0) return null;

  const updateTerm = (minorCode: string, nextTerm?: { year: number; semester: string }) => {
    const nextTerms = { ...terms };

    if (nextTerm) {
      nextTerms[minorCode] = nextTerm;
    } else {
      delete nextTerms[minorCode];
    }

    onChange(nextTerms);
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-950">부전공 선언 학기</p>
          <p className="mt-0.5 text-xs text-amber-800">AI융합/지능로봇 부전공 판정에 필요합니다.</p>
        </div>
        <Badge variant="outline" className="shrink-0 border-amber-300 bg-white text-amber-800">
          확인 필요
        </Badge>
      </div>

      <div className={compact ? 'space-y-3' : 'grid grid-cols-1 gap-3 md:grid-cols-2'}>
        {requiredMinors.map((minorCode) => {
          const term = terms[minorCode];

          return (
            <div key={minorCode} className="rounded-md border border-amber-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-900">{getMinorLabel(minorCode)}</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {minorCode}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`minor-declaration-year-${minorCode}`} className="text-xs text-slate-600">
                    선언 연도
                  </Label>
                  <Input
                    id={`minor-declaration-year-${minorCode}`}
                    type="number"
                    inputMode="numeric"
                    min={2010}
                    max={new Date().getFullYear() + 1}
                    value={term?.year ?? ''}
                    placeholder="예: 2025"
                    onChange={(event) => {
                      const rawValue = event.target.value;
                      if (!rawValue) {
                        updateTerm(minorCode);
                        return;
                      }

                      const year = Number(rawValue);
                      if (!Number.isFinite(year)) return;

                      updateTerm(minorCode, {
                        year,
                        semester: term?.semester ?? '1',
                      });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`minor-declaration-semester-${minorCode}`} className="text-xs text-slate-600">
                    선언 학기
                  </Label>
                  <Select
                    value={term?.semester ?? ''}
                    disabled={!term?.year}
                    onValueChange={(semester) => {
                      if (!term?.year) return;
                      updateTerm(minorCode, {
                        year: term.year,
                        semester,
                      });
                    }}
                  >
                    <SelectTrigger id={`minor-declaration-semester-${minorCode}`} className="w-full">
                      <SelectValue placeholder="학기" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1학기</SelectItem>
                      <SelectItem value="2">2학기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
