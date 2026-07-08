import React from 'react';
import { NextSeo } from 'next-seo';
import { GetStaticProps } from 'next';
import { TimetableHome } from '@/features/timetable/components/TimetableHome';
import {
  getDefaultTimetableSource,
  TIMETABLE_SOURCES,
  type TimetableSourceManifestEntry,
} from '@/features/course-catalog/timetable-sources';

interface TimetablePageProps {
  defaultTerm: string;
  timetableSources: TimetableSourceManifestEntry[];
}

export default function TimetablePage({ defaultTerm, timetableSources }: TimetablePageProps) {
  return (
    <>
      <NextSeo title="시간표 홈" description="시간표 계획과 이전 시간표를 확인하세요" noindex />
      <div className="fixed inset-0 top-[60px] flex flex-col overflow-hidden bg-slate-100 transition-all duration-300 xl:top-0 xl:left-[256px]">
        <TimetableHome defaultTerm={defaultTerm} timetableSources={timetableSources} />
      </div>
    </>
  );
}

// Support for collapsed sidebar alignment (using CSS classes mirroring Layout.tsx)
// Actually, TimetableLayout already handles internal padding.
// The "fixed inset-0" ensures no scrollbars from the main app scroll container.

export const getStaticProps: GetStaticProps<TimetablePageProps> = async () => {
  try {
    const entries = [...TIMETABLE_SOURCES];

    return {
      props: {
        defaultTerm: getDefaultTimetableSource().term,
        timetableSources: entries,
      },
    };
  } catch (error) {
    console.error('Failed to load timetable data', error);
    return {
      props: {
        defaultTerm: '',
        timetableSources: [],
      },
    };
  }
};
