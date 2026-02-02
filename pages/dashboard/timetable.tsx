import React from 'react';
import { NextSeo } from 'next-seo';
import path from 'path';
import fs from 'fs/promises';
import { GetStaticProps } from 'next';
import { SectionOffering } from '@/lib/types/timetable';
import { TimetableLayout } from '@/features/timetable/components/TimetableLayout';

interface TimetablePageProps {
  sections: SectionOffering[];
}

export default function TimetablePage({ sections }: TimetablePageProps) {
  return (
    <>
      <NextSeo title="시간표 생성기" description="드래그 앤 드롭으로 시간표를 만들어보세요" noindex />
      <div className="fixed inset-0 top-[60px] flex flex-col overflow-hidden bg-slate-100 transition-all duration-300 xl:top-0 xl:left-[256px]">
        <TimetableLayout sections={sections} />
      </div>
    </>
  );
}

// Support for collapsed sidebar alignment (using CSS classes mirroring Layout.tsx)
// Actually, TimetableLayout already handles internal padding.
// The "fixed inset-0" ensures no scrollbars from the main app scroll container.

export const getStaticProps: GetStaticProps<TimetablePageProps> = async () => {
  try {
    const jsonPath = path.join(process.cwd(), 'DB', 'timetable', '2026_spring_course_info.normalized.json');
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);
    const sections: SectionOffering[] = data.items || [];

    return {
      props: {
        sections,
      },
    };
  } catch (error) {
    console.error('Failed to load timetable data', error);
    return {
      props: {
        sections: [],
      },
    };
  }
};
