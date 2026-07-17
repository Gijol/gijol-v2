import type { SectionOffering, SelectedSection, TimetableSpan } from '@/lib/types/timetable';
import { checkConflict } from './conflict';
import { createSectionKey } from './plan-model';

export interface SectionBrowsingInteractionAdapter {
  selectedSectionKeys: ReadonlySet<string>;
  scheduledSpans: readonly TimetableSpan[];
  add(section: SectionOffering): void;
  remove(section: SectionOffering): void;
  preview(section: SectionOffering | null): void;
}

interface PlanInteractionInput {
  selectedSectionKeys: ReadonlySet<string>;
  scheduledSpans: readonly TimetableSpan[];
  add(section: SectionOffering): void;
  removeByKey(sectionKey: string): void;
  preview(section: SectionOffering | null): void;
}

interface LegacyInteractionInput {
  selectedSections: readonly SelectedSection[];
  scheduledSpans: readonly TimetableSpan[];
  add(section: SectionOffering): void;
  removeByLegacyId(sectionId: string): void;
  preview(section: SectionOffering | null): void;
}

export function createPlanSectionBrowsingAdapter(input: PlanInteractionInput): SectionBrowsingInteractionAdapter {
  return {
    selectedSectionKeys: input.selectedSectionKeys,
    scheduledSpans: input.scheduledSpans,
    add: input.add,
    remove: (section) => input.removeByKey(createSectionKey(section)),
    preview: input.preview,
  };
}

export function createLegacySectionBrowsingAdapter(input: LegacyInteractionInput): SectionBrowsingInteractionAdapter {
  const selectedSectionKeys = new Set(input.selectedSections.map((selected) => createSectionKey(selected.section)));

  return {
    selectedSectionKeys,
    scheduledSpans: input.scheduledSpans,
    add: input.add,
    remove: (section) => {
      const sectionKey = createSectionKey(section);
      const selected = input.selectedSections.find((item) => createSectionKey(item.section) === sectionKey);
      if (selected) input.removeByLegacyId(selected.id);
    },
    preview: input.preview,
  };
}

export function projectSectionBrowsingItems(
  sections: readonly SectionOffering[],
  interaction: SectionBrowsingInteractionAdapter,
) {
  const scheduledSpans = [...interaction.scheduledSpans];
  return sections.map((section) => {
    const sectionKey = createSectionKey(section);
    const isAdded = interaction.selectedSectionKeys.has(sectionKey);
    return {
      section,
      sectionKey,
      isAdded,
      isConflict: !isAdded && checkConflict(section, scheduledSpans),
    };
  });
}
