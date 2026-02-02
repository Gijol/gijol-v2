import React, { Dispatch, SetStateAction } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  return (
    <div className="mx-auto max-w-[600px]">
      <div className="mb-8 flex justify-center">
        <div className="w-full max-w-xs">
          <label className="mb-2 block text-center text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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

      <div className="mb-2 flex justify-end">
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
              <DialogDescription>아래 순서에 따라 엑셀 파일을 다운로드하고 업로드해주세요.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    1
                  </span>
                  ZEUS 접속하기
                </h3>
                <p className="text-muted-foreground pl-8 text-sm">
                  <a
                    href="https://zeus.gist.ac.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline underline-offset-4 hover:text-blue-600"
                  >
                    zeus.gist.ac.kr
                  </a>
                  에 접속해주세요.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    2
                  </span>
                  개인성적조회 이동
                </h3>
                <p className="text-muted-foreground pl-8 text-sm">
                  상단 메뉴에서 <strong>[성적]</strong> 탭을 누르신 후, <strong>[개인성적조회]</strong> 버튼을
                  클릭해주세요.
                </p>
                <div className="mt-2 pl-8">
                  <img
                    src="/images/explainPic2.png"
                    alt="성적 조회 방법"
                    className="w-full rounded-md border shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    3
                  </span>
                  엑셀 파일 저장
                </h3>
                <p className="text-muted-foreground pl-8 text-sm">
                  화면에 보이는 <strong>[엑셀 저장]</strong> 버튼을 눌러주세요.
                </p>
                <div className="mt-2 pl-8">
                  <img
                    src="/images/explainPic3.png"
                    alt="엑셀 저장 버튼 위치"
                    className="w-full rounded-md border shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    4
                  </span>
                  파일 업로드
                </h3>
                <p className="text-muted-foreground pl-8 text-sm">
                  다운로드 받은 <strong>Report card(KOR)</strong> 엑셀 파일을 이곳에 업로드해주세요.
                </p>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-red-500">
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
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <h4 className="mb-1 font-semibold text-red-600 dark:text-red-400">주의사항</h4>
                    <p className="text-red-600/90 dark:text-red-400/90">
                      반드시 위 경로를 통해 다운로드 받은 엑셀 파일이어야 합니다. 다른 경로의 파일이나 임의로 수정한
                      파일은 서비스 이용이 불가능할 수 있으니 꼭 확인 부탁드려요!
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
          'flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-4 transition-colors dark:bg-slate-950',
          isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700',
          'hover:border-blue-400 dark:hover:border-blue-500',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {!fileInfo ? (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">여기에 다운로드 받은 파일을 업로드 해주세요!</p>
              <Button onClick={open}>파일 선택하기</Button>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-green-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fileInfo.path || fileInfo.name}</p>
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
