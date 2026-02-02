import { Skeleton } from '@components/ui/skeleton';
import React from 'react';

export default function CourseMyLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <h3 className="mb-6 mt-10 text-xl font-bold">내 수강현황 📑</h3>
      <div className="my-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="my-10">
          <Skeleton className="h-[166px] w-full rounded-sm" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[2rem] w-full rounded-sm" />
        <Skeleton className="h-[2rem] w-full rounded-sm" />
        <Skeleton className="h-[2rem] w-full rounded-sm" />
      </div>
    </div>
  );
}

