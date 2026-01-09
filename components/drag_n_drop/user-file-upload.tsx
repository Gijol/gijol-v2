import React, { Dispatch, SetStateAction } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extend File interface to include path if needed, or just use File
// react-dropzone usually handles standard File objects.
// If FileWithPath is strictly needed by the parent, we might need to cast or import it from react-dropzone if available,
// but usually standard File is sufficient.
interface FileWithPath extends File {
  path?: string;
}

export default function UserFileUpload({
  fileInfo,
  setFileInfo,
  setMajor,
}: {
  fileInfo: FileWithPath | undefined;
  setFileInfo: Dispatch<SetStateAction<FileWithPath | undefined>>;
  setMajor: Dispatch<SetStateAction<string | null>>;
}) {
  const onDrop = (files: File[]) => {
    if (files.length > 0) {
      setFileInfo(files[0] as FileWithPath);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // Equivalent to activateOnClick={false}
    maxFiles: 1,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-xs">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-center">
            전공을 선택해주세요
          </label>
          <Select onValueChange={(value) => setMajor(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="여기를 누르세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EC">전기전자컴퓨터공학전공</SelectItem>
              <SelectItem value="MA">신소재공학전공</SelectItem>
              <SelectItem value="EV">지구환경공학전공</SelectItem>
              <SelectItem value="BS">생명과학전공</SelectItem>
              <SelectItem value="CH">화학전공</SelectItem>
              <SelectItem value="MC">기계공학전공</SelectItem>
              <SelectItem value="PS">물리광과학전공</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "h-[400px] border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors bg-white dark:bg-slate-950",
          isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700",
          "hover:border-blue-400 dark:hover:border-blue-500"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {!fileInfo ? (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                여기에 다운로드 받은 파일을 업로드 해주세요!
              </p>
              <Button onClick={open}>
                파일 선택하기
              </Button>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-green-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {fileInfo.path || fileInfo.name}
              </p>
              <Button variant="outline" onClick={open}>
                파일 바꾸기
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
