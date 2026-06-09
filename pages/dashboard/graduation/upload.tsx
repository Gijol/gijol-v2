import React, { useState, useEffect, useRef } from 'react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { gradStatusFetchFn, inferEntryYear, toTakenCourses } from '@utils/graduation/grad-status-helper';
import type { EditableCourseRow } from '@lib/types/graduation-editable';
import type { MinorDeclarationTerms } from '@lib/types/grad';
import type { UserStatusType } from '@lib/types/index';
import { applyEditableRowsToUserStatus, toEditableRows } from '@utils/graduation/parse-to-editable-rows';
import { ParsedCourseEditableTable } from '@/features/graduation/components/parse-course-editable-table';
import { GradUploadPanel } from '@/features/graduation/components/upload-panel';
import { UploadResultSkeleton } from '@/features/graduation/components/upload-skeleton';
import { MinorDeclarationTermFields } from '@components/dashboard/minor-declaration-term-fields';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';
import { resolveMajorForEvaluation } from '@features/graduation/domain';
import { pruneMinorDeclarationTerms } from '@utils/graduation/minor-declaration-terms';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';
import { PARSED_EDITABLE_STATE_KEY, PARSED_PROCESSED_STATE_KEY } from '../../../lib/stores/storage-key';

import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { MultiSelect } from '@components/ui/multi-select';

function isParsedUserStatus(value: unknown): value is UserStatusType {
  return Boolean(
    value &&
    typeof value === 'object' &&
    Array.isArray((value as { userTakenCourseList?: unknown }).userTakenCourseList),
  );
}

type StoredParsedSnapshot = {
  parsed: UserStatusType;
  entryYear?: number | null;
  userMajor?: string;
  userMinors?: string[];
  minorDeclarationTerms?: MinorDeclarationTerms;
};

function readStoredParsedSnapshot(): StoredParsedSnapshot | null {
  if (typeof window === 'undefined') return null;

  const candidates = [
    { key: PARSED_PROCESSED_STATE_KEY, fromPersistedStore: true },
    { key: PARSED_EDITABLE_STATE_KEY, fromPersistedStore: false },
  ];

  for (const candidate of candidates) {
    const raw = window.localStorage.getItem(candidate.key);
    if (!raw) continue;

    try {
      const parsedStorage = JSON.parse(raw);
      if (candidate.fromPersistedStore) {
        const state = parsedStorage?.state;
        if (isParsedUserStatus(state?.parsed)) {
          return {
            parsed: state.parsed,
            entryYear: state.entryYear,
            userMajor: state.userMajor,
            userMinors: Array.isArray(state.userMinors) ? state.userMinors : [],
            minorDeclarationTerms:
              state.minorDeclarationTerms && typeof state.minorDeclarationTerms === 'object'
                ? state.minorDeclarationTerms
                : undefined,
          };
        }
      }

      if (isParsedUserStatus(parsedStorage)) return { parsed: parsedStorage };
    } catch {
      // Ignore malformed local storage and keep looking for another usable snapshot.
    }
  }

  return null;
}

function resolveMajorFromParsed(parsed: UserStatusType, takenCourses = toTakenCourses(parsed)): string {
  const parsedMajor = (parsed as any).major || (parsed as any).department || undefined;
  const majorResolution = resolveMajorForEvaluation(parsedMajor, takenCourses);
  return majorResolution.code ?? (parsedMajor ? String(parsedMajor) : '');
}

