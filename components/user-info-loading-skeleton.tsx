import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';

export default function UserInfoLoadingSkeleton() {
  return (
    <div className="container max-w-md mx-auto">
      <h2 className="my-8 text-[32px] font-bold">
        내 정보
      </h2>
      <div className="flex gap-10 items-start">
        <Skeleton className="h-[100px] w-[100px] rounded-full mt-4 flex-shrink-0" />
        <div className="w-[40rem] max-w-full">
          <div className="py-2.5 flex flex-col gap-2">
            <Skeleton className="h-[60px] w-full rounded-sm" />
            <Skeleton className="h-[60px] w-full rounded-sm" />
            <Skeleton className="h-[60px] w-full rounded-sm" />
            <Skeleton className="h-[60px] w-full rounded-sm" />
          </div>
          <Separator className="my-3" />
          <div className="ml-2 flex flex-col gap-4">
            <h3 className="mb-4 font-semibold text-base">
              전공 및 파일 수정
            </h3>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[2rem] w-[200px] rounded-sm" />
              <Skeleton className="h-[2rem] w-full rounded-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[2rem] w-[200px] rounded-sm" />
              <Skeleton className="h-[400px] w-full rounded-sm" />
            </div>
          </div>
          <Separator className="my-5" />
        </div>
      </div>
    </div>
  );
}
