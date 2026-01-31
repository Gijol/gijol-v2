import React from 'react';
import { Skeleton } from '@components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@components/ui/card';

/**
 * 학적 정보 카드 스켈레톤
 * 파싱 중 입학년도, 전공, 부전공 필드 영역을 표시
 */
export function AcademicInfoSkeleton() {
  return (
    <Card className="border-slate-300 p-0">
      <CardHeader className="border-b border-slate-300 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-36 rounded" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
          {/* 입학년도 */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* 전공 */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* 부전공 */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 수강 목록 테이블 스켈레톤
 * 파싱 중 테이블 영역을 표시
 */
export function CourseListSkeleton() {
  return (
    <Card className="border-slate-300 p-0">
      <CardHeader className="border-b border-slate-300 p-4">
        <Skeleton className="h-5 w-20" />
      </CardHeader>
      <div className="p-4">
        {/* 테이블 헤더 */}
        <div className="mb-3 flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        {/* 테이블 행들 */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 w-[90px] rounded-md" />
              <Skeleton className="h-8 w-[80px] rounded-md" />
              <Skeleton className="h-8 w-[80px] rounded-md" />
              <Skeleton className="h-8 w-[90px] rounded-md" />
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 w-[60px] rounded-md" />
              <Skeleton className="h-8 w-[60px] rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * 전체 업로드 결과 영역 스켈레톤
 */
export function UploadResultSkeleton() {
  return (
    <div className="mt-10 flex flex-col gap-6">
      {/* Section Header */}
      <div>
        <Skeleton className="mb-2 h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* 학적 정보 */}
      <AcademicInfoSkeleton />

      {/* 수강 목록 */}
      <CourseListSkeleton />
    </div>
  );
}
