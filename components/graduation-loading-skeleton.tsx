import { Skeleton } from '@components/ui/skeleton';
import React from 'react';

export default function GraduationLoadingSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto px-4">
      <h3 className="mb-6 mt-10 text-xl font-bold">
        종합적인 현황 📋
      </h3>
      <div className="h-4" />
      <Skeleton className="h-[500px] w-full rounded-sm" />
      <div className="h-10" />
      <h3 className="mb-6 mt-10 text-xl font-bold">
        세부적인 현황 📑
      </h3>
      <div className="h-4" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[60px] w-full rounded-sm" />
        <Skeleton className="h-[60px] w-full rounded-sm" />
        <Skeleton className="h-[60px] w-full rounded-sm" />
        <Skeleton className="h-[60px] w-full rounded-sm" />
        <Skeleton className="h-[60px] w-full rounded-sm" />
        <Skeleton className="h-[60px] w-full rounded-sm" />
        <Skeleton className="h-[60px] w-full rounded-sm" />
      </div>
      <div className="h-4" />
      <h3 className="mb-6 mt-10 text-xl font-bold">
        영역별 피드백 모음
      </h3>
      <div className="h-4" />
      <Skeleton className="h-[360px] w-full rounded-sm" />
      <div className="h-20" />
    </div>
  );
}
