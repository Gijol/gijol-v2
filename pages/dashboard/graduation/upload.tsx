import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { gradStatusFetchFn, inferEntryYear, toTakenCourses } from '@utils/graduation/grad-status-helper';
import type { EditableCourseRow } from '@lib/types/graduation-editable';
import { applyEditableRowsToUserStatus, toEditableRows } from '@utils/graduation/parse-to-editable-rows';
import { ParsedCourseEditableTable } from '@components/graduation/parse-course-editable-table';
import { GradUploadPanel } from '@components/graduation/upload-panel';
import { UploadResultSkeleton } from '@components/graduation/upload-skeleton';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';

import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { MultiSelect } from '@components/ui/multi-select';

export default function GraduationParsePage() {
  const router = useRouter();
  const { parsed, setFromParsed } = useGraduationStore();
  const [rows, setRows] = useState<EditableCourseRow[]>([]);
  const [saving, setSaving] = useState(false);

  // 입학년도 / 전공 / 부전공 입력 상태
  const [entryYear, setEntryYear] = useState<number>(2020);
  const [major, setMajor] = useState<string>('');
  const [minors, setMinors] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // parsed가 바뀌면 editable rows 초기화
  useEffect(() => {
    if (!isHydrated) return;

    if (parsed) {
      setRows(toEditableRows(parsed));

      const inferred = inferEntryYear(parsed);
      if (inferred) {
        setEntryYear(inferred);
      } else {
        setEntryYear(2020);
      }

      // 전공 추론 (parsedMajor가 한글일 수 있으므로 MAJOR_OPTIONS에서 검색)
      const parsedMajor = (parsed as any).major || (parsed as any).department || '';
      let matchedMajor = parsedMajor;

      // 만약 parsedMajor가 한글이라면(혹은 Code가 아니라면), Label로 검색
      const foundOption = MAJOR_OPTIONS.find(
        (opt) => opt.value === parsedMajor || opt.label.includes(parsedMajor) || parsedMajor.includes(opt.label),
      );
      if (foundOption) {
        matchedMajor = foundOption.value;
      }

      setMajor(matchedMajor);
      setMinors([]); // Init minors as empty
    } else {
      setRows([]);
      setEntryYear(2020);
      setMajor('');
      setMinors([]);
    }
  }, [parsed]);

  const handleChangeRow = (id: string, patch: Partial<EditableCourseRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        year: '',
        semester: '',
        courseType: '',
        courseCode: '',
        courseName: '',
        credit: '',
        grade: '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApplyAndGo = async () => {
    if (!parsed) return;
    setSaving(true);

    try {
      const updated = applyEditableRowsToUserStatus(parsed, rows);
      const takenCourses = toTakenCourses(updated);

      // 1차: UI에서 선택된 entryYear 사용
      // 2차: 데이터 기반 재추론
      // 3차: fallback = 2020
      const inferredFromData = inferEntryYear(updated);
      const finalEntryYear =
        typeof entryYear === 'number' && !Number.isNaN(entryYear)
          ? entryYear
          : (inferredFromData ?? new Date().getFullYear());

      // 2018 이전 학번은 서비스 대상이 아니므로, 여기서 방어적으로 처리할 수도 있음
      // (단순 경고용으로 쓰고, 로직은 그대로 돌릴 수도)
      // if (finalEntryYear < 2018) {
      //   // TODO: UI에서 경고 메시지 보여주기 등
      // }

      const fallbackMajor = (updated as any).major || (updated as any).department || undefined;

      const userMajor = major || fallbackMajor;

      const payload = {
        entryYear: finalEntryYear,
        takenCourses,
        userMajor,
        userMinors: minors,
      };

      const grad = await gradStatusFetchFn(payload);

      setFromParsed({
        parsed: updated,
        takenCourses,
        gradStatus: grad,
        userMajor,
        userMinors: minors,
        entryYear: finalEntryYear,
      });

      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const majorOptions = MAJOR_OPTIONS;
  const minorOptions = MINOR_OPTIONS;

  return (
    <GradUploadPanel>
      {({ parsed, isParsing }) => {
        if (!isHydrated) return null;

        // 파싱 중일 때 스켈레톤 UI 표시
        if (isParsing) {
          return <UploadResultSkeleton />;
        }

        if (!parsed) {
          return (
            <Card className="border-dashed border-slate-300 bg-gray-50 dark:bg-gray-800/30">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  아직 분석된 데이터가 없습니다. 위에서 파일을 업로드하고 "성적표 분석하기"를 눌러 주세요.
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <div className="mt-10 flex flex-col gap-6">
            {/* Section Header */}
            <div>
              <h2 className="text-foreground mb-1 text-xl font-semibold">📝 파싱 결과 확인 및 수정</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                아래에서 파싱된 수강 내역을 확인하고, 필요하다면 직접 수정하거나 행을 추가/삭제할 수 있습니다.
              </p>
            </div>

            {/* 입학년도/전공/부전공 카드 */}
            <Card className="border-slate-300 p-0">
              <CardHeader className="border-b border-slate-300 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-semibold">학적 정보</span>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    2018학번 이후만 지원됩니다!
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="entryYear">입학년도 (학번 기준)</Label>
                    <Input
                      id="entryYear"
                      type="number"
                      placeholder="예: 2021"
                      value={entryYear}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : 2020;
                        setEntryYear(val);
                      }}
                      min={2010}
                      max={new Date().getFullYear()}
                      step={1}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>전공</Label>
                    <Select value={major} onValueChange={setMajor}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="전공을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {majorOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>부전공 (선택)</Label>
                    <MultiSelect
                      options={minorOptions}
                      selected={minors}
                      onChange={setMinors}
                      placeholder="부전공을 선택하세요"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 수강 목록 테이블 */}
            <ParsedCourseEditableTable
              rows={rows}
              onChangeRow={handleChangeRow}
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
            />

            {/* CTA 버튼 */}
            <div className="flex justify-center py-6">
              <Button
                onClick={handleApplyAndGo}
                disabled={saving}
                size="lg"
                className="bg-[#0B62DA] text-white shadow-lg shadow-blue-500/25 hover:bg-[#0952B8]"
              >
                {saving ? '저장 중...' : '수정 내용 적용 & 졸업요건 페이지로 이동'}
              </Button>
            </div>
          </div>
        );
      }}
    </GradUploadPanel>
  );
}
