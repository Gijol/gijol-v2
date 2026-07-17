import React from 'react';
import { timetableLayout } from '@/components/layouts/timetable-runtime';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { TimetablePlanEditor } from '@/features/timetable/components/TimetablePlanEditor';
import { TIMETABLE_SOURCES } from '@/features/course-catalog/timetable-sources';

export default function TimetablePlanPage() {
  const router = useRouter();
  const planId = typeof router.query.planId === 'string' ? router.query.planId : '';

  return (
    <>
      <NextSeo title="시간표 계획 편집" description="시간표 계획 대안을 편집하세요" noindex />
      <div className="fixed inset-0 top-[60px] flex flex-col overflow-hidden bg-slate-100 xl:top-0 xl:left-[256px]">
        {planId && <TimetablePlanEditor planId={planId} timetableSources={TIMETABLE_SOURCES} />}
      </div>
    </>
  );
}

TimetablePlanPage.getLayout = timetableLayout;