export default function GraduationParsePage() {
  const router = useRouter();
  const {
    parsed,
    userMajor: storedUserMajor,
    userMinors: storedUserMinors,
    minorDeclarationTerms: storedMinorDeclarationTerms,
    entryYear: storedEntryYear,
    setFromParsed,
  } = useGraduationStore();
  const [rows, setRows] = useState<EditableCourseRow[]>([]);
  const [saving, setSaving] = useState(false);
  const restoreAttemptedRef = useRef(false);

  // 입학년도 / 전공 / 부전공 입력 상태
  const [entryYear, setEntryYear] = useState<number>(2020);
  const [major, setMajor] = useState<string>('');
  const [minors, setMinors] = useState<string[]>([]);
  const [minorDeclarationTerms, setMinorDeclarationTerms] = useState<MinorDeclarationTerms>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || parsed || restoreAttemptedRef.current) return;
    restoreAttemptedRef.current = true;

    const restored = readStoredParsedSnapshot();
    if (!restored) return;

    const takenCourses = toTakenCourses(restored.parsed);
    const entryYearFromRestored = inferEntryYear(restored.parsed);
    const userMajor = restored.userMajor || resolveMajorFromParsed(restored.parsed, takenCourses);
    const userMinors = restored.userMinors ?? [];

    setFromParsed({
      parsed: restored.parsed,
      takenCourses,
      gradStatus: null,
      userMajor,
      userMinors,
      minorDeclarationTerms: pruneMinorDeclarationTerms(restored.minorDeclarationTerms, userMinors),
      entryYear: restored.entryYear ?? entryYearFromRestored ?? undefined,
    });
  }, [isHydrated, parsed, setFromParsed]);

  // parsed가 바뀌면 editable rows 초기화
  useEffect(() => {
    if (!isHydrated) return;

    if (parsed) {
      setRows(toEditableRows(parsed));

      const inferred = inferEntryYear(parsed);
      if (storedEntryYear) {
        setEntryYear(storedEntryYear);
      } else if (inferred) {
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

      const nextMinors = storedUserMinors ?? [];
      setMajor(storedUserMajor || matchedMajor);
      setMinors(nextMinors);
      setMinorDeclarationTerms(pruneMinorDeclarationTerms(storedMinorDeclarationTerms, nextMinors));
    } else {
      setRows([]);
      setEntryYear(2020);
      setMajor('');
      setMinors([]);
      setMinorDeclarationTerms({});
    }
  }, [isHydrated, parsed, storedEntryYear, storedUserMajor, storedUserMinors, storedMinorDeclarationTerms]);

  const handleChangeMinors = (nextMinors: string[]) => {
    setMinors(nextMinors);
    setMinorDeclarationTerms((prev) => pruneMinorDeclarationTerms(prev, nextMinors));
  };

  const handleChangeRow = (id: string, patch: Partial<EditableCourseRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleAddRow = (row: Omit<EditableCourseRow, 'id'>) => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...row,
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
      const explicitMajor = major || fallbackMajor;
      const majorResolution = resolveMajorForEvaluation(explicitMajor, takenCourses);
      const userMajor = majorResolution.code ?? (explicitMajor ? String(explicitMajor) : undefined);
      const finalMinorDeclarationTerms = pruneMinorDeclarationTerms(minorDeclarationTerms, minors);

      const payload = {
        entryYear: finalEntryYear,
        takenCourses,
        userMajor,
        userMinors: minors,
        minorDeclarationTerms: finalMinorDeclarationTerms,
      };

      const grad = await gradStatusFetchFn(payload);

      setFromParsed({
        parsed: updated,
        takenCourses,
        gradStatus: grad,
        userMajor: userMajor ?? '',
        userMinors: minors,
        minorDeclarationTerms: finalMinorDeclarationTerms,
        entryYear: finalEntryYear,
      });

      try {
        localStorage.setItem(PARSED_EDITABLE_STATE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const majorOptions = MAJOR_OPTIONS;
  const minorOptions = MINOR_OPTIONS;

  return (
    <>
      <NextSeo title="성적표 업로드" description="성적표를 업로드하여 졸업요건을 분석하세요" noindex />
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
                        onChange={handleChangeMinors}
                        placeholder="부전공을 선택하세요"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <MinorDeclarationTermFields
                      selectedMinors={minors}
                      terms={minorDeclarationTerms}
                      onChange={setMinorDeclarationTerms}
                    />
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
              <div className="sticky bottom-4 z-20 py-2">
                <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-blue-100 bg-white/95 p-3 shadow-lg shadow-blue-900/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/40 dark:bg-slate-950/95">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">수정 내용 적용</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        현재 수강 목록 {rows.length}과목을 저장하고 졸업요건 화면으로 이동합니다.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleApplyAndGo}
                    disabled={saving || rows.length === 0}
                    size="lg"
                    className="h-10 shrink-0 gap-2 bg-[#0B62DA] px-5 text-white shadow-md shadow-blue-500/20 hover:bg-[#0952B8] sm:min-w-[190px]"
                  >
                    {saving ? '저장 중...' : '저장하고 결과 보기'}
                    {!saving ? <ArrowRight className="h-4 w-4" /> : null}
                  </Button>
                </div>
              </div>
            </div>
          );
        }}
      </GradUploadPanel>
    </>
  );
}
