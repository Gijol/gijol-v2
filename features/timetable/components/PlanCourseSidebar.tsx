import React, { useMemo } from 'react';
import type { SectionOffering, TimetableSpan } from '@/lib/types/timetable';
import { useTimetablePlanStore } from '@/lib/stores/timetable-plan.store';
import { createPlanSectionBrowsingAdapter } from '@/features/timetable/section-browsing-adapters';
import { SectionBrowserSidebar } from './SectionBrowserSidebar';

interface PlanCourseSidebarProps {
  planId: string;
  term: string;
  scheduledSpans: TimetableSpan[];
  selectedSectionKeys: Set<string>;
  isMobile?: boolean;
  className?: string;
  onPreview: (section: SectionOffering | null) => void;
}

export function PlanCourseSidebar({
  planId,
  term,
  scheduledSpans,
  selectedSectionKeys,
  isMobile = false,
  className,
  onPreview,
}: PlanCourseSidebarProps) {
  const addSectionDirect = useTimetablePlanStore((state) => state.addSectionDirect);
  const clearSelectedSectionByKey = useTimetablePlanStore((state) => state.clearSelectedSectionByKey);

  const interaction = useMemo(
    () =>
      createPlanSectionBrowsingAdapter({
        selectedSectionKeys,
        scheduledSpans,
        add: (section) => void addSectionDirect(planId, section),
        removeByKey: (sectionKey) => clearSelectedSectionByKey(planId, sectionKey),
        preview: onPreview,
      }),
    [addSectionDirect, clearSelectedSectionByKey, onPreview, planId, scheduledSpans, selectedSectionKeys],
  );

  return <SectionBrowserSidebar term={term} interaction={interaction} isMobile={isMobile} className={className} />;
}
