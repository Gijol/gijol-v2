import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  gradStatusFetchFn,
  inferEntryYear,
  toTakenCourses,
} from '@utils/graduation/grad-status-helper';
import type { EditableCourseRow } from '@lib/types/graduation-editable';
import { v4 as uuid } from 'uuid';
import {
  applyEditableRowsToUserStatus,
  toEditableRows,
} from '@utils/graduation/parse-to-editable-rows';
import { ParsedCourseEditableTable } from '@components/graduation/parse-course-editable-table';
import { GradUploadPanel } from '@components/graduation/upload-panel';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';

import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Label } from '@components/ui/label';
import { Combobox } from '@components/ui/combobox';
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

  // parsed가 바뀌면 editable rows 초기화
  useEffect(() => {
    if (parsed) {
      setRows(toEditableRows(parsed));

      const inferred = inferEntryYear(parsed);
      if (inferred) {
        setEntryYear(inferred);
      } else {
        setEntryYear(2020);
      }

      // 전공 추론
      const parsedMajor = (parsed as any).major || (parsed as any).department || '';
      setMajor(parsedMajor);

      // 부전공: 배열 그대로 반영
      const parsedMinors: string[] = (parsed as any).minors || (parsed as any).userMinors || [];
      setMinors(parsedMinors);
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
        id: uuid(),
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
          : inferredFromData ?? new Date().getFullYear();

      // 2018 이전 학번은 서비스 대상이 아니므로, 여기서 방어적으로 처리할 수도 있음
      // (단순 경고용으로 쓰고, 로직은 그대로 돌릴 수도)
      // if (finalEntryYear < 2018) {
      //   // TODO: UI에서 경고 메시지 보여주기 등
      // }

      const fallbackMajor = (updated as any).major || (updated as any).department || undefined;

      const userMajor = major || fallbackMajor;

      const userMinors = minors;
      const payload = {
        entryYear: finalEntryYear,
        takenCourses,
        userMajor,
        userMinors,
      };

      const grad = await gradStatusFetchFn(payload);

      setFromParsed({
        parsed: updated,
        takenCourses,
        gradStatus: grad,
        userMajor,
      });

      router.push('/dashboard/graduation');
    } finally {
      setSaving(false);
    }
  };

  const majorOptions = MAJOR_OPTIONS;
  const minorOptions = MINOR_OPTIONS;

  return (
    <GradUploadPanel title="졸업요건 파서 · 파싱 결과 확인 및 수정">
      {({ parsed }) => {
        if (!parsed) {
          return (
            <p className="text-gray-500 dark:text-gray-400">
              아직 파싱된 데이터가 없습니다. 파일을 업로드하고 &quot;파싱 및 졸업요건 계산&quot;을
              눌러 주세요.
            </p>
          );
        }

        return (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              아래에서 파싱된 수강 내역을 확인하고, 필요하다면 직접 수정하거나 행을 추가/삭제할 수
              있습니다.
            </p>

            {/* 입학년도 필드: inferEntryYear로 자동 채워주고, 수정 가능 */}
            <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
              <CardContent className="p-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  2018학번 이후만 현재 서비스 대상입니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
                    <Combobox
                      options={majorOptions}
                      value={major}
                      onChange={setMajor}
                      placeholder="전공을 선택하세요"
                      searchPlaceholder="전공 검색..."
                      emptyText="해당 전공이 없습니다"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>부전공(선택)</Label>
                    <MultiSelect
                      options={minorOptions}
                      selected={minors}
                      onChange={setMinors}
                      placeholder="부전공을 복수 선택하세요"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <ParsedCourseEditableTable
              rows={rows}
              onChangeRow={handleChangeRow}
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
            />

            <div className="flex justify-center my-6">
              <Button onClick={handleApplyAndGo} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
                {saving ? "저장 중..." : "수정 내용 적용 & 졸업요건 페이지로 이동"}
              </Button>
            </div>
          </div>
        );
      }}
    </GradUploadPanel>
  );
}
