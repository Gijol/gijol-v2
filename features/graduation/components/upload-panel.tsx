// components/graduation/GradUploadPanel.tsx
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/router';
import { Upload, Sparkles, Download, RotateCcw, FileSpreadsheet } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader } from '@components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import type { UserStatusType } from '@lib/types/index';
import type { GradStatusRequestBody, GradStatusResponseType, TakenCourseType } from '@lib/types/grad';
import { gradStatusFetchFn, inferEntryYear, toTakenCourses } from '@utils/graduation/grad-status-helper';
import { useGraduationStore } from '@/lib/stores/useGraduationStore';
import { PARSED_EDITABLE_STATE_KEY } from '@/lib/stores/storage-key';
import { uploadGradeReportViaApi } from '@utils/graduation/upload-grade-report-via-api';

type GradUploadPanelProps = {
  title?: string;
  redirectTo?: string;
  children?: (ctx: {
    parsed: UserStatusType | null;
    gradStatus: GradStatusResponseType | null;
    isParsing: boolean;
  }) => React.ReactNode;
};

export function GradUploadPanel({ title = '졸업요건 파서', redirectTo, children }: GradUploadPanelProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isFetchingGradStatus, setIsFetchingGradStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { parsed, gradStatus, setFromParsed, reset } = useGraduationStore();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // We have a separate button for clicking if we want, or we can allow click on the zone
    multiple: false,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleParse = async () => {
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      const res = (await uploadGradeReportViaApi(file)) as UserStatusType;

      const tc: TakenCourseType[] = toTakenCourses(res);
      const entryYear = inferEntryYear(res);
      const userMajor = (res as any).major || (res as any).department || undefined;

      if (!entryYear) {
        setError('학번(입학년도)을 파싱할 수 없습니다. studentId 또는 entryYear 정보를 확인해주세요.');
      }

      const payload: GradStatusRequestBody = {
        entryYear: entryYear ?? new Date().getFullYear(),
        takenCourses: tc,
        userMajor,
        userMinors: [],
      };

      setIsFetchingGradStatus(true);
      let grad: GradStatusResponseType | null = null;

      try {
        grad = await gradStatusFetchFn(payload);
      } catch (e: any) {
        console.error('grad status fetch error', e);
        setError(e?.message || String(e));
      } finally {
        setIsFetchingGradStatus(false);
      }

      setFromParsed({
        parsed: res,
        takenCourses: tc,
        gradStatus: grad ?? null,
        userMajor: '',
      });

      try {
        localStorage.setItem(PARSED_EDITABLE_STATE_KEY, JSON.stringify(res));
      } catch {
        // ignore
      }

      if (redirectTo) {
        await router.push(redirectTo);
      }
    } catch (e: any) {
      console.error('handleParse error:', e);

      if (e instanceof Error) {
        if (e.message === 'INVALID_GRADE_REPORT') {
          setError(
            'GIST 제우스 성적표 양식이 아닌 파일입니다.\n' +
              '제우스 → 성적 → 개인성적조회 → "Report card(KOR)" 엑셀 파일을 다시 업로드해주세요.',
          );
        } else if (e.message === 'UPLOAD_REQUEST_TIMEOUT') {
          setError(
            '업로드/파싱 요청 시간이 초과되었습니다. 파일이 제우스 성적표 양식이 맞는지 확인하시고, 네트워크 상태를 점검한 후 다시 시도해주세요.',
          );
        } else {
          setError('파일을 처리하는 도중 예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('파일을 처리하는 도중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const onDownload = () => {
    if (!parsed) return setError('다운로드할 데이터가 없습니다.');
    const blob = new Blob([JSON.stringify(parsed, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gijol_parsed_grad.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setError(null);
    setFile(null);
    reset();
    try {
      localStorage.removeItem(PARSED_EDITABLE_STATE_KEY);
    } catch {
      // ignore
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen w-full px-4 pt-6 pb-8 sm:px-6 lg:px-8">
      {/* Header - Dashboard 스타일 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">📤 성적표 업로드</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          GIST 제우스 성적표를 업로드하여 졸업요건을 분석해보세요.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="mb-6 p-0">
        <CardHeader className="border-b border-slate-300 p-4">
          <div className="flex items-center gap-2">
            <Upload className="text-muted-foreground h-5 w-5" />
            <span className="text-foreground font-semibold">파일 업로드</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* 도움말 버튼 */}
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-sm font-normal text-blue-500 hover:bg-transparent hover:text-blue-600"
                  >
                    어떤 파일을 올려야 하나요?
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] max-w-[90%] overflow-y-auto sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>성적표 파일 업로드 가이드</DialogTitle>
                    <DialogDescription>
                      아래 순서에 따라 엑셀 파일을 다운로드하고 업로드해주세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Step 1 */}
                    <div className="space-y-2">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          1
                        </span>
                        ZEUS 시스템에 접속해주세요
                      </h3>
                      <p className="text-muted-foreground pl-8 text-sm">
                        먼저{' '}
                        <a
                          href="https://zeus.gist.ac.kr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline underline-offset-4 hover:text-blue-600"
                        >
                          zeus.gist.ac.kr
                        </a>
                        에 접속하여 로그인해주세요.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-2">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          2
                        </span>
                        개인성적조회 페이지로 이동해주세요
                      </h3>
                      <p className="text-muted-foreground pl-8 text-sm">
                        왼쪽 메뉴에서 <strong>[성적]</strong> 탭을 클릭한 후,{' '}
                        <strong>[개인성적조회]</strong> 버튼을 눌러주세요.
                      </p>
                      <div className="mt-2 pl-8">
                        <img
                          src="/images/explainPic2.png"
                          alt="성적 탭에서 개인성적조회 메뉴 위치"
                          className="w-full rounded-md border shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-2">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          3
                        </span>
                        엑셀 파일로 저장해주세요
                      </h3>
                      <p className="text-muted-foreground pl-8 text-sm">
                        화면 상단에 보이는 <strong>[Report card(KOR)]</strong> 버튼을 클릭하면
                        엑셀 파일이 다운로드됩니다.
                      </p>
                      <div className="mt-2 pl-8">
                        <img
                          src="/images/explainPic3.png"
                          alt="엑셀 저장 버튼 위치"
                          className="w-full rounded-md border shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="space-y-2">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          4
                        </span>
                        다운로드 받은 파일을 업로드해주세요
                      </h3>
                      <p className="text-muted-foreground pl-8 text-sm">
                        다운로드 받은 <strong>Report card(KOR)</strong> 엑셀 파일을 이 페이지에
                        드래그하거나 클릭하여 업로드해주세요.
                      </p>
                    </div>

                    {/* 주의사항 */}
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                      <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0 text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        <div className="text-sm">
                          <h4 className="mb-1 font-semibold text-red-600 dark:text-red-400">
                            주의사항
                          </h4>
                          <p className="text-red-600/90 dark:text-red-400/90">
                            반드시 위 경로를 통해 다운로드 받은 엑셀 파일이어야 합니다. 다른 경로의
                            파일이나 임의로 수정한 파일은 정상적으로 인식되지 않아 서비스 이용이
                            불가능할 수 있어요. 꼭 확인 부탁드려요!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                'flex h-[140px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-700',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50',
              )}
              onClick={open}
            >
              <input {...getInputProps()} />
              <div className="px-4 text-center">
                {!file ? (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="text-muted-foreground h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                      여기에 엑셀 파일을 드롭하거나 클릭하여 업로드해주세요.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      제우스 → 성적 → 개인성적조회 → "Report card(KOR)" 엑셀 파일
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-emerald-600">✓ 선택됨</span>
                  </div>
                )}
              </div>
            </div>

            {/* 버튼 그룹 - 주요 액션과 보조 액션 분리 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* 주요 액션: 분석하기 버튼 */}
              <Button
                onClick={handleParse}
                disabled={!file || isParsing}
                size="lg"
                className={cn(
                  'group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30',
                  file && !isParsing && 'animate-pulse-subtle',
                )}
              >
                <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                {isParsing ? '분석 중...' : '성적표 분석하기'}
              </Button>

              {/* 보조 액션 그룹 */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={open} variant="outline" size="sm" className="gap-1.5">
                  <FileSpreadsheet className="h-4 w-4" />
                  파일 선택
                </Button>
                <Button onClick={onDownload} disabled={!parsed} variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  JSON 다운로드
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  size="sm"
                  className="gap-1.5 text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  리셋
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 파싱/계산 상태 표시 (간소화) */}
      {(isParsing || isFetchingGradStatus) && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {isParsing ? '성적표를 분석하고 있어요...' : '졸업요건을 계산하고 있어요...'}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm whitespace-pre-line text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span className="font-semibold">오류:</span> {error}
        </div>
      )}

      {children && (
        <div className="mt-6">{children({ parsed, gradStatus, isParsing: isParsing || isFetchingGradStatus })}</div>
      )}
    </div>
  );
}
