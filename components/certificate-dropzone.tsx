import { useDropzone } from 'react-dropzone';
import { Upload, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CertificateDropzone({ onDrop }: { onDrop: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 30 * 1024 * 1024, // 30MB
    multiple: true,
  });

  return (
    <div className="relative">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed bg-white/50 p-8 transition-colors duration-200 ease-in-out dark:bg-slate-950/50',
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-slate-900',
          isDragReject && 'border-red-500 bg-red-50 dark:bg-red-900/20',
        )}
      >
        <input {...getInputProps()} />
        <div className="pointer-events-none flex flex-col items-center justify-center gap-2">
          <div className="flex w-full justify-center">
            {isDragAccept && <Download className="h-8 w-8 text-blue-600" />}
            {isDragReject && <X className="h-8 w-8 text-red-600" />}
            {!isDragActive && <Upload className="h-8 w-8 text-gray-500" />}
          </div>

          <div className="mt-2 text-center">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {isDragAccept
                ? '여기에 파일을 업로드하세요'
                : isDragReject
                  ? '정확한 성적 이수표 엑셀을 업로드 해주세요'
                  : '성적 이수표 업로드 하기'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              <span className="rounded bg-yellow-100 px-1 py-0.5 font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                제우스 {'>'} 자격졸업 {'>'} [R]졸업성적이수표출력
              </span>{' '}
              페이지에서 엑셀 파일을 다운받아 업로드 해주세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
