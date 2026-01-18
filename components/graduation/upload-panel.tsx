// components/graduation/GradUploadPanel.tsx
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/router';
import { Upload } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader } from '@components/ui/card';
import Loading from '@components/loading';
import { cn } from '@/lib/utils';

import type { UserStatusType } from '@lib/types/index';
import type { GradStatusRequestBody, GradStatusResponseType, TakenCourseType } from '@lib/types/grad';
import { gradStatusFetchFn, inferEntryYear, toTakenCourses } from '@utils/graduation/grad-status-helper';
import { useGraduationStore } from '../../lib/stores/useGraduationStore';
import { PARSED_EDITABLE_STATE_KEY } from '../../lib/stores/storage-key';
import { uploadGradeReportViaApi } from '@utils/graduation/upload-grade-report-via-api';

type GradUploadPanelProps = {
  title?: string;
  redirectTo?: string;
  children?: (ctx: { parsed: UserStatusType | null; gradStatus: GradStatusResponseType | null }) => React.ReactNode;
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

            <div className="flex flex-wrap gap-2">
              <Button onClick={open} variant="outline" size="sm">
                파일 선택
              </Button>
              <Button
                onClick={handleParse}
                disabled={!file || isParsing}
                size="sm"
                className="bg-[#0B62DA] text-white hover:bg-[#0952B8]"
              >
                파싱 및 졸업요건 계산
              </Button>
              <Button onClick={onDownload} disabled={!parsed} variant="outline" size="sm">
                JSON 다운로드
              </Button>
              <Button variant="outline" onClick={handleReset} size="sm" className="text-gray-500">
                리셋
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isParsing && <Loading content="파싱 중입니다..." />}

      {isFetchingGradStatus && <div className="text-muted-foreground mt-2 text-sm">졸업요건 계산 중입니다...</div>}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm whitespace-pre-line text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span className="font-semibold">오류:</span> {error}
        </div>
      )}

      {children && <div className="mt-6">{children({ parsed, gradStatus })}</div>}
    </div>
  );
}
