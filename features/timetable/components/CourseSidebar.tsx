import React, { useMemo } from 'react';
import { useTimetableStore } from '@/lib/stores/timetable.store';
import { createLegacySectionBrowsingAdapter } from '@/features/timetable/section-browsing-adapters';
import { SectionBrowserSidebar } from './SectionBrowserSidebar';

interface CourseSidebarProps {
  term: string;
  isMobile?: boolean;
}

export function CourseSidebar({ term, isMobile = false }: CourseSidebarProps) {
  const selectedSections = useTimetableStore((state) => state.selectedSections);
  const scheduledSpans = useTimetableStore((state) => state.scheduledSpans);
  const addSection = useTimetableStore((state) => state.addSection);
  const removeSection = useTimetableStore((state) => state.removeSection);
  const setPreview = useTimetableStore((state) => state.setPreview);

  const interaction = useMemo(
    () =>
      createLegacySectionBrowsingAdapter({
        selectedSections,
        scheduledSpans,
        add: (section) => void addSection(section),
        removeByLegacyId: removeSection,
        preview: setPreview,
      }),
    [addSection, removeSection, scheduledSpans, selectedSections, setPreview],
  );

  return <SectionBrowserSidebar term={term} interaction={interaction} isMobile={isMobile} />;
}
